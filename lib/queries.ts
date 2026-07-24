import "server-only";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  isNull,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { db } from "@/db";
import {
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
import { getCourseBySlug, type Course } from "@/lib/courses";
import {
  FEED_PAGE_SIZE,
  type FeedPost,
  type ThreadReply,
  type FeedCursor,
} from "@/lib/community";

/** จำนวนผู้เรียนจริง = distinct user ที่มี enrollment ยืนยันแล้ว (สำหรับสถิติหน้าแรก) */
export async function getLearnerCount(): Promise<number> {
  const row = await db
    .select({ n: sql<number>`count(distinct ${enrollments.userId})` })
    .from(enrollments)
    .where(eq(enrollments.status, "confirmed"))
    .get();
  return Number(row?.n ?? 0);
}

/** เวลาทำการทั้งหมด (global) — ใช้ gen slot */
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
 * ช่วงเวลาที่ถูกจองไปแล้ว (อนาคต) — GLOBAL ทุกคอร์ส
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

/** ดึงคอร์สตาม slug พร้อม slot ว่างสำหรับ booking */
export async function getCourseBySlugWithBooking(slug: string) {
  const course = getCourseBySlug(slug);
  if (!course) return null;

  let booking: CourseBookingView | null = null;
  if (course.sessionDurationMin) {
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

  return { course, booking };
}

/* ──────────── Enrollment queries (no courses JOIN — courseSlug resolved from static data) ──────────── */

type EnrollmentCourse = {
  enrollment: typeof enrollments.$inferSelect;
  course: Course | undefined;
};

/** ดึง enrollment เดียว เฉพาะของ user ที่ระบุ */
export async function getEnrollmentForUser(
  enrollmentId: string,
  userId: string,
): Promise<EnrollmentCourse | null> {
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId)))
    .get();
  if (!enrollment) return null;
  return { enrollment, course: getCourseBySlug(enrollment.courseSlug) };
}

/** ประวัติการลงทะเบียนทั้งหมดของ user */
export async function getUserEnrollments(userId: string) {
  const rows = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.userId, userId))
    .orderBy(desc(enrollments.createdAt))
    .all();
  return rows.map((enrollment) => ({
    enrollment,
    course: getCourseBySlug(enrollment.courseSlug),
  }));
}

/** ประวัติ enrollment ทั้งหมดของ user สำหรับคอร์สที่ระบุ (by slug) */
export async function getUserCourseEnrollments(userId: string, courseSlug: string) {
  const rows = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.courseSlug, courseSlug),
      ),
    )
    .orderBy(desc(enrollments.bookedStartAt))
    .all();

  const now = new Date();
  const past = rows.filter(
    (e) => e.bookedStartAt && e.bookedStartAt < now && e.status === "confirmed",
  );
  const upcoming = rows.filter(
    (e) => e.bookedStartAt && e.bookedStartAt >= now && e.status === "confirmed",
  );
  const pending = rows.filter(
    (e) => e.status === "pending_payment" || e.status === "slip_uploaded",
  );
  const rejected = rows.filter((e) => e.status === "rejected");

  return { past, upcoming, pending, rejected, all: rows };
}

/** รายการลงทะเบียนสำหรับแอดมิน */
export async function getAdminEnrollments(status?: EnrollmentStatus) {
  const base = db
    .select({
      enrollment: enrollments,
      customer: { name: user.name, email: user.email },
    })
    .from(enrollments)
    .innerJoin(user, eq(enrollments.userId, user.id));

  const rows = status
    ? await base.where(eq(enrollments.status, status)).orderBy(desc(enrollments.createdAt)).all()
    : await base.orderBy(desc(enrollments.createdAt)).all();

  return rows.map((r) => ({
    enrollment: r.enrollment,
    course: getCourseBySlug(r.enrollment.courseSlug),
    customer: r.customer,
  }));
}

/* ────────────────────────────────────────────────────────────
 * คอมมูนิตี้ถาม-ตอบ (unchanged)
 * ──────────────────────────────────────────────────────────── */

type FeedRow = {
  post: typeof communityPosts.$inferSelect;
  author: { id: string; name: string; image: string | null };
  likedBy: string | null;
};

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
