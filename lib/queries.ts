import "server-only";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import {
  courses,
  courseSessions,
  enrollments,
  bookingHours,
  bookings,
  user,
  communityPosts,
  communityPostLikes,
} from "@/db/schema";
import type { EnrollmentStatus } from "@/db/schema";
import {
  generateSlots,
  type DaySlots,
  type HoursRow,
  type BusyRange,
} from "@/lib/booking";
import { getTipBySlug } from "@/lib/tips";
import {
  FEED_PAGE_SIZE,
  type FeedPost,
  type ThreadReply,
  type FeedCursor,
} from "@/lib/community";

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

/** เวลาทำการทั้งหมด (global) — ใช้ gen slot ของคอร์ส booking */
export async function getBookingHours(): Promise<HoursRow[]> {
  return db
    .select({
      weekday: bookingHours.weekday,
      startMinute: bookingHours.startMinute,
      endMinute: bookingHours.endMinute,
    })
    .from(bookingHours)
    .orderBy(asc(bookingHours.weekday), asc(bookingHours.startMinute))
    .all();
}

/**
 * ช่วงเวลาที่ถูกจองไปแล้ว (อนาคต) — GLOBAL ทุกคอร์ส booking จงใจ
 * เพราะเวลาทำการเป็นชุดเดียว (ครู/ร้านเดียว) → เวลาที่ถูกจองของคอร์สไหนก็ตามต้องบล็อกทุกคอร์ส
 */
async function getBusyRanges(now: number): Promise<BusyRange[]> {
  const rows = await db
    .select({ startAt: bookings.startAt, endAt: bookings.endAt })
    .from(bookings)
    .where(gte(bookings.endAt, new Date(now)))
    .all();
  return rows.map((r) => ({ startEpoch: r.startAt.getTime(), endEpoch: r.endAt.getTime() }));
}

export type CourseBookingView = { durationMin: number; days: DaySlots[] };

/** ดึงคอร์สตาม slug พร้อมรอบเรียน/ที่นั่งเหลือ (scheduled) หรือ slot ว่าง (booking) */
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

  let booking: CourseBookingView | null = null;
  if (course.type === "booking" && course.sessionDurationMin) {
    const now = Date.now();
    const [hours, busy] = await Promise.all([
      getBookingHours(),
      getBusyRanges(now),
    ]);
    booking = {
      durationMin: course.sessionDurationMin,
      days: generateSlots(hours, course.sessionDurationMin, busy, now),
    };
  }

  return { course, sessions: sessionsWithSeats, booking };
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

/* ────────────────────────────────────────────────────────────
 * คอมมูนิตี้ถาม-ตอบ
 * ──────────────────────────────────────────────────────────── */

type FeedRow = {
  post: typeof communityPosts.$inferSelect;
  author: { id: string; name: string; image: string | null };
  likedBy: string | null;
};

/** map แถว DB → FeedPost (serializable): resolve tipTitle ฝั่ง server, createdAt → epoch ms */
function toFeedPost(row: FeedRow): FeedPost {
  const tip = row.post.tipSlug ? getTipBySlug(row.post.tipSlug) : undefined;
  return {
    id: row.post.id,
    body: row.post.body,
    tipSlug: row.post.tipSlug,
    tipTitle: tip?.title ?? null,
    pinned: row.post.pinned,
    likeCount: row.post.likeCount,
    replyCount: row.post.replyCount,
    hasAccepted: row.post.acceptedReplyId != null,
    likedByViewer: row.likedBy != null,
    createdAt: row.post.createdAt.getTime(),
    author: row.author,
  };
}

/**
 * select ร่วม: join ผู้เขียน + leftJoin like ของ viewer (หา likedByViewer)
 * viewer ที่เป็น null แทนด้วย "__none__" (ไม่มีใครมี id นี้ → likedBy = null เสมอ)
 */
function feedSelect(viewerId: string | null) {
  return db
    .select({
      post: communityPosts,
      author: { id: user.id, name: user.name, image: user.image },
      likedBy: communityPostLikes.userId,
    })
    .from(communityPosts)
    .innerJoin(user, eq(communityPosts.authorId, user.id))
    .leftJoin(
      communityPostLikes,
      and(
        eq(communityPostLikes.postId, communityPosts.id),
        eq(communityPostLikes.userId, viewerId ?? "__none__"),
      ),
    );
}

