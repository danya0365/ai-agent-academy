import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { db } from "../index";
import { user } from "../schema";
import { auth } from "../../lib/auth";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

/** วันที่ +N วันจากวันนี้ ตั้งชั่วโมง/นาที (เวลาท้องถิ่นเซิร์ฟเวอร์) */
export function daysFromNow(days: number, hour = 9, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** DATABASE_URL ชี้ไป remote (Turso) หรือไม่ — ใช้กัน mock ลง production */
export function isRemoteDb(): boolean {
  const url = process.env.DATABASE_URL || "";
  return !url.startsWith("file:");
}

/**
 * สร้าง user ถ้ายังไม่มี (ผ่าน Better Auth เพื่อให้ hash รหัสผ่านถูกต้อง)
 * คืน userId; ตั้ง role ตามที่ระบุ
 */
export async function ensureUser(opts: {
  email: string;
  password: string;
  name: string;
  role?: "customer" | "admin";
}): Promise<string> {
  const role = opts.role ?? "customer";
  const existing = await db.select().from(user).where(eq(user.email, opts.email)).get();
  if (existing) {
    if (existing.role !== role) {
      await db.update(user).set({ role }).where(eq(user.id, existing.id)).run();
    }
    return existing.id;
  }

  await auth.api.signUpEmail({
    body: { email: opts.email, password: opts.password, name: opts.name },
  });
  const created = await db.select().from(user).where(eq(user.email, opts.email)).get();
  if (!created) throw new Error(`สร้าง user ไม่สำเร็จ: ${opts.email}`);
  if (role !== "customer") {
    await db.update(user).set({ role }).where(eq(user.id, created.id)).run();
  }
  return created.id;
}

/**
 * สร้างไฟล์รูปสลิปปลอม (ใช้ QR ของ qrcode เป็นรูปจริง) เขียนลง UPLOAD_DIR
 * คืน key (ชื่อไฟล์) สำหรับเก็บใน enrollments.slipPath
 */
export async function makeSlipImage(label: string): Promise<string> {
  const key = `${randomUUID()}.png`;
  const buffer = await QRCode.toBuffer(`MOCK-SLIP:${label}:${key}`, {
    width: 320,
    margin: 1,
  });
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, key), buffer);
  return key;
}
