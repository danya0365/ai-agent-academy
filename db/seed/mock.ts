import { unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq, like, inArray } from "drizzle-orm";
import { db } from "../index";
import {
  enrollments,
  bookings,
  bookingHours,
  user,
  communityPosts,
  communityPostLikes,
} from "../schema";
import type { EnrollmentStatus } from "../schema";
import { ensureUser, makeSlipImage } from "./helpers";
import { getCourseBySlug, COURSES } from "../../lib/courses";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const MOCK_EMAIL_PREFIX = "mock.";

const MOCK_CUSTOMERS = [
  { email: "mock.somchai@example.com", name: "สมชาย ใจดี" },
  { email: "mock.suda@example.com", name: "สุดา รักเรียน" },
  { email: "mock.anan@example.com", name: "อนันต์ ตั้งใจ" },
  { email: "mock.kanya@example.com", name: "กัญญา แสงทอง" },
  { email: "mock.peerapong@example.com", name: "พีรพงษ์ วัฒนา" },
  { email: "mock.nittaya@example.com", name: "นิตยา ศรีสุข" },
  { email: "mock.wichai@example.com", name: "วิชัย มั่นคง" },
  { email: "mock.ploy@example.com", name: "พลอย เพชรงาม" },
];

// User 0 (สมชาย) จอง build-web-with-ai หลายครั้ง — จำลอง history + upcoming
function buildMultiEnrollments(): {
  customer: number;
  slug: string;
  status: EnrollmentStatus;
  daysAgo: number; // จำนวนวันที่แล้ว (0=วันนี้, ลบ=อนาคต)
  hour: number;
  rejectReason?: string;
}[] {
  const out: ReturnType<typeof buildMultiEnrollments> = [];
  const web = "build-web-with-ai";
  const saas = "build-saas-with-ai";

  // สมชาย — เรียน web ไปแล้ว 5 ครั้ง (confirmed, past)
  for (let i = 6; i >= 2; i--) {
    out.push({ customer: 0, slug: web, status: "confirmed", daysAgo: i, hour: 9 });
  }
  // สมชาย — upcoming 2 ครั้ง (confirmed, อนาคต)
  out.push({ customer: 0, slug: web, status: "confirmed", daysAgo: -1, hour: 9 });
  out.push({ customer: 0, slug: web, status: "confirmed", daysAgo: -3, hour: 13 });
  // สมชาย — 1 rejected
  out.push({
    customer: 0, slug: web, status: "rejected", daysAgo: 3, hour: 13,
    rejectReason: "สลิปไม่ชัด อ่านยอด/เวลาไม่ได้ กรุณาแนบรูปที่ชัดเจนกว่านี้",
  });
  // สมชาย — 1 pending_payment (upcoming)
  out.push({ customer: 0, slug: saas, status: "pending_payment", daysAgo: -2, hour: 10 });

  // user 1 (สุดา) — web 3 ครั้ง
  for (let i = 4; i >= 1; i--) out.push({ customer: 1, slug: web, status: "confirmed", daysAgo: i, hour: 10 });
  out.push({ customer: 1, slug: saas, status: "slip_uploaded", daysAgo: -1, hour: 14 });

  // user 2 — 2d game 2 ครั้ง
  out.push({ customer: 2, slug: "build-2d-game-with-ai", status: "confirmed", daysAgo: 3, hour: 9 });
  out.push({ customer: 2, slug: "build-2d-game-with-ai", status: "confirmed", daysAgo: 1, hour: 14 });

  // user 3 — mobile app 1
  out.push({ customer: 3, slug: "build-mobile-app-with-ai", status: "confirmed", daysAgo: 2, hour: 11 });

  // user 4 — pending
  out.push({ customer: 4, slug: "build-mobile-app-with-ai", status: "pending_payment", daysAgo: -1, hour: 9 });

  // user 5 — multiplayer game
  out.push({ customer: 5, slug: "build-multiplayer-game-with-ai", status: "confirmed", daysAgo: 4, hour: 13 });

  // user 6 — 3d game
  out.push({ customer: 6, slug: "build-3d-game-with-ai", status: "confirmed", daysAgo: 5, hour: 9 });
  out.push({ customer: 6, slug: "build-3d-game-with-ai", status: "pending_payment", daysAgo: 0, hour: 11 });

  return out;
}

