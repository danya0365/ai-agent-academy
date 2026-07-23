"use server";

import { randomUUID } from "node:crypto";
import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { courses, courseSessions, enrollments, bookings } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { saveSlip, SlipValidationError } from "@/lib/storage";
import { getReservedSeatsBySession, getBookingHours } from "@/lib/queries";
import { isValidSlot, slotEndEpoch } from "@/lib/booking";
import { claimSlot, releaseSlot, hasSlotLock, overlapWhere } from "@/lib/booking-repo";
import { verifySlip } from "@/lib/slip-verify";
import { confirmEnrollment } from "@/lib/enrollment-confirm";
import { notifyPaymentSlip } from "@/lib/line";
import type { SlipVerifyStatus } from "@/db/schema";

type ActionResult = { ok: false; error: string };

function digitsOnly(s: string | null | undefined): string {
  return (s || "").replace(/\D/g, "");
}

/** เลขผู้รับจากสลิปอาจถูก mask — เทียบ 4 ตัวท้ายกับบัญชี/พร้อมเพย์ที่ตั้งไว้ */
function receiverMatches(receiver: string | null): boolean {
  const r = digitsOnly(receiver);
  if (r.length < 4) return false;
  const candidates = [process.env.PROMPTPAY_ID, process.env.BANK_ACCOUNT_NUMBER]
    .map(digitsOnly)
    .filter((c) => c.length >= 4);
  return candidates.some((c) => c.slice(-4) === r.slice(-4));
}

/** เทียบยอดเงินระดับสตางค์ — กัน floating-point ที่ provider อาจคืนเป็น float (เช่น 1990.00) */
function amountMatches(slipAmount: number, expected: number): boolean {
  return Math.round(slipAmount * 100) === Math.round(expected * 100);
}

/**
 * จองเลขอ้างอิงสลิป (slipTransRef) ผ่าน unique index — กันสลิปซ้ำแบบ atomic
 * คืน false ถ้าชน unique index (สลิปนี้ถูกใช้ไปแล้ว แม้จะอัปพร้อมกันแบบ race)
 */
