/**
 * db:selftest — พิสูจน์ว่า migration pipeline "รองรับบน Vercel" โดยไม่ต้อง deploy จริง
 *
 * รัน db/migrate.ts จริง (ผ่าน subprocess) กับ DB ไฟล์ชั่วคราว (.tmp-*.db) — ไม่แตะ DATABASE_URL จริง
 * เคส:
 *   (a) DB ใหม่ → migrate สร้างตารางครบ
 *   (b) migrate ซ้ำ = idempotent (pending 0)
 *   (c) gate: ไม่ตั้ง flag = ข้าม / VERCEL_ENV=production = ทริกเกอร์
 *   (d) guard: DROP TABLE ถูกบล็อก (ไม่แตะ DB) / ALLOW_DESTRUCTIVE_MIGRATION=1 = ผ่าน
 *
 *   npm run db:selftest
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
} from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

const ROOT = process.cwd();
const TSX = path.join(ROOT, "node_modules", ".bin", "tsx");
const TMP_MIG = path.join(ROOT, ".tmp-mig");
const TMP_DBS = [".tmp-a.db", ".tmp-c-skip.db", ".tmp-c-gate.db", ".tmp-d.db"];

const PASSTHRU = new Set([
  "RUN_MIGRATE",
  "VERCEL_ENV",
  "ALLOW_DESTRUCTIVE_MIGRATION",
  "MIGRATIONS_DIR",
  "DATABASE_URL",
  "DATABASE_AUTH_TOKEN",
  "ENV_FILE",
]);

interface RunResult {
  code: number;
  out: string;
}

/** รัน db/migrate.ts ใน subprocess ด้วย env สะอาด (กันตัวแปร migrate รั่วจาก shell) */
function runMigrate(overrides: Record<string, string>): RunResult {
  const env: NodeJS.ProcessEnv = { ...process.env }; // คง PATH/NODE_ENV ฯลฯ
  for (const k of PASSTHRU) delete env[k]; // ตัดตัวแปร migrate ที่อาจรั่วจาก shell
  Object.assign(env, overrides);
  try {
    const out = execFileSync(TSX, ["db/migrate.ts"], {
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, out };
  } catch (e) {
    const err = e as { status?: number; stdout?: string; stderr?: string };
    return { code: err.status ?? 1, out: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

async function tableNames(url: string): Promise<string[]> {
  const c = createClient({ url });
  const r = await c.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  );
  c.close();
  return r.rows.map((x) => String(x.name));
}

function cleanup() {
  for (const f of TMP_DBS) {
    for (const suffix of ["", "-shm", "-wal"]) {
      try {
        rmSync(path.join(ROOT, f + suffix), { force: true });
      } catch {
        /* ignore */
      }
    }
  }
  try {
    rmSync(TMP_MIG, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

const results: { name: string; pass: boolean; detail?: string }[] = [];
function check(name: string, pass: boolean, detail?: string) {
  results.push({ name, pass, detail });
  console.log(`  ${pass ? "✅" : "❌"} ${name}${!pass && detail ? ` — ${detail}` : ""}`);
}

async function main() {
  cleanup();

  // (a) DB ใหม่ → สร้างครบ
  console.log("\n[a] DB ใหม่ → migrate สร้างตารางครบ");
  const a = runMigrate({ DATABASE_URL: "file:.tmp-a.db", RUN_MIGRATE: "1" });
  check("a1 exit 0", a.code === 0, a.out);
  check("a2 ข้าม guard (DB ใหม่)", /DB ใหม่/.test(a.out));
  const expected = [
    "__drizzle_migrations",
    "account",
    "course_sessions",
    "courses",
    "enrollments",
    "session",
    "user",
    "verification",
  ];
  const aTables = await tableNames("file:.tmp-a.db");
  check("a3 ตารางครบ 7 + __drizzle_migrations", expected.every((t) => aTables.includes(t)), aTables.join(","));

  // (b) idempotent
  console.log("\n[b] migrate ซ้ำ = idempotent");
  const b = runMigrate({ DATABASE_URL: "file:.tmp-a.db", RUN_MIGRATE: "1" });
  check("b1 exit 0", b.code === 0, b.out);
  check("b2 pending 0", /pending:\s*0/.test(b.out), b.out);

  // (c) gate
  console.log("\n[c] gate VERCEL_ENV / RUN_MIGRATE");
  const cSkip = runMigrate({ DATABASE_URL: "file:.tmp-c-skip.db" });
  check("c1 ไม่ตั้ง flag = ข้าม", cSkip.code === 0 && /ข้าม — ไม่ใช่ production/.test(cSkip.out), cSkip.out);
  check("c2 ไม่สร้างตารางใน DB", !existsSync(path.join(ROOT, ".tmp-c-skip.db")));
  const cGate = runMigrate({ DATABASE_URL: "file:.tmp-c-gate.db", VERCEL_ENV: "production" });
  check("c3 VERCEL_ENV=production ทริกเกอร์", cGate.code === 0 && /เสร็จสิ้น/.test(cGate.out), cGate.out);

  // (d) guard บล็อก DROP TABLE + override
  console.log("\n[d] guard บล็อก DROP TABLE + override");
  const dInit = runMigrate({ DATABASE_URL: "file:.tmp-d.db", RUN_MIGRATE: "1" });
  check("d0 apply 0000 สำเร็จ", dInit.code === 0, dInit.out);

  // สร้างโฟลเดอร์ migration ปลอม: copy ทุก migration จริง + เพิ่ม drop_courses ต่อท้าย
  // (when ใหม่กว่าทุกตัว → เป็น pending ตัวเดียว → guard ต้องบล็อก)
  mkdirSync(path.join(TMP_MIG, "meta"), { recursive: true });
  const realJournal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const e of realJournal.entries) {
    copyFileSync(`drizzle/${e.tag}.sql`, path.join(TMP_MIG, `${e.tag}.sql`));
  }
  const maxWhen = Math.max(...realJournal.entries.map((e: { when: number }) => e.when));
  const dropEntry = {
    idx: realJournal.entries.length,
    version: realJournal.entries[0].version,
    when: maxWhen + 1000,
    tag: "9999_drop_courses",
    breakpoints: true,
  };
  writeFileSync(path.join(TMP_MIG, "9999_drop_courses.sql"), "DROP TABLE `courses`;");
  writeFileSync(
    path.join(TMP_MIG, "meta", "_journal.json"),
    JSON.stringify(
      {
        version: realJournal.version,
        dialect: realJournal.dialect,
        entries: [...realJournal.entries, dropEntry],
      },
      null,
      2,
    ),
  );

  const dBlock = runMigrate({
    DATABASE_URL: "file:.tmp-d.db",
    RUN_MIGRATE: "1",
    MIGRATIONS_DIR: TMP_MIG,
  });
  check("d1 บล็อก (exit≠0)", dBlock.code !== 0, `code=${dBlock.code}`);
  check("d2 ข้อความชี้ DROP TABLE", /ไม่ปลอดภัย/.test(dBlock.out) && /drop table/i.test(dBlock.out), dBlock.out);
  const afterBlock = await tableNames("file:.tmp-d.db");
  check("d3 courses ยังอยู่ (ไม่แตะ DB)", afterBlock.includes("courses"));

  const dOverride = runMigrate({
    DATABASE_URL: "file:.tmp-d.db",
    RUN_MIGRATE: "1",
    MIGRATIONS_DIR: TMP_MIG,
    ALLOW_DESTRUCTIVE_MIGRATION: "1",
  });
  check("d4 override ผ่าน (exit 0)", dOverride.code === 0, dOverride.out);
  const afterOverride = await tableNames("file:.tmp-d.db");
  check("d5 courses ถูก drop แล้ว", !afterOverride.includes("courses"));

  cleanup();

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`\n=== selftest: ${passed}/${total} ผ่าน ===`);
  if (passed !== total) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  cleanup();
  process.exit(1);
});
