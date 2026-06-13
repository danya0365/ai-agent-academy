"use server";

import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courses, courseSessions, enrollments } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
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

/* ───────────── ตรวจสลิป ───────────── */

export async function approveEnrollment(id: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.transaction(async (tx) => {
      const e = await tx.select().from(enrollments).where(eq(enrollments.id, id)).get();
      if (!e) throw new Error("ไม่พบรายการลงทะเบียน");
      if (e.status !== "slip_uploaded") {
        throw new Error("รายการนี้ไม่อยู่ในสถานะรอตรวจสอบ");
      }

      // hard seat check สำหรับคอร์สที่มีรอบเรียน
      if (e.sessionId) {
        const session = await tx
          .select()
          .from(courseSessions)
          .where(eq(courseSessions.id, e.sessionId))
          .get();
        if (session) {
          const confirmedRows = await tx
            .select()
            .from(enrollments)
            .where(
              and(
                eq(enrollments.sessionId, e.sessionId),
                eq(enrollments.status, "confirmed"),
              ),
            )
            .all();
          if (confirmedRows.length >= session.capacity) {
            throw new Error("รอบนี้ที่นั่งเต็มแล้ว ไม่สามารถยืนยันได้");
          }
        }
      }

      await tx
        .update(enrollments)
        .set({ status: "confirmed", reviewedAt: new Date(), rejectReason: null })
        .where(eq(enrollments.id, id))
        .run();
    });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }

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

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
  return { ok: true };
}

/* ───────────── คอร์ส ───────────── */

export async function createCourse(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "") as CourseType;
  const price = Number(formData.get("price"));

  if (!title) return { ok: false, error: "กรุณากรอกชื่อคอร์ส" };
  if (type !== "scheduled" && type !== "open")
    return { ok: false, error: "กรุณาเลือกประเภทคอร์ส" };
  if (!Number.isFinite(price) || price < 0)
    return { ok: false, error: "ราคาไม่ถูกต้อง" };

  let slug = slugify(String(formData.get("slug") || "") || title);
  // กัน slug ซ้ำ
  const dup = await db.select().from(courses).where(eq(courses.slug, slug)).get();
  if (dup) slug = `${slug}-${randomUUID().slice(0, 4)}`;

  await db
    .insert(courses)
    .values({
      id: randomUUID(),
      slug,
      title,
      description,
      type,
      price: Math.round(price),
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
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "") as CourseType;
  const price = Number(formData.get("price"));

  if (!title) return { ok: false, error: "กรุณากรอกชื่อคอร์ส" };
  if (type !== "scheduled" && type !== "open")
    return { ok: false, error: "กรุณาเลือกประเภทคอร์ส" };
  if (!Number.isFinite(price) || price < 0)
    return { ok: false, error: "ราคาไม่ถูกต้อง" };

  await db
    .update(courses)
    .set({
      title,
      description,
      type,
      price: Math.round(price),
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
