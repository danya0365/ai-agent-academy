"use server";

import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courses, courseSessions, enrollments } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { saveSlip, SlipValidationError } from "@/lib/storage";
import { getReservedSeatsBySession } from "@/lib/queries";

type ActionResult = { ok: false; error: string };

/**
 * สมัครเรียน: สร้าง enrollment สถานะ pending_payment แล้วพาไปหน้าจ่ายเงิน
 * - คอร์ส scheduled ต้องเลือก session
 * - กันสมัครซ้ำ (ถ้ามี enrollment ที่ยัง active อยู่)
 * - soft seat check
 */
export async function enroll(
  courseId: string,
  sessionId?: string | null,
): Promise<ActionResult> {
  const user = await requireUser();

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  if (!course || !course.isPublished) {
    return { ok: false, error: "ไม่พบคอร์สนี้" };
  }

  let validSessionId: string | null = null;

  if (course.type === "scheduled") {
    if (!sessionId) return { ok: false, error: "กรุณาเลือกรอบเรียน" };
    const session = await db
      .select()
      .from(courseSessions)
      .where(eq(courseSessions.id, sessionId))
      .get();
    if (!session || session.courseId !== courseId || !session.isOpen) {
      return { ok: false, error: "รอบเรียนนี้ไม่เปิดรับสมัครแล้ว" };
    }
    // soft seat check
    const reserved = await getReservedSeatsBySession([sessionId]);
    if ((reserved.get(sessionId) ?? 0) >= session.capacity) {
      return { ok: false, error: "รอบนี้ที่นั่งเต็มแล้ว" };
    }
    validSessionId = sessionId;
  }

  // กันสมัครซ้ำในคอร์สเดียวกัน (ยกเว้นที่ถูก reject ไปแล้ว)
  const existing = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, user.id),
        eq(enrollments.courseId, courseId),
        ne(enrollments.status, "rejected"),
      ),
    )
    .get();
  if (existing) {
    redirect(`/enrollments/${existing.id}/pay`);
  }

  const id = randomUUID();
  await db
    .insert(enrollments)
    .values({
      id,
      userId: user.id,
      courseId,
      sessionId: validSessionId,
      status: "pending_payment",
      amount: course.price,
    })
    .run();

  revalidatePath("/my-courses");
  redirect(`/enrollments/${id}/pay`);
}

/**
 * อัปโหลดสลิป (ครั้งแรก หรืออัปใหม่หลังถูก reject)
 */
export async function uploadSlip(
  enrollmentId: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();

  const enrollment = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.id, enrollmentId))
    .get();

  if (!enrollment || enrollment.userId !== user.id) {
    return { ok: false, error: "ไม่พบรายการลงทะเบียน" };
  }
  if (enrollment.status !== "pending_payment" && enrollment.status !== "rejected") {
    return { ok: false, error: "รายการนี้ไม่สามารถอัปโหลดสลิปได้ในขณะนี้" };
  }

  const file = formData.get("slip");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "กรุณาแนบรูปสลิป" };
  }

  let key: string;
  try {
    key = await saveSlip(file);
  } catch (e) {
    if (e instanceof SlipValidationError) return { ok: false, error: e.message };
    throw e;
  }

  await db
    .update(enrollments)
    .set({
      slipPath: key,
      slipUploadedAt: new Date(),
      status: "slip_uploaded",
      rejectReason: null,
      reviewedAt: null,
    })
    .where(eq(enrollments.id, enrollmentId))
    .run();

  revalidatePath("/my-courses");
  revalidatePath(`/enrollments/${enrollmentId}/pay`);
  redirect("/my-courses");
}
