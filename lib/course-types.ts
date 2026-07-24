// ── CourseType: Single source of truth ──
// กำหนด COURSE_TYPE_LABELS เป็น const → derive CourseType จาก key
// ถ้าอยากเพิ่ม type: เพิ่ม key ที่นี่ที่เดียว ไม่ต้องไล่แก้ schema/actions/components

export const COURSE_TYPE_LABELS = {
  self_paced: "เรียนเอง (เอกสาร + วิดีโอ)",
  live: "เรียนสดตัวต่อตัว",
} as const;

export type CourseType = keyof typeof COURSE_TYPE_LABELS;

/** badge CSS class ตาม type */
export function courseTypeBadge(type: CourseType): string {
  return type === "live" ? "bg-brand-100 text-brand-700" : "bg-muted-surface text-muted";
}
