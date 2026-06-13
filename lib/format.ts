import type { EnrollmentStatus, CourseType } from "@/db/schema";

const dateFmt = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "long",
  timeStyle: "short",
});
const dateOnlyFmt = new Intl.DateTimeFormat("th-TH", { dateStyle: "long" });

export function formatDateTime(d: Date | number | null | undefined): string {
  if (d == null) return "-";
  return dateFmt.format(new Date(d));
}

export function formatDate(d: Date | number | null | undefined): string {
  if (d == null) return "-";
  return dateOnlyFmt.format(new Date(d));
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

export const STATUS_COLORS: Record<EnrollmentStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  slip_uploaded: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export const COURSE_TYPE_LABELS: Record<CourseType, string> = {
  scheduled: "มีรอบเรียน",
  open: "เรียนได้ทันที",
};
