/**
 * เนื้อหาเสริมของหน้าคอร์ส (landing) — เก็บเป็น static data ต่อ slug (เลียนแบบ lib/tips.ts)
 * ไม่แตะ DB · ไม่ต้อง migration · data ล้วน (ห้าม import React)
 *
 * กติกาแสดงผล:
 *  - course-specific (outcomes/curriculum/forWho/highlights/level) → มีก็โชว์ ไม่มีก็ซ่อน section
 *  - generic (includes/faq/instructor) → การันตีมีเสมอผ่าน fallback → คอร์สที่ยังไม่เขียนก็ดูเต็ม
 */

export type CurriculumItem = { title: string; desc?: string };
export type FaqItem = { q: string; a: string };
export type Instructor = { name: string; bio: string; avatar?: string | null };

export type CourseContent = {
  level?: string; // เช่น "ผู้เริ่มต้น" → meta chip
  highlights?: string[]; // จุดเด่นสั้น 2–4 ข้อ → hero visual
  outcomes?: string[]; // "เรียนจบทำอะไรได้" → checklist
  curriculum?: CurriculumItem[]; // เนื้อหาเป็นขั้น → step cards
  forWho?: string[]; // เหมาะกับใคร
  includes?: string[]; // ในคอร์สมีอะไร (generic ได้)
  faq?: FaqItem[]; // คำถามพบบ่อย (generic ได้)
  instructor?: Instructor; // ผู้สอน (generic ได้)
};

// ค่ากลางที่ใช้ร่วมทุกคอร์ส — ทำให้คอร์สที่ยังไม่เขียน content ก็ยังดูเต็ม
const GENERIC = {
  includes: [
    "เข้าถึงเนื้อหาและสไลด์ประกอบทั้งหมด",
    "เวิร์กช็อปลงมือทำจริงระหว่างเรียน",
    "ถาม-ตอบกับผู้สอนในคอมมูนิตี้",
    "อัปเดตเนื้อหาเมื่อเครื่องมือ AI เปลี่ยน",
  ],
  faq: [
    { q: "ต้องมีพื้นฐานมาก่อนไหม", a: "ไม่จำเป็น คอร์สออกแบบให้เริ่มจากศูนย์ได้ ถ้ามีพื้นฐานอยู่แล้วก็จะยิ่งต่อยอดได้เร็วขึ้น" },
    { q: "ชำระเงินอย่างไร", a: "โอนเงินแล้วแนบสลิปในระบบ เราตรวจสอบและยืนยันที่นั่งให้อัตโนมัติ" },
    { q: "ถ้าติดปัญหาระหว่างเรียนถามได้ไหม", a: "ได้ ถามผู้สอนและเพื่อนร่วมคอร์สได้ในคอมมูนิตี้ของเรา" },
  ],
  instructor: {
    name: "ทีมผู้สอน AI Agent Academy",
    bio: "ผู้สอนที่ใช้ AI ทำงานจริงทุกวัน เน้นลงมือทำมากกว่าท่องทฤษฎี พาคุณไปใช้งานได้จริงตั้งแต่วันแรก",
    avatar: null,
  },
} satisfies Required<Pick<CourseContent, "includes" | "faq" | "instructor">>;

// เนื้อหาเฉพาะคอร์ส — เพิ่ม key ใหม่เมื่ออยากให้คอร์สนั้นเด่น (ไม่มี key = ใช้ generic ล้วน)
export const COURSE_CONTENT: Record<string, CourseContent> = {
  "ai-literacy": {
    level: "ผู้เริ่มต้น",
    highlights: ["ไม่ต้องมีพื้นฐาน", "ใช้ได้จริงตั้งแต่วันแรก", "เรียนสด ถาม-ตอบได้"],
    outcomes: [
      "ใช้ ChatGPT, Gemini และ Claude ทำงานประจำวันได้อย่างมั่นใจ",
      "เขียน prompt พื้นฐานให้ได้ผลลัพธ์ตรงกับที่ต้องการ",
      "เลือกเครื่องมือ AI ให้เหมาะกับงานแต่ละแบบ",
      "รู้ทันข้อจำกัดของ AI และใช้อย่างปลอดภัย",
    ],
    curriculum: [
      { title: "รู้จักเครื่องมือ AI ยอดนิยม", desc: "ChatGPT, Gemini, Claude ต่างกันยังไง ตัวไหนเหมาะกับงานแบบไหน" },
      { title: "พื้นฐานการเขียน prompt", desc: "โครงคำสั่งที่ได้ผล บอกบริบท-บทบาท-รูปแบบผลลัพธ์ให้ชัด" },
      { title: "ใช้ AI กับงานจริงประจำวัน", desc: "ร่างอีเมล สรุปเอกสาร แปลภาษา ระดมไอเดีย ผ่านเวิร์กช็อป" },
      { title: "ใช้อย่างปลอดภัยและรู้ทัน", desc: "ตรวจสอบข้อมูล ความเป็นส่วนตัว และข้อจำกัดที่ต้องระวัง" },
    ],
    forWho: [
      "คนทำงานที่อยากเริ่มใช้ AI ให้เป็น",
      "เจ้าของธุรกิจและฟรีแลนซ์ที่อยากทำงานเร็วขึ้น",
      "ผู้ที่ไม่มีพื้นฐานด้านเทคนิคเลย",
    ],
  },
  // คอร์สอื่นค่อยเติมทีหลังได้ — ไม่มี key = ใช้ generic ล้วน (ยังดูเต็ม)
};

// includes/faq/instructor การันตีมีเสมอ; ที่เหลืออาจ undefined → หน้า render เฉพาะที่มี
export type ResolvedCourseContent = CourseContent &
  Required<Pick<CourseContent, "includes" | "faq" | "instructor">>;

export function getCourseContent(slug: string): ResolvedCourseContent {
  const c = COURSE_CONTENT[slug] ?? {};
  return {
    ...c,
    includes: c.includes ?? GENERIC.includes,
    faq: c.faq ?? GENERIC.faq,
    instructor: c.instructor ?? GENERIC.instructor,
  };
}
