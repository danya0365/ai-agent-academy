import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
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

export type CourseType = "scheduled" | "open";

export const courses = sqliteTable("courses", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull().$type<CourseType>(), // 'scheduled' | 'open'
  price: integer("price").notNull(), // หน่วยเป็นบาท (จำนวนเต็ม)
  coverImageUrl: text("cover_image_url"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const courseSessions = sqliteTable(
  "course_sessions",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    startAt: integer("start_at", { mode: "timestamp" }).notNull(),
    endAt: integer("end_at", { mode: "timestamp" }).notNull(),
    capacity: integer("capacity").notNull(),
    location: text("location"),
    isOpen: integer("is_open", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [index("course_sessions_course_idx").on(t.courseId)],
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
    // null สำหรับคอร์สแบบ open
    sessionId: text("session_id").references(() => courseSessions.id, {
      onDelete: "set null",
    }),
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
    index("enrollments_session_status_idx").on(t.sessionId, t.status),
    // กันสลิปซ้ำ — SQLite ยอมให้ค่า null ซ้ำกันได้
    uniqueIndex("enrollments_slip_trans_ref_unique").on(t.slipTransRef),
  ],
);

// re-export sql เผื่อใช้ที่อื่น
export { sql };
