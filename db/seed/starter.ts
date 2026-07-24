import { randomUUID } from "node:crypto";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../index";
import { courses, enrollments, bookingHours } from "../schema";
import { upsertCourse, type SeedCourse } from "./helpers";

/**
 * starter seed — แคตตาล็อกคอร์สจริงที่ร้านจะเปิดสอน
 * คอร์สพื้นฐานเปิด (isPublished=true) ส่วนคอร์สขั้นสูง/เฉพาะทางปิดไว้ก่อน
 * เจ้าของกดเปิดเองภายหลังที่หน้าแอดมิน
 * ปลอดภัยรันบน production (insert-if-absent — ไม่ทับค่าที่แก้เอง)
 */

export const STARTER_COURSES: SeedCourse[] = [
  // ───────── เปิด (published) — พื้นฐาน ─────────
  {
    slug: "ai-literacy",
    title: "เริ่มต้นใช้ AI ใน 1 วัน (สำหรับทุกคน)",
    description:
      "คอร์สปูพื้นสำหรับผู้เริ่มต้นที่ไม่มีพื้นฐานด้านเทคนิค รู้จักเครื่องมือ AI ยอดนิยม " +
      "อย่าง ChatGPT, Gemini และ Claude เข้าใจว่า AI ทำอะไรได้บ้าง พร้อมฝึกเขียนคำสั่ง (prompt) " +
      "พื้นฐานและนำไปใช้ในชีวิตประจำวันได้ทันทีหลังเรียนจบ",
    type: "live",
    price: 1990,
    sessionDurationMin: 90,
    isPublished: true,
  },
  {
    slug: "prompt-engineering",
    title: "เขียน Prompt ระดับโปร (Prompt Engineering)",
    description:
      "ยกระดับการสั่งงาน AI ให้ได้ผลลัพธ์แม่นยำและเป็นมืออาชีพ เรียนรู้เทคนิคการออกแบบ prompt, " +
      "การให้บริบทและตัวอย่าง, การแบ่งงานเป็นขั้นตอน และการตรวจสอบ/ปรับปรุงคำตอบ " +
      "เหมาะกับคนที่ใช้ AI อยู่แล้วแต่อยากได้ผลลัพธ์ที่ดีขึ้น",
    type: "live",
    price: 2490,
    isPublished: true,
    sessionDurationMin: 90,
  },
  {
    slug: "ai-for-office",
    title: "AI สำหรับงานออฟฟิศและเอกสาร",
    description:
      "ใช้ AI ช่วยงานเอกสารและงานประจำวัน เขียนและสรุปอีเมล สรุปการประชุม ร่างเอกสาร " +
      "ทำสไลด์นำเสนอ และจัดการข้อมูลใน Excel/Google Sheets ลดเวลางานซ้ำ ๆ พร้อมเวิร์กช็อปลงมือทำจริง",
    type: "live",
    price: 2990,
    isPublished: true,
    sessionDurationMin: 90,
  },
  {
    slug: "ai-content-marketing",
    title: "AI สร้างคอนเทนต์และการตลาด",
    description:
      "สร้างคอนเทนต์การตลาดด้วย AI ตั้งแต่วางแผนคอนเทนต์ เขียนแคปชัน/บทความ ทำภาพประกอบ " +
      "และสคริปต์วิดีโอสั้น เพิ่มความเร็วในการผลิตสื่อให้ธุรกิจและเพจของคุณ",
    type: "live",
    price: 3490,
    isPublished: true,
    sessionDurationMin: 60,
  },
  {
    slug: "ai-coding-assistant",
    title: "เขียนโค้ดเร็วขึ้นด้วย AI (Cursor / Claude Code / Copilot)",
    description:
      "สำหรับนักพัฒนาที่อยากทำงานเร็วขึ้นด้วย AI coding assistant เรียนรู้การใช้ Cursor, " +
      "Claude Code และ GitHub Copilot ในงานจริง ตั้งแต่เขียนฟีเจอร์ แก้บั๊ก เขียนเทสต์ " +
      "ไปจนถึงรีแฟกเตอร์โค้ดทั้งโปรเจกต์",
    type: "live",
    price: 3990,
    isPublished: true,
    sessionDurationMin: 90,
  },
  {
    slug: "vibe-coding",
    title: "สร้างแอปด้วย AI แบบไม่ต้องเขียนโค้ด",
    description:
      "สร้างเว็บและแอปของคุณเองด้วย AI โดยไม่ต้องมีพื้นฐานเขียนโปรแกรม เรียนรู้แนวทาง vibe coding " +
      "และเครื่องมือ no-code/AI ที่เปลี่ยนไอเดียเป็นแอปใช้งานได้จริง คอร์สนี้เรียนได้ทันทีตามสะดวก",
    type: "self_paced",
    price: 2990,
    isPublished: true,
  },

  // ───────── ปิดไว้ก่อน (isPublished=false) — เปิดภายหลัง ─────────
  {
    slug: "ai-image-design",
    title: "สร้างภาพและงานออกแบบด้วย AI (Midjourney / Canva AI)",
    description:
      "สร้างภาพคุณภาพสูงและงานออกแบบด้วย AI เรียนรู้ Midjourney, DALL·E และ Canva AI " +
      "ตั้งแต่การเขียน prompt ภาพ การปรับแต่ง ไปจนถึงการนำไปใช้ในงานจริง",
    type: "live",
    price: 3490,
    isPublished: false,
    sessionDurationMin: 60,
  },
  {
    slug: "ai-data-analysis",
    title: "วิเคราะห์ข้อมูลด้วย AI (Sheets / Excel + AI)",
    description:
      "ใช้ AI ช่วยวิเคราะห์ข้อมูลธุรกิจ ทำความสะอาดข้อมูล สร้างสูตรและสรุปผลใน Excel/Google Sheets " +
      "พร้อมทำแดชบอร์ดและตีความข้อมูลเพื่อการตัดสินใจ",
    type: "live",
    price: 3990,
    isPublished: false,
    sessionDurationMin: 90,
  },
  {
    slug: "ai-automation",
    title: "ทำงานอัตโนมัติด้วย AI (n8n / Make / Zapier)",
    description:
      "เชื่อมต่อระบบและทำงานอัตโนมัติด้วย AI สร้าง workflow อัตโนมัติด้วย n8n, Make และ Zapier " +
      "เช่น ตอบลูกค้าอัตโนมัติ สรุปข้อมูลเข้า Sheet และแจ้งเตือนทีม",
    type: "live",
    price: 4490,
    isPublished: false,
    sessionDurationMin: 90,
  },
  {
    slug: "build-ai-agent",
    title: "สร้าง AI Agent / Chatbot ของคุณเอง",
    description:
      "สร้างผู้ช่วย AI และแชตบอตของคุณเองตั้งแต่ต้น เข้าใจสถาปัตยกรรม agent การเชื่อมต่อเครื่องมือ " +
      "(tools) และฐานความรู้ (RAG) พร้อมนำไปใช้กับงานหรือธุรกิจจริง",
    type: "live",
    price: 5990,
    isPublished: false,
    sessionDurationMin: 120,
  },
  {
    slug: "ai-for-business",
    title: "เวิร์กช็อป AI สำหรับองค์กร (In-house)",
    description:
      "หลักสูตรอบรมภายในองค์กร ออกแบบเนื้อหาเฉพาะตามงานและอุตสาหกรรมของทีมคุณ " +
      "วางกลยุทธ์การนำ AI มาใช้และเพิ่มผลิตภาพทั้งทีม ราคาขึ้นกับขอบเขต — ติดต่อสอบถาม",
    type: "self_paced",
    price: 0,
    isPublished: false,
  },
];

