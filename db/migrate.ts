import { config } from "dotenv";

// โหลด env ก่อนอ่านค่า DB (รองรับ ENV_FILE override สำหรับยิง prod จากเครื่อง)
const envFile = process.env.ENV_FILE;
if (envFile) config({ path: envFile });
config({ path: ".env.local" });
config({ path: ".env" });

import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { scanMigrations, formatViolations } from "./migration-guard";

// โฟลเดอร์ migration (override ได้เพื่อการเทส — ดู db/selftest-migrate.ts)
const MIGRATIONS_FOLDER = process.env.MIGRATIONS_DIR ?? "./drizzle";

/** map folderMillis (when) → tag จาก journal เพื่อข้อความ error ที่อ่านง่าย */
function tagFor(folder: string, whenMillis: number): string {
  try {
    const journal = JSON.parse(readFileSync(`${folder}/meta/_journal.json`, "utf8"));
    const e = (journal.entries as { when: number; tag: string }[]).find(
      (x) => x.when === whenMillis,
    );
    return e?.tag ?? String(whenMillis);
  } catch {
    return String(whenMillis);
  }
}

async function main() {
  // Gate: รันเฉพาะตอน production deploy (Vercel) หรือสั่งบังคับเอง (RUN_MIGRATE=1)
  const onVercelProd = process.env.VERCEL_ENV === "production";
  const forced = process.env.RUN_MIGRATE === "1";
  if (!onVercelProd && !forced) {
    console.log("[migrate] ข้าม — ไม่ใช่ production build และไม่ได้ตั้ง RUN_MIGRATE=1");
    return;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[migrate] ข้าม — ไม่มี DATABASE_URL");
    return;
  }

  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });
  const db = drizzle(client);

  const target = url.startsWith("libsql://") ? "TURSO (remote)" : url;
  console.log(`[migrate] เริ่ม migrate → ${target}`);

  // ───────── guard: กัน migration ที่ไม่ปลอดภัยต่อ zero-downtime ─────────
  // ตารางบันทึก migration (DDL เดียวกับ migrator/baseline) — กัน SELECT พังบน DB ใหม่
  await client.execute(
    "CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (id INTEGER PRIMARY KEY AUTOINCREMENT, hash text NOT NULL, created_at numeric)",
  );
  const stateRes = await client.execute(
    "SELECT count(*) AS n, max(created_at) AS last FROM `__drizzle_migrations`",
  );
  const appliedCount = Number(stateRes.rows[0].n ?? 0);
  const lastCreatedAt = Number(stateRes.rows[0].last ?? 0);

  if (appliedCount === 0) {
    // DB ใหม่ (bootstrap) — baseline จะ INSERT ≥1 แถวเสมอ ดังนั้น count===0 = DB เปล่าจริง
    // ไม่มีข้อมูล/โค้ดเก่าให้พัง (0000 มี CREATE UNIQUE INDEX บนตารางว่าง) → ข้าม guard
    console.log("[migrate] DB ใหม่ (ยังไม่มีประวัติ migration) — ข้ามการตรวจ destructive guard");
  } else if (process.env.ALLOW_DESTRUCTIVE_MIGRATION === "1") {
    console.log("[migrate] ⚠️  ALLOW_DESTRUCTIVE_MIGRATION=1 — ข้าม guard (planned maintenance)");
  } else {
    // คำนวณ pending แบบเดียวกับ migrator: folderMillis > created_at ล่าสุด
    const all = readMigrationFiles({ migrationsFolder: MIGRATIONS_FOLDER });
    const pending = all.filter((m) => lastCreatedAt < m.folderMillis);
    console.log(`[migrate] pending: ${pending.length}`);

    const violations = scanMigrations(
      pending.map((m) => ({
        file: tagFor(MIGRATIONS_FOLDER, m.folderMillis),
        statements: m.sql,
      })),
    );
    if (violations.length > 0) {
      throw new Error(
        "พบ migration ที่ไม่ปลอดภัยต่อ zero-downtime:\n" +
          formatViolations(violations) +
          "\n\nวิธีแก้: ทำเป็น expand/contract หลาย deploy (ดู MIGRATIONS.md)\n" +
          "หรือถ้าตั้งใจทำตอน maintenance window: ตั้ง ALLOW_DESTRUCTIVE_MIGRATION=1",
      );
    }
    console.log(`[migrate] guard ผ่าน — ${pending.length} migration ปลอดภัย (additive)`);
  }

  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  console.log("[migrate] เสร็จสิ้น ✅");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[migrate] ล้มเหลว:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