/** ลบ mock เดิม (user + enrollment cascade + ไฟล์สลิป) ให้รันซ้ำได้สะอาด */
async function clearExistingMock(): Promise<void> {
  const mockUsers = await db
    .select({ id: user.id })
    .from(user)
    .where(like(user.email, `${MOCK_EMAIL_PREFIX}%`))
    .all();
  if (mockUsers.length === 0) return;

  const ids = mockUsers.map((u) => u.id);
  // เก็บ slipPath ก่อนลบ (เพราะลบ user แล้ว enrollment จะ cascade หาย)
  const slips = await db
    .select({ slipPath: enrollments.slipPath })
    .from(enrollments)
    .where(inArray(enrollments.userId, ids))
    .all();

  for (const s of slips) {
    if (s.slipPath) {
      await unlink(path.join(UPLOAD_DIR, path.basename(s.slipPath))).catch(() => {});
    }
  }

  await db.delete(user).where(inArray(user.id, ids)).run();
  console.log(`- [mock] ล้าง mock เดิม ${ids.length} คน`);
}

/* ────────────────────────────────────────────────────────────
 * คอมมูนิตี้ถาม-ตอบ (mock) — โพสต์โดย mock customers ทั้งหมด
 * ล้างอัตโนมัติเมื่อ reseed เพราะลบ mock user แล้ว cascade หายตาม FK
 * ──────────────────────────────────────────────────────────── */

type ReplySpec = { c: number; body: string; mAgo: number; likedBy: number[] };
type QuestionSpec = {
  c: number;
  body: string;
  mAgo: number;
  tip: string | null;
  likedBy: number[];
  replies: ReplySpec[];
  /** index ใน replies ที่เป็น "คำตอบที่ใช่" */
  acceptedReply?: number;
};

