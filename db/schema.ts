import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
  type AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/* ────────────────────────────────────────────────────────────
 * ตาราง Auth (โครงสร้างตาม Better Auth — property keys ต้องเป็น camelCase)
 * เพิ่ม field `role` สำหรับแยกลูกค้า/แอดมิน
 * ──────────────────────────────────────────────────────────── */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default("customer"), // 'customer' | 'admin'
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/**
 * ตาราง rate limit ของ Better Auth (storage: "database") — ให้ rate limit ใช้ได้
 * ข้าม serverless instance บน Vercel (memory ใช้ร่วมกันไม่ได้)
 * property keys ต้องตรงกับ field ของ better-auth: id / key / count / lastRequest
 * index บน key เป็นแบบ "ไม่ unique" จงใจ — เพื่อให้ migration เป็น additive ล้วน (ผ่าน guard)
 */
export const rateLimit = sqliteTable(
  "rate_limit",
  {
    id: text("id").primaryKey(),
    key: text("key"),
    count: integer("count"),
    lastRequest: integer("last_request"),
  },
  (t) => [index("rate_limit_key_idx").on(t.key)],
);

/* ────────────────────────────────────────────────────────────
 * ตารางของแอป: คอร์ส / รอบเรียน / การลงทะเบียน
 * ──────────────────────────────────────────────────────────── */

// CourseType  defined in lib/course-types (single source of truth)
import type { CourseType } from "@/lib/course-types";

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().$type<CourseType>(),
  price: integer("price").notNull(), // หน่วยเป็นบาท (จำนวนเต็ม)
  coverImageUrl: text("cover_image_url"),
  // ความยาวต่อครั้ง (นาที) — ใช้เฉพาะคอร์ส type 'booking' (null สำหรับประเภทอื่น)
  sessionDurationMin: integer("session_duration_min"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * เวลาทำการของ "ร้าน" (recurring weekly) — ใช้ gen slot ว่างของคอร์ส booking
 * scope: global (ชุดเดียวใช้ทุกคอร์ส booking) — ถ้าอยากแยกต่อคอร์สในอนาคต เพิ่ม courseId ได้
 * "ทุกวัน 24 ชม." = 7 แถว (weekday 0–6, start 0 end 1440)
 * "จ–ศ 9–17"     = 5 แถว (start 540 end 1020) · เช้า/บ่ายแยกช่วง = หลายแถวต่อวันได้
 */
export const bookingHours = sqliteTable(
  "booking_hours",
  {
    id: text("id").primaryKey(),
    weekday: integer("weekday").notNull(), // 0=อาทิตย์ .. 6=เสาร์ (อิงเวลาไทย)
    startMinute: integer("start_minute").notNull(), // นาทีจากเที่ยงคืน (0–1440)
    endMinute: integer("end_minute").notNull(),
  },
  (t) => [index("booking_hours_weekday_idx").on(t.weekday)],
);

// สถานะการลงทะเบียน:
//  pending_payment → slip_uploaded → confirmed
//                                  ↘ rejected → (อัปสลิปใหม่) → slip_uploaded
export type EnrollmentStatus =
  | "pending_payment"
  | "slip_uploaded"
  | "confirmed"
  | "rejected";

// ผลการตรวจสลิปอัตโนมัติ:
//  verified = ผ่านและอนุมัติอัตโนมัติ, failed = ตรวจแล้วไม่ผ่านเกณฑ์,
//  manual = ต้องตรวจมือ, unconfigured = ยังไม่ตั้งค่า provider
export type SlipVerifyStatus = "verified" | "failed" | "manual" | "unconfigured";

export const enrollments = sqliteTable(
  "enrollments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    // เวลาที่จอง (คอร์ส type 'booking') — เก็บบน enrollment เพื่อคงไว้แม้ถูก reject
    // (แหล่งความจริงของ "ลูกค้าเลือกเวลาไหน"; ตาราง bookings เป็นแค่ lock กันซ้อน)
    bookedStartAt: integer("booked_start_at", { mode: "timestamp" }),
    bookedEndAt: integer("booked_end_at", { mode: "timestamp" }),
    status: text("status").notNull().$type<EnrollmentStatus>(),
    amount: integer("amount").notNull(), // snapshot ราคาตอนสมัคร (บาท)
    slipPath: text("slip_path"),
    slipUploadedAt: integer("slip_uploaded_at", { mode: "timestamp" }),
    reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
    rejectReason: text("reject_reason"),
    // ผลการตรวจสลิปอัตโนมัติ
    slipTransRef: text("slip_trans_ref"), // เลขอ้างอิงรายการจากสลิป (กันสลิปซ้ำ)
    slipVerifyStatus: text("slip_verify_status").$type<SlipVerifyStatus>(),
    verifyNote: text("verify_note"), // เหตุผล/รายละเอียดให้แอดมินเห็น
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index("enrollments_user_course_idx").on(t.userId, t.courseId),
    // กันสลิปซ้ำ — SQLite ยอมให้ค่า null ซ้ำกันได้
    uniqueIndex("enrollments_slip_trans_ref_unique").on(t.slipTransRef),
  ],
);

