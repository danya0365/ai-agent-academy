import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { courseSessions, enrollments, bookings } from "@/db/schema";

/**
 * ยืนยันการลงทะเบียน (set confirmed) พร้อม hard seat-check ใน transaction
 * ใช้ร่วมกันทั้ง admin approve (actions/admin.ts) และ auto-approve (uploadSlip)
 *
 * ⚠️ ไม่มีการเช็คสิทธิ์ — ผู้เรียกต้องตรวจสิทธิ์เอง (requireAdmin / requireUser owner)
 */
export async function confirmEnrollment(
  enrollmentId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await db.transaction(async (tx) => {
      const e = await tx
        .select()
        .from(enrollments)
        .where(eq(enrollments.id, enrollmentId))
        .get();
      if (!e) throw new Error("ไม่พบรายการลงทะเบียน");
      if (e.status !== "slip_uploaded") {
        throw new Error("รายการนี้ไม่อยู่ในสถานะรอตรวจสอบ");
      }

      // hard check สำหรับคอร์สจองคิว — lock (bookings row) ต้องยังอยู่
      if (e.bookedStartAt) {
        const lock = await tx
          .select({ courseId: bookings.courseId })
          .from(bookings)
          .where(eq(bookings.enrollmentId, enrollmentId))
          .get();
        if (!lock) throw new Error("ช่วงเวลาที่จองไม่พร้อมใช้งานแล้ว");
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
        .where(eq(enrollments.id, enrollmentId))
        .run();
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}
