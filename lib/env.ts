/**
 * โหลด env สำหรับสคริปต์ที่รันนอก Next.js (drizzle-kit, seed)
 * Next.js โหลด .env.local ให้เองอยู่แล้ว — ไฟล์นี้ไว้ใช้ใน config/seed
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

export const env = {
  DATABASE_URL: process.env.DATABASE_URL || "file:./local.db",
  DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN || undefined,
};
