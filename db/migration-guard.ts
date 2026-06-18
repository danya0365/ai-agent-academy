/**
 * Migration safety guard — แกนสแกนหา SQL ที่ "ไม่ปลอดภัยต่อ zero-downtime"
 *
 * ใช้ร่วมกันระหว่าง:
 *  - db/migrate.ts        (รันตอน build บน Vercel — บล็อก deploy ถ้าเจอของอันตราย)
 *  - db/check-migrations.ts (สแกน offline หลัง db:generate ก่อน commit)
 *
 * pure ล้วน: ไม่มี DB / env / process.exit → เทสง่ายและไม่มี rule drift
 *
 * เหตุผล: migrate รันตอน build (ก่อนโค้ดใหม่ขึ้น โค้ดเก่ายังเสิร์ฟ) → ปลอดภัยเฉพาะ
 * การเปลี่ยนแบบ additive เท่านั้น ดูรายละเอียด/สูตรแก้ใน MIGRATIONS.md
 *
 * หมายเหตุ: regex จงใจกว้าง — false-positive (เตือนเกิน) ปลอดภัยกว่า false-negative
 * (พลาดของอันตราย) เสมอ ถ้าโดนเตือนทั้งที่ปลอดภัยจริง ใช้ ALLOW_DESTRUCTIVE_MIGRATION=1
 */

export interface Violation {
  file: string; // tag ของ migration เช่น "0003_add_unique"
  statement: string; // statement ที่เข้าข่าย (ตัดสั้น)
  rule: string; // ชื่อกฎที่ละเมิด
}

/** ตัด comment + รวม whitespace + lowercase ก่อน match */
function normalize(stmt: string): string {
  return stmt
    .replace(/\/\*[\s\S]*?\*\//g, " ") // block comment
    .replace(/--[^\n]*/g, " ") // line comment
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const RULES: { name: string; test: (s: string) => boolean }[] = [
  { name: "DROP TABLE", test: (s) => /\bdrop\s+table\b/.test(s) },
  { name: "DROP COLUMN", test: (s) => /\bdrop\s+column\b/.test(s) },
  {
    name: "RENAME (table/column)",
    test: (s) => /\balter\s+table\b[\s\S]*\brename\b/.test(s),
  },
  {
    name: "ADD COLUMN NOT NULL ไม่มี DEFAULT",
    test: (s) =>
      /\balter\s+table\b/.test(s) &&
      /\badd\b/.test(s) &&
      /\bnot\s+null\b/.test(s) &&
      !/\bdefault\b/.test(s),
  },
  { name: "CREATE UNIQUE INDEX", test: (s) => /\bcreate\s+unique\s+index\b/.test(s) },
];

/**
 * recreate-table pattern — วิธีที่ drizzle-kit ใช้เลี่ยงข้อจำกัด ALTER ของ SQLite
 * (drop/rename/เปลี่ยน type ของคอลัมน์): สร้าง `__new_*` → INSERT…SELECT → DROP → RENAME
 * ตรวจระดับ "ทั้ง migration" เพราะกระจายหลาย statement
 */
function hasRecreatePattern(normStatements: string[]): boolean {
  const joined = normStatements.join("\n");
  if (/create\s+table\s+[`"]?__new_/.test(joined)) return true;
  return /\binsert\s+into\b[\s\S]*\bselect\b/.test(joined) && /\bdrop\s+table\b/.test(joined);
}

/** สแกน migration เดียว (อาเรย์ของ statement ที่ drizzle จะรันจริง) */
export function scanMigration(file: string, statements: string[]): Violation[] {
  const norm = statements.map(normalize);
  const out: Violation[] = [];

  if (hasRecreatePattern(norm)) {
    out.push({
      file,
      statement: "(recreate-table: CREATE __new_/INSERT…SELECT/DROP/RENAME)",
      rule: "SQLite recreate-table (drop/rename/เปลี่ยน type)",
    });
  }

  for (let i = 0; i < statements.length; i++) {
    const s = norm[i];
    if (!s) continue;
    for (const r of RULES) {
      if (r.test(s)) {
        out.push({
          file,
          statement: statements[i].trim().replace(/\s+/g, " ").slice(0, 200),
          rule: r.name,
        });
      }
    }
  }
  return out;
}

/** สแกนหลาย migration (ผู้เรียกกรอง pending มาแล้ว) */
export function scanMigrations(
  migrations: { file: string; statements: string[] }[],
): Violation[] {
  return migrations.flatMap((m) => scanMigration(m.file, m.statements));
}

export function formatViolations(violations: Violation[]): string {
  return violations
    .map((v) => `  • [${v.rule}] ${v.file}\n      ${v.statement}`)
    .join("\n");
}
