import { config } from "dotenv";

// โหลด env ก่อนอ่านค่า DB (รองรับ ENV_FILE override)
const envFile = process.env.ENV_FILE;
if (envFile) config({ path: envFile });
config({ path: ".env.local" });
config({ path: ".env" });

import { createClient } from "@libsql/client";
import { readMigrationFiles } from "drizzle-orm/migrator";

/**
 * Baseline — ปั๊มฐานข้อมูลที่ "มีตารางครบตามสคีมาล่าสุดอยู่แล้ว" (เช่น Turso ที่เคย db:push)
 * ว่า migration ทั้งหมดที่มี "ถูก apply แล้ว" โดยไม่รัน SQL จริง (ไม่ลบ/ไม่แตะข้อมูล)
 *
 * วิธี: สร้างตาราง __drizzle_migrations แล้ว INSERT แถว (hash, created_at) ของแต่ละ
 * migration ตามฟอร์แมตที่ drizzle migrator ใช้ → migrator จะมองว่า apply แล้ว ข้าม CREATE TABLE
 *
 * รันครั้งเดียว: ENV_FILE=.env.local.production npm run db:baseline:prod
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("ไม่มี DATABASE_URL");

  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
  });

  const target = url.startsWith("libsql://") ? "TURSO (remote)" : url;
  console.log(`[baseline] เป้าหมาย → ${target}`);

  // ตารางบันทึก migration (ฟอร์แมตเดียวกับ libsql migrator ของ drizzle)
  await client.execute(
    "CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (id INTEGER PRIMARY KEY AUTOINCREMENT, hash text NOT NULL, created_at numeric)",
  );

  // ถ้ามีแถวอยู่แล้ว = baseline/มีประวัติ migration แล้ว ไม่ทำซ้ำ
  const existing = await client.execute("SELECT count(*) AS n FROM `__drizzle_migrations`");
  if (Number(existing.rows[0].n) > 0) {
    console.log("[baseline] ข้าม — มีประวัติ migration อยู่แล้ว (baseline ไปแล้ว)");
    return;
  }

  // อ่าน hash + folderMillis จากไฟล์ migration ด้วยโค้ดของ drizzle เอง
  const migrations = readMigrationFiles({ migrationsFolder: "./drizzle" });
  if (migrations.length === 0) {
    console.log("[baseline] ไม่พบไฟล์ migration — รัน db:generate ก่อน");
    return;
  }

  for (const m of migrations) {
    await client.execute({
      sql: "INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) VALUES (?, ?)",
      args: [m.hash, m.folderMillis],
    });
    console.log(`[baseline] ปั๊มว่า apply แล้ว: ${m.hash.slice(0, 12)}… (${m.folderMillis})`);
  }

  console.log(`[baseline] เสร็จสิ้น ✅ — ปั๊ม ${migrations.length} migration โดยไม่แตะข้อมูล`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[baseline] ล้มเหลว:", err);
    process.exit(1);
  });