/**
 * slot ที่ถูกจอง (คอร์ส type 'booking') — ทำหน้าที่ "lock" กันจองซ้อนแบบ atomic
 * PK รวม (courseId, startAt): 2 คนจิ้ม slot เดียวพร้อมกัน → คนที่ 2 ชน PK = insert ไม่ผ่าน
 * จงใจใช้ composite PK แทน uniqueIndex — migration ไม่มี CREATE UNIQUE INDEX จึงผ่าน guard
 * (แบบเดียวกับ community_post_likes — deploy prod ได้เลย ไม่ต้องตั้ง ALLOW_DESTRUCTIVE)
 *
 * lifecycle: มีแถวอยู่ตราบที่ enrollment ยัง "ถือคิว" (pending_payment/slip_uploaded/confirmed)
 * ถูก reject → ลบแถว (ปล่อย slot) · อัปสลิปใหม่หลัง reject → claim กลับจาก enrollment.bookedStartAt
 */
export const bookings = sqliteTable(
  "bookings",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    startAt: integer("start_at", { mode: "timestamp" }).notNull(),
    endAt: integer("end_at", { mode: "timestamp" }).notNull(),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    primaryKey({ columns: [t.courseId, t.startAt] }),
    // ลบ/ค้นหา booking ตาม enrollment (ตอนปล่อย slot)
    index("bookings_enrollment_idx").on(t.enrollmentId),
  ],
);

/* ────────────────────────────────────────────────────────────
 * คอมมูนิตี้ถาม-ตอบ (Twitter/X-style)
 * ตารางเดียว self-referencing: คำถาม = parentId null, reply ชี้หาคำถาม
 * บังคับ thread ชั้นเดียวใน action (reply ตอบได้เฉพาะคำถามหลัก)
 * ──────────────────────────────────────────────────────────── */

export const communityPosts = sqliteTable(
  "community_posts",
  {
    id: text("id").primaryKey(),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // null = คำถาม (top-level), มีค่า = reply ของคำถามนั้น
    parentId: text("parent_id").references(
      (): AnySQLiteColumn => communityPosts.id,
      { onDelete: "cascade" },
    ),
    body: text("body").notNull(),
    // slug ของ tip ที่แท็ก (tips เป็น static TS data — ไม่มี FK)
    tipSlug: text("tip_slug"),
    pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
    // reply ที่ถูกเลือกเป็น "คำตอบที่ใช่" (เฉพาะแถวคำถาม; ลบ reply แล้ว auto-clear)
    acceptedReplyId: text("accepted_reply_id").references(
      (): AnySQLiteColumn => communityPosts.id,
      { onDelete: "set null" },
    ),
    // นับไว้ล่วงหน้า (denormalized) เพื่อไม่ต้อง COUNT ทุกแถวตอน render feed
    likeCount: integer("like_count").notNull().default(0),
    replyCount: integer("reply_count").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    // feed: parent_id IS NULL (equality prefix) + เรียง created_at / thread: parent_id = X
    index("community_posts_parent_created_idx").on(t.parentId, t.createdAt),
    // section "คำถามเกี่ยวกับ tip นี้"
    index("community_posts_tip_idx").on(t.tipSlug, t.createdAt),
  ],
);

export const communityPostLikes = sqliteTable(
  "community_post_likes",
  {
    postId: text("post_id")
      .notNull()
      .references(() => communityPosts.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    // PK รวม (userId, postId): กันไลก์ซ้ำ + lookup "viewer ไลก์โพสต์ไหนบ้าง" (prefix userId)
    // จงใจใช้ composite PK แทน uniqueIndex — migration ไม่มี CREATE UNIQUE INDEX จึงผ่าน guard
    // (deploy prod ได้เลย ไม่ต้องตั้ง ALLOW_DESTRUCTIVE_MIGRATION)
    primaryKey({ columns: [t.userId, t.postId] }),
    // ช่วย cascade / lookup by post
    index("community_post_likes_post_idx").on(t.postId),
  ],
);

// re-export sql เผื่อใช้ที่อื่น
export { sql };