// c = ดัชนีใน MOCK_CUSTOMERS, mAgo = กี่นาทีที่แล้ว, likedBy = ดัชนีคนที่กดไลก์
const COMMUNITY_QUESTIONS: QuestionSpec[] = [
  {
    c: 0,
    body: "ลองติดตั้ง 9Router ตามเคล็ดลับแล้ว แต่พอรัน `9router` มันขึ้น error EADDRINUSE port 20128 ต้องแก้ยังไงครับ ใครเคยเจอบ้าง",
    mAgo: 15,
    tip: "claude-code-token-survival",
    likedBy: [1, 3, 5],
    replies: [
      {
        c: 2,
        body: "อันนี้แปลว่ามี process เดิมจองพอร์ตอยู่ครับ ลอง `lsof -i :20128` หา PID แล้ว kill ทิ้ง หรือรันด้วยพอร์ตอื่น `9router --port 20200` ก็ได้",
        mAgo: 10,
        likedBy: [0, 1, 4],
      },
      {
        c: 4,
        body: "ผมเจอเหมือนกัน ปิด terminal เก่าที่ยังรัน 9router ค้างอยู่ก็หายเลยครับ",
        mAgo: 6,
        likedBy: [0],
      },
    ],
    acceptedReply: 0,
  },
  {
    c: 1,
    body: "พอ Claude Code token หมด ต้องตั้งค่า fallback model ใน 9Router ยังไงให้มันสลับเองอัตโนมัติครับ งงตรง config",
    mAgo: 40,
    tip: "claude-code-token-survival",
    likedBy: [2, 6],
    replies: [
      {
        c: 6,
        body: "ใน dashboard 9Router มีหน้า Routing ให้ลากเรียงลำดับ provider ได้เลยครับ ตัวบนสุดหมดโควต้ามันจะไล่ลงตัวถัดไปเอง ไม่ต้องแก้ไฟล์",
        mAgo: 32,
        likedBy: [1],
      },
    ],
  },
  {
    c: 3,
    body: "อยากให้ AI ช่วยร่างอีเมลงานให้เร็วขึ้น มี prompt แม่แบบแนะนำไหมครับ ทุกวันนี้พิมพ์เองช้ามาก",
    mAgo: 70,
    tip: "ai-speed-tips",
    likedBy: [0, 2, 4, 7],
    replies: [
      {
        c: 5,
        body: "ผมใช้แบบนี้ครับ: 'ช่วยร่างอีเมลถึง[ใคร] เรื่อง[อะไร] โทน[สุภาพ/เป็นกันเอง] ความยาวไม่เกิน 5 บรรทัด' แล้วค่อยเกลาต่อ เร็วขึ้นเยอะ",
        mAgo: 60,
        likedBy: [3, 0, 2],
      },
    ],
    acceptedReply: 0,
  },
  {
    c: 2,
    body: "ใครมีเทคนิคจัด prompt แม่แบบเก็บไว้ใช้ซ้ำบ้างครับ เก็บใน Notes ธรรมดามันหายาก",
    mAgo: 110,
    tip: "ai-speed-tips",
    likedBy: [3],
    replies: [],
  },
  {
    c: 4,
    body: "เขียน prompt ให้ AI ตอบเป็นตารางทุกครั้ง ทำยังไงให้มันไม่ลืม format ครับ บางทีตอบเป็นย่อหน้ายาว",
    mAgo: 150,
    tip: "prompts-that-work",
    likedBy: [1, 5],
    replies: [
      {
        c: 0,
        body: "สั่งชัด ๆ ตอนท้ายว่า 'ตอบเป็นตาราง markdown เท่านั้น ห้ามมีข้อความนอกตาราง' แล้วมันจะเชื่อฟังขึ้นครับ",
        mAgo: 140,
        likedBy: [4],
      },
    ],
  },
  {
    c: 5,
    body: "เครื่องมือ AI ฟรีตัวไหนช่วยสรุปคลิป YouTube ยาว ๆ ได้บ้างครับ อยากได้แบบไม่ต้องสมัครจ่ายเงิน",
    mAgo: 200,
    tip: "free-ai-tools",
    likedBy: [2, 6, 7],
    replies: [],
  },
  {
    c: 6,
    body: "อยากหารายได้เสริมด้วยการรับเขียนคอนเทนต์โดยใช้ AI ช่วย เริ่มยังไงให้มีลูกค้าคนแรกครับ",
    mAgo: 260,
    tip: "ai-side-income",
    likedBy: [0, 1, 2, 3],
    replies: [
      {
        c: 7,
        body: "เริ่มจากทำ portfolio 3-4 ชิ้นให้ดูก่อนครับ แล้วโพสต์ในกลุ่มรับงาน ช่วงแรกรับราคาถูกหน่อยเพื่อเก็บรีวิว",
        mAgo: 250,
        likedBy: [6, 0],
      },
      {
        c: 1,
        body: "อย่าลืมตรวจงานเองทุกครั้งก่อนส่งนะครับ ลูกค้าดูออกว่า copy จาก AI มาตรง ๆ",
        mAgo: 240,
        likedBy: [6],
      },
    ],
    acceptedReply: 0,
  },
  {
    c: 7,
    body: "Claude Code กับ Cursor ต่างกันยังไงครับ ควรเริ่มตัวไหนก่อนดีสำหรับคนเพิ่งหัดใช้ AI เขียนโค้ด",
    mAgo: 320,
    tip: null,
    likedBy: [4, 5],
    replies: [],
  },
  {
    c: 0,
    body: "มีใครใช้ AI ทำสไลด์นำเสนอบ้างครับ ผลลัพธ์โอเคไหม หรือยังต้องมาจัดเองเยอะ",
    mAgo: 400,
    tip: "free-ai-tools",
    likedBy: [7],
    replies: [],
  },
  {
    c: 3,
    body: "ถามหน่อยครับ พอให้ AI สั่งงานเป็นขั้นตอนย่อย ๆ มันแม่นขึ้นจริงไหม หรือสั่งรวดเดียวก็ได้",
    mAgo: 500,
    tip: "ai-speed-tips",
    likedBy: [2, 4],
    replies: [
      {
        c: 5,
        body: "จริงครับ งานใหญ่แตกเป็นขั้นแล้วให้ทำทีละขั้น ได้ผลแม่นกว่าเยอะ โดยเฉพาะงานที่มีเงื่อนไขซับซ้อน",
        mAgo: 480,
        likedBy: [3],
      },
    ],
  },
  {
    c: 2,
    body: "อยากรู้ว่าใส่ข้อมูลบริษัทลงใน AI ฟรีปลอดภัยไหมครับ กลัวข้อมูลหลุด",
    mAgo: 620,
    tip: "free-ai-tools",
    likedBy: [0, 6],
    replies: [],
  },
  {
    c: 4,
    body: "ใครพอจะแนะนำ prompt สำหรับให้ AI ช่วยตรวจแกรมมาร์อังกฤษในอีเมลงานได้บ้างครับ",
    mAgo: 800,
    tip: "prompts-that-work",
    likedBy: [1],
    replies: [],
  },
];