/**
 * หน้า feed: คำถาม top-level (parent_id IS NULL, ไม่รวม pinned) เรียงใหม่สุดก่อน
 * - หน้าแรก (cursor=null, ไม่ filter tip) แถม pinned list มาด้วย
 * - keyset pagination ด้วยคู่ (created_at, id) — กัน timestamp วินาทีชนกัน
 */
export async function getCommunityFeedPage(opts: {
  viewerId?: string | null;
  cursor?: FeedCursor | null;
  tipSlug?: string | null;
}): Promise<{ pinned: FeedPost[]; posts: FeedPost[]; nextCursor: FeedCursor | null }> {
  const { viewerId = null, cursor = null, tipSlug = null } = opts;

  const conditions: (SQL | undefined)[] = [
    isNull(communityPosts.parentId),
    eq(communityPosts.pinned, false),
  ];
  if (tipSlug) conditions.push(eq(communityPosts.tipSlug, tipSlug));
  if (cursor) {
    const cur = new Date(cursor.createdAt);
    conditions.push(
      or(
        lt(communityPosts.createdAt, cur),
        and(eq(communityPosts.createdAt, cur), lt(communityPosts.id, cursor.id)),
      ),
    );
  }

  const rows = await feedSelect(viewerId)
    .where(and(...conditions))
    .orderBy(desc(communityPosts.createdAt), desc(communityPosts.id))
    .limit(FEED_PAGE_SIZE + 1)
    .all();

  const hasMore = rows.length > FEED_PAGE_SIZE;
  const posts = (hasMore ? rows.slice(0, FEED_PAGE_SIZE) : rows).map(toFeedPost);
  const last = posts[posts.length - 1];
  const nextCursor = hasMore && last ? { createdAt: last.createdAt, id: last.id } : null;

  let pinned: FeedPost[] = [];
  if (!cursor && !tipSlug) {
    const pinnedRows = await feedSelect(viewerId)
      .where(and(isNull(communityPosts.parentId), eq(communityPosts.pinned, true)))
      .orderBy(desc(communityPosts.createdAt), desc(communityPosts.id))
      .all();
    pinned = pinnedRows.map(toFeedPost);
  }

  return { pinned, posts, nextCursor };
}

/**
 * thread: คำถาม + replies
 * - ถ้า id ที่ขอเป็น reply (parentId != null) คืน parentId ให้ page redirect ไป thread แม่
 * - replies เรียงเก่า→ใหม่ (page จะ sort accepted ขึ้นบนสุดด้วย JS อีกที)
 */
export async function getPostWithReplies(
  id: string,
  viewerId?: string | null,
): Promise<{ post: FeedPost; parentId: string | null; replies: ThreadReply[] } | null> {
  const viewer = viewerId ?? null;

  const row = await feedSelect(viewer).where(eq(communityPosts.id, id)).get();
  if (!row) return null;

  const post = toFeedPost(row);
  if (row.post.parentId) {
    return { post, parentId: row.post.parentId, replies: [] };
  }

  const acceptedId = row.post.acceptedReplyId;
  const replyRows = await feedSelect(viewer)
    .where(eq(communityPosts.parentId, id))
    .orderBy(asc(communityPosts.createdAt), asc(communityPosts.id))
    .all();

  const replies: ThreadReply[] = replyRows.map((r) => ({
    ...toFeedPost(r),
    accepted: r.post.id === acceptedId,
  }));

  return { post, parentId: null, replies };
}

/** section "คำถามเกี่ยวกับ tip นี้" บนหน้า tip — จำนวนทั้งหมด + ล่าสุด N รายการ */
export async function getQuestionsForTip(
  slug: string,
  limit = 3,
): Promise<{ count: number; questions: FeedPost[] }> {
  const countRow = await db
    .select({ n: sql<number>`count(*)` })
    .from(communityPosts)
    .where(and(eq(communityPosts.tipSlug, slug), isNull(communityPosts.parentId)))
    .get();

  const rows = await feedSelect(null)
    .where(and(eq(communityPosts.tipSlug, slug), isNull(communityPosts.parentId)))
    .orderBy(desc(communityPosts.createdAt), desc(communityPosts.id))
    .limit(limit)
    .all();

  return { count: Number(countRow?.n ?? 0), questions: rows.map(toFeedPost) };
}
