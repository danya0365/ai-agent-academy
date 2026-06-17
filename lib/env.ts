/**
 * โหลด env สำหรับสคริปต์ที่รันนอก Next.js (drizzle-kit, seed)
 * Next.js โหลด .env.local ให้เองอยู่แล้ว — ไฟล์นี้ไว้ใช้ใน config/seed
 */
import { config } from "dotenv";

// ENV_FILE override — โหลดก่อนเพื่อให้ได้ precedence (dotenv ไม่ทับ key ที่ถูกตั้งแล้ว)
// ใช้ยิงคำสั่งไปที่ prod จากเครื่อง เช่น ENV_FILE=.env.local.production
const envFile = process.env.ENV_FILE;
if (envFile) config({ path: envFile });

config({ path: ".env.local" });
config({ path: ".env" });

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "file:./local.db",
  DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN || undefined,
};