async function seedCommunity(customerIds: string[]): Promise<void> {
  const base = Date.now();
  const at = (mAgo: number) => new Date(base - mAgo * 60_000);
  let questions = 0;
  let replies = 0;

  for (const q of COMMUNITY_QUESTIONS) {
    const qId = randomUUID();
    await db
      .insert(communityPosts)
      .values({
        id: qId,
        authorId: customerIds[q.c],
        parentId: null,
        body: q.body,
        tipSlug: q.tip,
        likeCount: q.likedBy.length,
        replyCount: q.replies.length,
        createdAt: at(q.mAgo),
      })
      .run();
    questions++;

    const replyIds: string[] = [];
    for (const r of q.replies) {
      const rId = randomUUID();
      replyIds.push(rId);
      await db
        .insert(communityPosts)
        .values({
          id: rId,
          authorId: customerIds[r.c],
          parentId: qId,
          body: r.body,
          likeCount: r.likedBy.length,
          createdAt: at(r.mAgo),
        })
        .run();
      replies++;
      for (const u of r.likedBy) {
        await db
          .insert(communityPostLikes)
          .values({ postId: rId, userId: customerIds[u], createdAt: at(r.mAgo) })
          .run();
      }
    }

    if (q.acceptedReply != null && replyIds[q.acceptedReply]) {
      await db
        .update(communityPosts)
        .set({ acceptedReplyId: replyIds[q.acceptedReply] })
        .where(eq(communityPosts.id, qId))
        .run();
    }

    for (const u of q.likedBy) {
      await db
        .insert(communityPostLikes)
        .values({ postId: qId, userId: customerIds[u], createdAt: at(q.mAgo) })
        .run();
    }
  }

  console.log(`✓ [mock] คอมมูนิตี้: ${questions} คำถาม, ${replies} คำตอบ`);
}

