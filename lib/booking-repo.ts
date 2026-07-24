import "server-only";
import { and, eq, gt, lt } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";

/**
 * DB helper สำหรับ "lock" ของระบบจองคิว (ตาราง bookings)
 * แยกจาก lib/booking.ts (pure logic) เพราะแตะ DB
 *
 * กันจองซ้อนด้วย 2 ชั้น: (1) overlap check ในทรานแซกชัน — ครอบคลุมกรณี grid ขยับ/ข้ามคอร์ส
 * (2) composite PK (courseSlug, startAt) — atomic guard ชั้นสุดท้าย.
 */

/** เงื่อนไข "มี booking คาบเวลากับ [startAt, endAt)" — global ทุกคอร์ส */
export function overlapWhere(startAt: Date, endAt: Date) {
  return and(lt(bookings.startAt, endAt), gt(bookings.endAt, startAt));
}

/**
 * claim slot (จอง lock) แบบ atomic: overlap check + insert ในทรานแซกชันเดียว
 * คืน false ถ้าคาบเวลากับคิวอื่น / ชน PK (ช่วงเวลานี้ถูกจองไปแล้ว)
 */
export async function claimSlot(args: {
  courseSlug: string;
  startAt: Date;
  endAt: Date;
  enrollmentId: string;
  userId: string;
}): Promise<boolean> {
  try {
    await db.transaction(async (tx) => {
      const clash = await tx
        .select({ s: bookings.startAt })
        .from(bookings)
        .where(overlapWhere(args.startAt, args.endAt))
        .get();
      if (clash) throw new Error("SLOT_TAKEN");
      await tx.insert(bookings).values(args).run();
    });
    return true;
  } catch {
    return false;
  }
}

/** ปล่อย slot คืน (ลบ lock ของ enrollment นี้) — เรียกตอน reject */
export async function releaseSlot(enrollmentId: string): Promise<void> {
  await db.delete(bookings).where(eq(bookings.enrollmentId, enrollmentId)).run();
}

/** enrollment นี้ยังถือ lock อยู่ไหม */
export async function hasSlotLock(enrollmentId: string): Promise<boolean> {
  const row = await db
    .select({ courseSlug: bookings.courseSlug })
    .from(bookings)
    .where(eq(bookings.enrollmentId, enrollmentId))
    .get();
  return Boolean(row);
}