async function claimTransRef(enrollmentId: string, transRef: string): Promise<boolean> {
  try {
    await db
      .update(enrollments)
      .set({ slipTransRef: transRef })
      .where(eq(enrollments.id, enrollmentId))
      .run();
    return true;
  } catch {
    return false;
  }
}

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
  // คอร์สจองคิวต้องใช้ bookSlot (เลือก slot) — กันเลี่ยงมาลงทะเบียนแบบไม่มีเวลา
  if (course.type === "booking") {
    return { ok: false, error: "คอร์สนี้ต้องจองเวลาเรียนจากหน้าคอร์ส" };
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
 * จองคิว (คอร์ส type 'booking'): เลือก slot เวลา แล้วสร้าง enrollment + จอง lock แบบ atomic
 * - re-validate slot ฝั่ง server (ไม่เชื่อ startEpoch จาก client)
 * - กันจองซ้ำในคอร์สเดียวกัน
 * - insert enrollment + booking ใน transaction เดียว: ชน PK = slot ถูกจองแล้ว → rollback
 */
export async function bookSlot(
  courseId: string,
  startEpoch: number,
): Promise<ActionResult> {
  const user = await requireUser();

  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  if (
    !course ||
    !course.isPublished ||
    course.type !== "booking" ||
    !course.sessionDurationMin
  ) {
    return { ok: false, error: "ไม่พบคอร์สนี้" };
  }

  const durationMin = course.sessionDurationMin;
  const now = Date.now();
  const hours = await getBookingHours();
  if (!isValidSlot(hours, durationMin, startEpoch, now)) {
    return { ok: false, error: "ช่วงเวลานี้ไม่พร้อมให้จองแล้ว กรุณาเลือกเวลาอื่น" };
  }

  // กันจองซ้ำในคอร์สเดียวกัน (ยกเว้นที่ถูก reject ไปแล้ว)
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
  const startAt = new Date(startEpoch);
  const endAt = new Date(slotEndEpoch(startEpoch, durationMin));

  try {
    await db.transaction(async (tx) => {
      // overlap check (global): กันคาบเวลากับคิวอื่น รวมถึงข้ามคอร์ส/กรณี grid ขยับ
      const clash = await tx
        .select({ s: bookings.startAt })
        .from(bookings)
        .where(overlapWhere(startAt, endAt))
        .get();
      if (clash) throw new Error("SLOT_TAKEN");

      await tx
        .insert(enrollments)
        .values({
          id,
          userId: user.id,
          courseId,
          status: "pending_payment",
          amount: course.price,
          bookedStartAt: startAt,
          bookedEndAt: endAt,
        })
        .run();
      // composite PK (courseId, startAt) = atomic guard ชั้นสุดท้าย → ทั้ง txn rollback ถ้าชน
      await tx
        .insert(bookings)
        .values({ courseId, startAt, endAt, enrollmentId: id, userId: user.id })
        .run();
    });
  } catch {
    return { ok: false, error: "ช่วงเวลานี้เพิ่งถูกจองไปแล้ว กรุณาเลือกเวลาอื่น" };
  }

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

  // คอร์สจองคิว: ต้อง claim slot กลับไหม (อัปใหม่หลัง reject = ไม่ถือ lock แล้ว; pending ยังถือ → ข้าม)
  // ตรวจ slot ยัง valid "ก่อน" saveSlip (เป็น pure check ไม่มี side-effect) — กันไฟล์ค้างถ้า slot หมดอายุ
  const needsClaim =
    !!(enrollment.bookedStartAt && enrollment.bookedEndAt) &&
    !(await hasSlotLock(enrollmentId));
  if (needsClaim) {
    const bkCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.id, enrollment.courseId))
      .get();
    const hours = await getBookingHours();
    const valid = isValidSlot(
      hours,
      bkCourse?.sessionDurationMin ?? 0,
      enrollment.bookedStartAt!.getTime(),
      Date.now(),
    );
    if (!valid) {
      return {
        ok: false,
        error: "ช่วงเวลาที่คุณจองผ่านไปแล้วหรือปิดจองแล้ว กรุณาเลือกเวลาใหม่จากหน้าคอร์ส",
      };
    }
  }

  let key: string;
  try {
    key = await saveSlip(file);
  } catch (e) {
    if (e instanceof SlipValidationError) return { ok: false, error: e.message };
    throw e;
  }

  // claim "หลัง" saveSlip สำเร็จ — กัน lock ค้างถ้าไฟล์ไม่ผ่าน (overlap check อยู่ใน claimSlot)
  if (needsClaim) {
    const claimed = await claimSlot({
      courseId: enrollment.courseId,
      startAt: enrollment.bookedStartAt!,
      endAt: enrollment.bookedEndAt!,
      enrollmentId,
      userId: user.id,
    });
    if (!claimed) {
      return {
        ok: false,
        error: "ช่วงเวลาที่คุณจองถูกผู้อื่นจองไปแล้ว กรุณาเลือกเวลาใหม่จากหน้าคอร์ส",
      };
    }
  }

  // บันทึกสลิป + รีเซ็ตผลตรวจเดิม (กรณีอัปใหม่หลังถูก reject)
  await db
    .update(enrollments)
    .set({
      slipPath: key,
      slipUploadedAt: new Date(),
      status: "slip_uploaded",
      rejectReason: null,
      reviewedAt: null,
      slipTransRef: null,
      slipVerifyStatus: null,
      verifyNote: null,
    })
    .where(eq(enrollments.id, enrollmentId))
    .run();

  // ── ตรวจสลิปอัตโนมัติ + auto-approve ─────────────────────────────
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, enrollment.courseId))
    .get();

  let verifyStatus: SlipVerifyStatus;
  let verifyNote: string;
  let autoApproved = false;
  // verify ไม่ผ่านเกณฑ์ (ยอด/บัญชี/สลิปซ้ำ) → auto-reject ให้ผู้ใช้อัปสลิปใหม่ได้ทันที
  let rejected = false;

  const v = await verifySlip(file);

  if (v.status === "unconfigured") {
    verifyStatus = "unconfigured";
    verifyNote = "ระบบตรวจสลิปอัตโนมัติยังไม่เปิดใช้งาน — รอแอดมินตรวจสอบ";
  } else if (v.status === "failed") {
    // provider อ่านสลิป/เชื่อมต่อไม่ได้ — ส่งให้แอดมินตรวจมือ (ไม่ auto-reject)
    verifyStatus = "manual";
    verifyNote = `ตรวจอัตโนมัติไม่ผ่าน: ${v.reason} — รอแอดมินตรวจสอบ`;
  } else if (!amountMatches(v.amount, enrollment.amount)) {
    verifyStatus = "failed";
    verifyNote = `ยอดเงินในสลิป (${v.amount} บาท) ไม่ตรงกับค่าคอร์ส (${enrollment.amount} บาท)`;
    rejected = true;
  } else if (!receiverMatches(v.receiver)) {
    verifyStatus = "failed";
    verifyNote = "บัญชีผู้รับในสลิปไม่ตรงกับบัญชีร้าน";
    rejected = true;
  } else if (!(await claimTransRef(enrollmentId, v.transRef))) {
    // ชน unique index = สลิปนี้ถูกใช้ไปแล้ว (กันทั้งเคสปกติและ race)
    verifyStatus = "failed";
    verifyNote = "สลิปนี้ถูกใช้ไปแล้ว";
    rejected = true;
  } else {
    // ผ่านเกณฑ์ทั้งหมด + จองเลขอ้างอิงแล้ว — ยืนยัน (มี hard seat-check ใน transaction)
    const confirmed = await confirmEnrollment(enrollmentId);
    if (confirmed.ok) {
      verifyStatus = "verified";
      verifyNote = "ตรวจสลิปอัตโนมัติผ่าน — อนุมัติแล้ว";
      autoApproved = true;
    } else {
      // เช่น ที่นั่งเต็ม — ตกไปให้แอดมินตรวจ (เก็บเลขอ้างอิงที่จองไว้)
      verifyStatus = "manual";
      verifyNote = confirmed.error;
    }
  }

  // บันทึกผลตรวจ — slipTransRef เขียนแล้วโดย claimTransRef, status โดย confirmEnrollment
  // ถ้า verify ไม่ผ่านเกณฑ์ → auto-reject พร้อมเหตุผล เพื่อให้ผู้ใช้อัปสลิปใหม่ได้
  await db
    .update(enrollments)
    .set({
      slipVerifyStatus: verifyStatus,
      verifyNote,
      ...(rejected
        ? { status: "rejected", rejectReason: verifyNote, reviewedAt: new Date() }
        : {}),
    })
    .where(eq(enrollments.id, enrollmentId))
    .run();

  // auto-reject คอร์สจองคิว → ปล่อย slot คืนให้คนอื่นจองได้
  if (rejected && enrollment.bookedStartAt) {
    await releaseSlot(enrollmentId);
  }

  // แจ้งเตือน LINE OA ทุกครั้งที่มีการแจ้งโอน (no-op ถ้ายังไม่ตั้งค่า)
  await notifyPaymentSlip({
    courseTitle: course?.title ?? "(ไม่ทราบคอร์ส)",
    customerName: user.name,
    amount: enrollment.amount,
    resultText: autoApproved ? "อนุมัติอัตโนมัติแล้ว" : verifyNote,
    autoApproved,
  });

  revalidatePath("/my-courses");
  revalidatePath(`/enrollments/${enrollmentId}/pay`);
  revalidatePath("/admin/enrollments");
  revalidatePath("/admin");
  redirect("/my-courses");
}