export async function seedMock(): Promise<void> {
  await clearExistingMock();

  // สร้างลูกค้าปลอม
  const customerIds: string[] = [];
  for (const c of MOCK_CUSTOMERS) {
    const id = await ensureUser({
      email: c.email,
      password: "mock1234",
      name: c.name,
      role: "customer",
    });
    customerIds.push(id);
  }

  // map slug → course (static data)
  const bySlug = new Map(COURSES.map((c) => [c.slug, c]));

  /** หา slot ถัดไปของวันทำงาน (booking course) สำหรับ mock booking enrollments */
  async function getBookingEnrollmentTimes(
    courseId: string,
    durationMin: number,
  ): Promise<{ startAt: Date; endAt: Date } | null> {
    const hours = await db.select().from(bookingHours).all();
    if (!hours.length || !durationMin) return null;
    const bkkOffsetMs = 7 * 3600_000;

    for (let d = 1; d <= 14; d++) {
      // เที่ยงคืนของวันถัดไป (BKK)
      const raw = Date.now() + d * 86400000;
      const shifted = raw + bkkOffsetMs;
      const dayStart = new Date(raw - (shifted % 86400000));
      const weekday = new Date(raw + bkkOffsetMs).getUTCDay(); // 0=Sun..6=Sat

      const h = hours.find((h) => h.weekday === weekday);
      if (!h) continue;

      const startAt = new Date(dayStart.getTime() + h.startMinute * 60000);
      const endAt = new Date(startAt.getTime() + durationMin * 60000);
      return { startAt, endAt };
    }
    return null;
  }

  const specs = buildMultiEnrollments();

  const bkkOffsetMs = 7 * 3600_000;
  const counts: Record<EnrollmentStatus, number> = {
    pending_payment: 0,
    slip_uploaded: 0,
    confirmed: 0,
    rejected: 0,
  };

  const now = new Date();

  for (const spec of specs) {
    const course = bySlug.get(spec.slug);
    if (!course) {
      console.log(`- [mock] ข้าม (ไม่พบคอร์ส ${spec.slug})`);
      continue;
    }

    // คำนวณเวลา — daysAgo (ลบ = อนาคต, 0 = วันนี้, บวก = อดีต)
    const dayOffset = spec.daysAgo; // daysAgo=ลบ → อนาคต (บวกวัน)
    const rawDay = Date.now() + dayOffset * 86400000;
    const shifted = rawDay + bkkOffsetMs;
    const dayStart = new Date(rawDay - (shifted % 86400000));
    const startAt = new Date(dayStart.getTime() + spec.hour * 3600000);
    const endAt = new Date(startAt.getTime() + (course.sessionDurationMin || 120) * 60000);

    const bookedStartAt = startAt;
    const bookedEndAt = endAt;

    const needsSlip = spec.status !== "pending_payment";
    const slipPath = needsSlip ? await makeSlipImage(spec.slug) : null;
    const reviewed = spec.status === "confirmed" || spec.status === "rejected";

    const enrollmentId = randomUUID();
    await db
      .insert(enrollments)
      .values({
        id: enrollmentId,
        userId: customerIds[spec.customer],
        courseSlug: course.slug,
        courseTitle: course.title,
        bookedStartAt,
        bookedEndAt,
        status: spec.status,
        amount: course.price,
        slipPath,
        slipUploadedAt: needsSlip ? now : null,
        reviewedAt: reviewed ? now : null,
        rejectReason: spec.status === "rejected" ? spec.rejectReason ?? null : null,
      })
      .run();

    // booking course: insert lock row (bookings)
    if (course.type === "live" && bookedStartAt && bookedEndAt) {
      await db
        .insert(bookings)
        .values({
          courseSlug: course.slug,
          startAt: bookedStartAt,
          endAt: bookedEndAt,
          enrollmentId,
          userId: customerIds[spec.customer],
        })
        .catch(() => {
          console.log(`- [mock] booking slot ชน PK (ข้าม): ${course.slug}`);
        });
    }

    counts[spec.status]++;
  }

  console.log(
    `✓ [mock] ลูกค้า ${customerIds.length} คน, enrollment: ` +
      `รอชำระ ${counts.pending_payment}, รอตรวจสลิป ${counts.slip_uploaded}, ` +
      `ยืนยันแล้ว ${counts.confirmed}, ปฏิเสธ ${counts.rejected}`,
  );

  await seedCommunity(customerIds);
}
