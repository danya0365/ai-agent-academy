import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/**
 * เก็บไฟล์สลิปบน local disk (เฟส 1)
 *
 * Production บน serverless (เช่น Vercel) ใช้ local disk ไม่ได้ —
 * ให้เปลี่ยนเฉพาะภายในฟังก์ชันสองตัวนี้เป็น S3/Supabase Storage
 * โดย caller (server actions / route) ไม่ต้องแก้
 */

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_SLIP_BYTES = 5 * 1024 * 1024; // 5MB

export class SlipValidationError extends Error {}

/** บันทึกสลิป คืนค่าเป็น "key" (ชื่อไฟล์) สำหรับเก็บลง DB */
export async function saveSlip(file: File): Promise<string> {
  const ext = ALLOWED_MIME[file.type];
  if (!ext) {
    throw new SlipValidationError("รองรับเฉพาะรูปภาพ JPG, PNG หรือ WEBP");
  }
  if (file.size > MAX_SLIP_BYTES) {
    throw new SlipValidationError("ไฟล์ใหญ่เกินไป (จำกัด 5MB)");
  }

  const key = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, key), buffer);

  return key;
}

/** อ่านสลิปกลับมาเป็น Buffer (ใช้ใน route ที่เช็คสิทธิ์แล้ว) */
export async function readSlip(key: string): Promise<{ buffer: Buffer; contentType: string }> {
  // กัน path traversal — รับเฉพาะชื่อไฟล์
  const safe = path.basename(key);
  const buffer = await readFile(path.join(UPLOAD_DIR, safe));
  const ext = safe.split(".").pop() || "";
  const contentType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return { buffer, contentType };
}
