import type { EnrollmentStatus, CourseType } from "@/db/schema";

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeStyle: "short",
});
const dateOnlyFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "long" });

// ── formatter ที่ล็อกโซนเวลาไทย (สำหรับระบบจองคิว — ต้องไม่เพี้ยนตาม TZ ของ server) ──
const bkkDateTimeFmt = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});
const bkkTimeFmt = new Intl.DateTimeFormat("th-TH", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Bangkok",
});
const bkkDayFmt = new Intl.DateTimeFormat("th-TH", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "Asia/Bangkok",
});

export function formatDateTime(d: Date | number | null | undefined): string {
  if (d == null) return "-";
  return dateFmt.format(new Date(d));
}

export function formatDate(d: Date | number | null | undefined): string {
  if (d == null) return "-";
  return dateOnlyFmt.format(new Date(d));
}

/** วัน-เวลาแบบเต็ม โซนไทย เช่น "25 กรกฎาคม 2569 09:00" — ใช้กับคิวที่จอง */
export function formatBkkDateTime(d: Date | number | null | undefined): string {
  if (d == null) return "-";
  return bkkDateTimeFmt.format(new Date(d));
}

/** เฉพาะเวลา โซนไทย เช่น "09:00" — ใช้กับปุ่ม slot */
export function formatBkkTime(d: Date | number): string {
  return bkkTimeFmt.format(new Date(d));
}

/** หัววัน โซนไทย เช่น "ศุกร์ 25 กรกฎาคม" — ใช้กับ header ของกลุ่มวัน */
export function formatBkkDay(d: Date | number): string {
  return bkkDayFmt.format(new Date(d));
}

/** ชื่อวันภาษาไทย index ตาม weekday ของ JS (0=อาทิตย์ .. 6=เสาร์) */
export const WEEKDAY_TH = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
] as const;

/** ความยาวเป็นนาที → ข้อความ เช่น 90 → "1 ชม. 30 นาที", 60 → "1 ชม.", 30 → "30 นาที" */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h} ชม. ${m} นาที`;
  if (h) return `${h} ชม.`;
  return `${m} นาที`;
}

export function formatBaht(amount: number): string {
  return new Intl.NumberFormat("th-TH").format(amount) + " บาท";
}

export const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  pending_payment: "รอชำระเงิน",
  slip_uploaded: "รอตรวจสอบสลิป",
  confirmed: "ยืนยันแล้ว",
  rejected: "สลิปไม่ผ่าน",
};

// ใช้ token utilities (semantic theme) — สลับธีม/ดาร์กได้
export const STATUS_COLORS: Record<EnrollmentStatus, string> = {
  pending_payment: "bg-warning-surface text-warning",
  slip_uploaded: "bg-brand-100 text-brand-700",
  confirmed: "bg-success-surface text-success",
  rejected: "bg-error-surface text-error",
};

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  scheduled: "มีรอบเรียน",
  open: "เรียนได้ทันที",
  booking: "จองเวลาเอง",
};
