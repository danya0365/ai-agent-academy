import { unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq, like, inArray } from "drizzle-orm";
import { db } from "../index";
import { courses, courseSessions, enrollments, user } from "../schema";
import type { EnrollmentStatus } from "../schema";
import { ensureUser, makeSlipImage } from "./helpers";

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

// (ดัชนีลูกค้า, slug คอร์ส, สถานะ) — ครอบคลุมทุกสถานะ
const ENROLLMENT_SPECS: {
  customer: number;
  slug: string;
  status: EnrollmentStatus;
  rejectReason?: string;
}[] = [
  { customer: 0, slug: "ai-literacy", status: "slip_uploaded" },
  { customer: 1, slug: "ai-literacy", status: "confirmed" },
  { customer: 2, slug: "prompt-engineering", status: "slip_uploaded" },
  { customer: 3, slug: "ai-for-office", status: "confirmed" },
  { customer: 4, slug: "ai-content-marketing", status: "pending_payment" },
  { customer: 5, slug: "ai-coding-assistant", status: "slip_uploaded" },
  { customer: 6, slug: "vibe-coding", status: "confirmed" },
  { customer: 7, slug: "vibe-coding", status: "pending_payment" },
  {
    customer: 0,
    slug: "ai-for-office",
    status: "rejected",
    rejectReason: "ยอดเงินในสลิปไม่ตรงกับค่าคอร์ส กรุณาโอนใหม่และแนบสลิปอีกครั้ง",
  },
  {
    customer: 2,
    slug: "ai-coding-assistant",
    status: "rejected",
    rejectReason: "สลิปไม่ชัด อ่านยอด/เวลาไม่ได้ กรุณาแนบรูปที่ชัดเจนกว่านี้",
  },
  { customer: 4, slug: "prompt-engineering", status: "slip_uploaded" },
];

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

  // map slug → course + รอบแรก (ถ้ามี)
  const allCourses = await db.select().from(courses).all();
  const bySlug = new Map(allCourses.map((c) => [c.slug, c]));

  async function firstSessionId(courseId: string): Promise<string | null> {
    const s = await db
      .select({ id: courseSessions.id })
      .from(courseSessions)
      .where(eq(courseSessions.courseId, courseId))
      .orderBy(courseSessions.startAt)
      .get();
    return s?.id ?? null;
  }

  const counts: Record<EnrollmentStatus, number> = {
    pending_payment: 0,
    slip_uploaded: 0,
    confirmed: 0,
    rejected: 0,
  };

  for (const spec of ENROLLMENT_SPECS) {
    const course = bySlug.get(spec.slug);
    if (!course) {
      console.log(`- [mock] ข้าม (ไม่พบคอร์ส ${spec.slug}) — รัน starter ก่อน`);
      continue;
    }
    const sessionId =
      course.type === "scheduled" ? await firstSessionId(course.id) : null;

    const needsSlip = spec.status !== "pending_payment";
    const slipPath = needsSlip ? await makeSlipImage(spec.slug) : null;
    const now = new Date();
    const reviewed = spec.status === "confirmed" || spec.status === "rejected";

    await db
      .insert(enrollments)
      .values({
        id: randomUUID(),
        userId: customerIds[spec.customer],
        courseId: course.id,
        sessionId,
        status: spec.status,
        amount: course.price,
        slipPath,
        slipUploadedAt: needsSlip ? now : null,
        reviewedAt: reviewed ? now : null,
        rejectReason: spec.status === "rejected" ? spec.rejectReason ?? null : null,
      })
      .run();
    counts[spec.status]++;
  }

  console.log(
    `✓ [mock] ลูกค้า ${customerIds.length} คน, enrollment: ` +
      `รอชำระ ${counts.pending_payment}, รอตรวจสลิป ${counts.slip_uploaded}, ` +
      `ยืนยันแล้ว ${counts.confirmed}, ปฏิเสธ ${counts.rejected}`,
  );
}
