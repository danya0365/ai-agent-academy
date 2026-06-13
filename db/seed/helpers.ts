import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";
import { db } from "../index";
import { courses, courseSessions, user } from "../schema";
import type { CourseType } from "../schema";
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

export type SeedSession = {
  startDay: number;
  durationHours?: number;
  capacity: number;
  location?: string;
};

export type SeedCourse = {
  slug: string;
  title: string;
  description: string;
  type: CourseType;
  price: number;
  isPublished: boolean;
  sessions?: SeedSession[];
};

/**
 * insert คอร์สถ้ายังไม่มี slug นี้ (skip ถ้ามีแล้ว เพื่อไม่ทับค่าที่เจ้าของแก้เอง)
 * คืน courseId (ของใหม่หรือที่มีอยู่) และว่า created ไหม
 */
export async function upsertCourse(
  c: SeedCourse,
): Promise<{ courseId: string; created: boolean }> {
  const existing = await db.select().from(courses).where(eq(courses.slug, c.slug)).get();
  if (existing) return { courseId: existing.id, created: false };

  const courseId = randomUUID();
  await db
    .insert(courses)
    .values({
      id: courseId,
      slug: c.slug,
      title: c.title,
      description: c.description,
      type: c.type,
      price: c.price,
      isPublished: c.isPublished,
    })
    .run();

  for (const s of c.sessions ?? []) {
    await addSession(courseId, s);
  }
  return { courseId, created: true };
}

export async function addSession(courseId: string, s: SeedSession): Promise<void> {
  const startAt = daysFromNow(s.startDay);
  const endAt = new Date(startAt.getTime() + (s.durationHours ?? 6) * 3600 * 1000);
  await db
    .insert(courseSessions)
    .values({
      id: randomUUID(),
      courseId,
      startAt,
      endAt,
      capacity: s.capacity,
      location: s.location ?? "ออนไลน์ผ่าน Zoom",
      isOpen: true,
    })
    .run();
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
