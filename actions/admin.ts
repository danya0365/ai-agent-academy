"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { enrollments, bookingHours } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { confirmEnrollment } from "@/lib/enrollment-confirm";
import { releaseSlot } from "@/lib/booking-repo";
import { WEEKDAY_TH } from "@/lib/format";

type ActionResult = { ok: true } | { ok: false; error: string };

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
