"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courses, courseSessions, enrollments, bookingHours } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { confirmEnrollment } from "@/lib/enrollment-confirm";
import { releaseSlot } from "@/lib/booking-repo";
import { WEEKDAY_TH } from "@/lib/format";
import type { CourseType } from "@/db/schema";

type ActionResult = { ok: true } | { ok: false; error: string };

function slugify(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || randomUUID().slice(0, 8)
  );
}

type CourseFields = {
  title: string;
  description: string;
  type: CourseType;
  price: number;
  durationMin: number | null;
};

/** อ่าน+ตรวจ field คอร์สจากฟอร์ม (ใช้ร่วมทั้ง create/update) */
function parseCourseFields(formData: FormData): CourseFields | { error: string } {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "") as CourseType;
  const price = Number(formData.get("price"));

  if (!title) return { error: "กรุณากรอกชื่อคอร์ส" };
  if (type !== "scheduled" && type !== "open" && type !== "booking")
    return { error: "กรุณาเลือกประเภทคอร์ส" };
  if (!Number.isFinite(price) || price < 0) return { error: "ราคาไม่ถูกต้อง" };

  let durationMin: number | null = null;
  if (type === "booking") {
    const d = Number(formData.get("sessionDurationMin"));
    if (!Number.isFinite(d) || d < 15 || d > 480)
      return { error: "ความยาวต่อครั้งไม่ถูกต้อง (15–480 นาที)" };
    durationMin = Math.round(d);
  }
  return { title, description, type, price: Math.round(price), durationMin };
}

/* ───────────── ตรวจสลิป ───────────── */

export async function approveEnrollment(id: string): Promise<ActionResult> {
  await requireAdmin();

  const result = await confirmEnrollment(id);
  if (!result.ok) return result;

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
  return { ok: true };
}

export async function rejectEnrollment(
  id: string,
  reason: string,
): Promise<ActionResult> {
  await requireAdmin();
  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "กรุณาระบุเหตุผล" };

  const e = await db.select().from(enrollments).where(eq(enrollments.id, id)).get();
  if (!e) return { ok: false, error: "ไม่พบรายการลงทะเบียน" };
  if (e.status !== "slip_uploaded" && e.status !== "pending_payment") {
    return { ok: false, error: "รายการนี้ไม่สามารถปฏิเสธได้ในขณะนี้" };
  }

  await db
    .update(enrollments)
    .set({ status: "rejected", reviewedAt: new Date(), rejectReason: trimmed })
    .where(eq(enrollments.id, id))
    .run();

  // คอร์สจองคิว → ปล่อย slot คืนให้คนอื่นจองได้ (no-op ถ้าไม่มี lock)
  if (e.bookedStartAt) await releaseSlot(id);

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
  return { ok: true };
}

/* ───────────── คอร์ส ───────────── */

export async function createCourse(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const f = parseCourseFields(formData);
  if ("error" in f) return { ok: false, error: f.error };

  let slug = slugify(String(formData.get("slug") || "") || f.title);
  // กัน slug ซ้ำ
  const dup = await db.select().from(courses).where(eq(courses.slug, slug)).get();
  if (dup) slug = `${slug}-${randomUUID().slice(0, 4)}`;

  await db
    .insert(courses)
    .values({
      id: randomUUID(),
      slug,
      title: f.title,
      description: f.description,
      type: f.type,
      price: f.price,
      sessionDurationMin: f.durationMin,
      isPublished: formData.get("isPublished") === "on",
    })
    .run();

  revalidatePath("/admin/courses");
  revalidatePath("/");
  return { ok: true };
}

export async function updateCourse(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const f = parseCourseFields(formData);
  if ("error" in f) return { ok: false, error: f.error };

  await db
    .update(courses)
    .set({
      title: f.title,
      description: f.description,
      type: f.type,
      price: f.price,
      sessionDurationMin: f.durationMin, // null เมื่อไม่ใช่ booking → เคลียร์ค่าเก่า
      isPublished: formData.get("isPublished") === "on",
    })
    .where(eq(courses.id, id))
    .run();

  revalidatePath("/admin/courses");
  revalidatePath("/");
  revalidatePath(`/courses`);
  return { ok: true };
}

export async function togglePublish(id: string): Promise<ActionResult> {
  await requireAdmin();
  const c = await db.select().from(courses).where(eq(courses.id, id)).get();
  if (!c) return { ok: false, error: "ไม่พบคอร์ส" };
  await db
    .update(courses)
    .set({ isPublished: !c.isPublished })
    .where(eq(courses.id, id))
    .run();
  revalidatePath("/admin/courses");
  revalidatePath("/");
  return { ok: true };
}

/* ───────────── รอบเรียน ───────────── */