// คอร์สตัวอย่างชุดเดิม (เดโม) — ลบทิ้งได้ถ้าไม่มีคนสมัคร เพื่อให้ catalog สะอาด
const DEMO_SLUGS = ["ai-basics", "ai-for-work", "ai-for-developers"];

export async function cleanupDemoCourses(): Promise<void> {
  const demoCourses = await db
    .select()
    .from(courses)
    .where(inArray(courses.slug, DEMO_SLUGS))
    .all();

  for (const c of demoCourses) {
    const used = await db
      .select({ n: sql<number>`count(*)` })
      .from(enrollments)
      .where(eq(enrollments.courseId, c.id))
      .get();
    if (Number(used?.n ?? 0) > 0) {
      console.log(`- [starter] คงคอร์สเดโม "${c.slug}" ไว้ (มีผู้สมัครแล้ว)`);
      continue;
    }
    await db.delete(courses).where(eq(courses.id, c.id)).run();
    console.log(`✓ [starter] ลบคอร์สเดโม "${c.slug}" (ไม่มีผู้สมัคร)`);
  }
}

/** เวลาทำการเริ่มต้น: จ–ศ 09:00–17:00 */
function seedBookingHours() {
  return db.transaction(async (tx) => {
    await tx.delete(bookingHours).run();
    const rows = [1, 2, 3, 4, 5].map((wd) => ({
      id: randomUUID(),
      weekday: wd,
      startMinute: 540, // 09:00
      endMinute: 1020,  // 17:00
    }));
    if (rows.length) await tx.insert(bookingHours).values(rows).run();
    console.log(`✓ [starter] เวลาทำการ: จ–ศ 09:00–17:00`);
  });
}

export async function seedStarter(): Promise<void> {
  let created = 0;
  let skipped = 0;
  for (const c of STARTER_COURSES) {
    const { created: isNew } = await upsertCourse(c);
    if (isNew) {
      created++;
      console.log(`✓ [starter] เพิ่มคอร์ส: ${c.title}${c.isPublished ? "" : " (ปิดไว้)"}`);
    } else {
      skipped++;
    }
  }
  await cleanupDemoCourses();
  await seedBookingHours();
  console.log(`✓ [starter] เสร็จ — เพิ่มใหม่ ${created} คอร์ส, ข้ามที่มีอยู่แล้ว ${skipped} คอร์ส`);
}
