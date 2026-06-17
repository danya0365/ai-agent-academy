import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { courses, courseSessions, enrollments, user } from "@/db/schema";
import type { EnrollmentStatus } from "@/db/schema";

// สถานะที่ถือว่า "จองที่นั่งไว้" (ใช้คำนวณที่นั่งเหลือแบบ soft)
export const SEAT_HOLDING_STATUSES = [
  "pending_payment",
  "slip_uploaded",
  "confirmed",
] as const;

/** นับจำนวนที่นั่งที่ถูกจอง (soft) ต่อ session — ใช้แสดงที่นั่งเหลือ */
export async function getReservedSeatsBySession(
  sessionIds: string[],
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (sessionIds.length === 0) return map;

  const rows = await db
    .select({
      sessionId: enrollments.sessionId,
      count: sql<number>`count(*)`,
    })
    .from(enrollments)
    .where(
      and(
        inArray(enrollments.sessionId, sessionIds),
        inArray(enrollments.status, [...SEAT_HOLDING_STATUSES]),
      ),
    )
    .groupBy(enrollments.sessionId)
    .all();

  for (const r of rows) {
    if (r.sessionId) map.set(r.sessionId, Number(r.count));
  }
  return map;
}

/** นับ enrollment ที่ยืนยันแล้ว (confirmed) ของ session เดียว — ใช้ตอน approve (hard) */
export async function countConfirmedForSession(sessionId: string): Promise<number> {
  const row = await db
    .select({ count: sql<number>`count(*)` })
    .from(enrollments)
    .where(
      and(eq(enrollments.sessionId, sessionId), eq(enrollments.status, "confirmed")),
    )
    .get();
  return Number(row?.count ?? 0);
}

/** ดึงคอร์สที่เผยแพร่แล้วทั้งหมด สำหรับแคตตาล็อก */
export async function getPublishedCourses() {
  return db.select().from(courses).where(eq(courses.isPublished, true)).all();
}

/** จำนวนผู้เรียนจริง = distinct user ที่มี enrollment ยืนยันแล้ว (สำหรับสถิติหน้าแรก) */
export async function getLearnerCount(): Promise<number> {
  const row = await db
    .select({ n: sql<number>`count(distinct ${enrollments.userId})` })
    .from(enrollments)
    .where(eq(enrollments.status, "confirmed"))
    .get();
  return Number(row?.n ?? 0);
}

/** ดึงคอร์สตาม slug พร้อมรอบเรียนและที่นั่งเหลือ */
export async function getCourseBySlug(slug: string) {
  const course = await db.select().from(courses).where(eq(courses.slug, slug)).get();
  if (!course) return null;

  const sessions =
    course.type === "scheduled"
      ? await db
          .select()
          .from(courseSessions)
          .where(eq(courseSessions.courseId, course.id))
          .orderBy(courseSessions.startAt)
          .all()
      : [];

  const reserved = await getReservedSeatsBySession(sessions.map((s) => s.id));

  const sessionsWithSeats = sessions.map((s) => ({
    ...s,
    reserved: reserved.get(s.id) ?? 0,
    seatsLeft: Math.max(0, s.capacity - (reserved.get(s.id) ?? 0)),
  }));

  return { course, sessions: sessionsWithSeats };
}

/** enrollment + คอร์ส + รอบเรียน (join) สำหรับหน้าจ่ายเงิน / my-courses */
function enrollmentSelect() {
  return db
    .select({
      enrollment: enrollments,
      course: courses,
      session: courseSessions,
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .leftJoin(courseSessions, eq(enrollments.sessionId, courseSessions.id));
}

/** ดึง enrollment เดียว เฉพาะของ user ที่ระบุ (กันแอบดูของคนอื่น) */
export async function getEnrollmentForUser(enrollmentId: string, userId: string) {
  const row = await enrollmentSelect()
    .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId)))
    .get();
  return row ?? null;
}

/** ประวัติการลงทะเบียนทั้งหมดของ user */
export async function getUserEnrollments(userId: string) {
  return enrollmentSelect()
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt))
    .all();
}

/** รายการลงทะเบียนสำหรับแอดมิน (join ผู้ใช้ + คอร์ส + รอบ) กรองตามสถานะได้ */
export async function getAdminEnrollments(status?: EnrollmentStatus) {
  const q = db
    .select({
      enrollment: enrollments,
      course: courses,
      session: courseSessions,
      customer: { name: user.name, email: user.email },
    })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .innerJoin(user, eq(enrollments.userId, user.id))
    .leftJoin(courseSessions, eq(enrollments.sessionId, courseSessions.id));

  const rows = status
    ? await q.where(eq(enrollments.status, status)).orderBy(desc(enrollments.createdAt)).all()
    : await q.orderBy(desc(enrollments.createdAt)).all();
  return rows;
}
