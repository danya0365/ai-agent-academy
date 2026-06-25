import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

/**
 * เก็บไฟล์สลิป
 *
 * - Production (Vercel): ใช้ Cloudflare R2 (S3-compatible) เมื่อ env R2_* ครบ
 * - Local dev: ถ้าไม่ได้ตั้ง R2 → fallback เก็บบน local disk (UPLOAD_DIR)
 *
 * caller (server actions / route) ใช้ interface เดิม:
 *   saveSlip(file) → key (ชื่อไฟล์ล้วน)
 *   readSlip(key)  → { buffer, contentType }
 */

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const R2_PREFIX = "slips/"; // โฟลเดอร์ภายใน bucket (DB เก็บแค่ชื่อไฟล์ล้วน)

const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_SLIP_BYTES = 5 * 1024 * 1024; // 5MB

export class SlipValidationError extends Error {}

/**
 * ตรวจ "magic bytes" ของไฟล์จริง — กันไฟล์ปลอมนามสกุล/MIME (เช่น .html/.js/.svg
 * ที่ตั้งชื่อเป็น .png) เพราะ file.type/นามสกุลเชื่อไม่ได้ (client ปลอมได้)
 * คืนนามสกุลตามชนิดจริง หรือ null ถ้าไม่ใช่รูปที่อนุญาต
 */
function sniffImageExt(buf: Buffer): "jpg" | "png" | "webp" | null {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  ) {
    return "png";
  }
  // WEBP = container "RIFF"...."WEBP"
  if (
    buf.length >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

function contentTypeFromKey(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() || "";
  return ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
}

/* ───────────── R2 (S3-compatible) ───────────── */

type R2Config = {
  bucket: string;
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
};

function getR2Config(): R2Config | null {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET;
  const endpoint =
    process.env.R2_ENDPOINT ||
    (process.env.R2_ACCOUNT_ID
      ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : undefined);

  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) return null;
  return { bucket, endpoint, accessKeyId, secretAccessKey };
}

let _client: S3Client | null = null;
function r2Client(cfg: R2Config): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: "auto",
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
    });
  }
  return _client;
}

/* ───────────── public API ───────────── */

/** บันทึกสลิป คืนค่าเป็น "key" (ชื่อไฟล์ล้วน) สำหรับเก็บลง DB */
export async function saveSlip(file: File): Promise<string> {
  if (!ALLOWED_MIME[file.type]) {
    throw new SlipValidationError("รองรับเฉพาะรูปภาพ JPG, PNG หรือ WEBP");
  }
  if (file.size > MAX_SLIP_BYTES) {
    throw new SlipValidationError("ไฟล์ใหญ่เกินไป (จำกัด 5MB)");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // magic-byte: เนื้อไฟล์จริงต้องเป็นรูปที่อนุญาต (ไม่เชื่อ MIME/นามสกุลจาก client)
  const ext = sniffImageExt(buffer);
  if (!ext) {
    throw new SlipValidationError("ไฟล์ไม่ใช่รูปภาพที่ถูกต้อง (JPG, PNG หรือ WEBP)");
  }
  const contentType =
    ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

  const key = `${randomUUID()}.${ext}`;

  const cfg = getR2Config();
  if (cfg) {
    await r2Client(cfg).send(
      new PutObjectCommand({
        Bucket: cfg.bucket,
        Key: R2_PREFIX + key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
  } else {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, key), buffer);
  }

  return key;
}

/** อ่านสลิปกลับมาเป็น Buffer (ใช้ใน route ที่เช็คสิทธิ์แล้ว) */
export async function readSlip(
  key: string,
): Promise<{ buffer: Buffer; contentType: string }> {
  const safe = path.basename(key); // กัน path traversal — รับเฉพาะชื่อไฟล์

  const cfg = getR2Config();
  if (cfg) {
    const res = await r2Client(cfg).send(
      new GetObjectCommand({ Bucket: cfg.bucket, Key: R2_PREFIX + safe }),
    );
    const bytes = await res.Body!.transformToByteArray();
    return {
      buffer: Buffer.from(bytes),
      contentType: res.ContentType || contentTypeFromKey(safe),
    };
  }

  const buffer = await readFile(path.join(UPLOAD_DIR, safe));
  return { buffer, contentType: contentTypeFromKey(safe) };
}