export async function createSession(
  courseId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const startStr = String(formData.get("startAt") || "");
  const endStr = String(formData.get("endAt") || "");
  const capacity = Number(formData.get("capacity"));
  const location = String(formData.get("location") || "").trim() || null;

  const startAt = new Date(startStr);
  const endAt = new Date(endStr);
  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()))
    return { ok: false, error: "กรุณาระบุวัน-เวลาให้ถูกต้อง" };
  if (endAt <= startAt)
    return { ok: false, error: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม" };
  if (!Number.isFinite(capacity) || capacity < 1)
    return { ok: false, error: "จำนวนที่นั่งไม่ถูกต้อง" };

  await db
    .insert(courseSessions)
    .values({
      id: randomUUID(),
      courseId,
      startAt,
      endAt,
      capacity: Math.round(capacity),
      location,
      isOpen: true,
    })
    .run();

  revalidatePath(`/admin/courses/${courseId}/sessions`);
  return { ok: true };
}

export async function updateSession(
  sessionId: string,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const s = await db
    .select()
    .from(courseSessions)
    .where(eq(courseSessions.id, sessionId))
    .get();
  if (!s) return { ok: false, error: "ไม่พบรอบเรียน" };

  const startAt = new Date(String(formData.get("startAt") || ""));
  const endAt = new Date(String(formData.get("endAt") || ""));
  const capacity = Number(formData.get("capacity"));
  const location = String(formData.get("location") || "").trim() || null;
  const isOpen = formData.get("isOpen") === "on";

  if (isNaN(startAt.getTime()) || isNaN(endAt.getTime()))
    return { ok: false, error: "กรุณาระบุวัน-เวลาให้ถูกต้อง" };
  if (endAt <= startAt) return { ok: false, error: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่ม" };
  if (!Number.isFinite(capacity) || capacity < 1)
    return { ok: false, error: "จำนวนที่นั่งไม่ถูกต้อง" };

  await db
    .update(courseSessions)
    .set({ startAt, endAt, capacity: Math.round(capacity), location, isOpen })
    .where(eq(courseSessions.id, sessionId))
    .run();

  revalidatePath(`/admin/courses/${s.courseId}/sessions`);
  return { ok: true };
}

export async function deleteSession(sessionId: string): Promise<ActionResult> {
  await requireAdmin();
  const s = await db
    .select()
    .from(courseSessions)
    .where(eq(courseSessions.id, sessionId))
    .get();
  if (!s) return { ok: false, error: "ไม่พบรอบเรียน" };

  // กันลบรอบที่มีคนสมัครอยู่
  const used = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.sessionId, sessionId))
    .get();
  if (used)
    return { ok: false, error: "ลบไม่ได้ เพราะมีผู้สมัครในรอบนี้แล้ว (ปิดรับสมัครแทนได้)" };

  await db.delete(courseSessions).where(eq(courseSessions.id, sessionId)).run();
  revalidatePath(`/admin/courses/${s.courseId}/sessions`);
  return { ok: true };
}

/* ───────────── เวลาทำการ (booking hours) ───────────── */

/** "HH:mm" → นาทีจากเที่ยงคืน (รองรับ "24:00" = 1440); null ถ้ารูปแบบผิด */
function parseHHMM(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 24 || min < 0 || min > 59) return null;
  const total = h * 60 + min;
  return total > 1440 ? null : total;
}

/**
 * บันทึกเวลาทำการทั้งสัปดาห์ (replace-all) — ฟอร์มส่งมาทีละวัน:
 *   d{weekday}_enabled = "on" ถ้าเปิดวันนั้น, d{weekday}_start / d{weekday}_end = "HH:mm"
 * (v1 รองรับ 1 ช่วงต่อวัน — schema เก็บหลายช่วงได้ ต่อยอดภายหลัง)
 */
export async function saveBookingHours(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const rows: {
    id: string;
    weekday: number;
    startMinute: number;
    endMinute: number;
  }[] = [];

  for (let wd = 0; wd < 7; wd++) {
    if (formData.get(`d${wd}_enabled`) !== "on") continue;
    const start = parseHHMM(String(formData.get(`d${wd}_start`) || ""));
    const end = parseHHMM(String(formData.get(`d${wd}_end`) || ""));
    if (start == null || end == null)
      return { ok: false, error: `เวลาวัน${WEEKDAY_TH[wd]}ไม่ถูกต้อง` };
    if (end <= start)
      return { ok: false, error: `วัน${WEEKDAY_TH[wd]}: เวลาปิดต้องอยู่หลังเวลาเปิด` };
    rows.push({ id: randomUUID(), weekday: wd, startMinute: start, endMinute: end });
  }

  await db.transaction(async (tx) => {
    await tx.delete(bookingHours).run();
    if (rows.length) await tx.insert(bookingHours).values(rows).run();
  });

  revalidatePath("/admin/booking-hours");
  return { ok: true };
}
