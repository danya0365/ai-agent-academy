import { config } from "dotenv";

// โหลด env ก่อนอ่านค่า DB (รองรับ ENV_FILE override สำหรับยิง prod จากเครื่อง)
const envFile = process.env.ENV_FILE;
if (envFile) config({ path: envFile });
config({ path: ".env.local" });
config({ path: ".env" });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";

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
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("[migrate] เสร็จสิ้น ✅");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[migrate] ล้มเหลว:", err);
    process.exit(1);
  });
