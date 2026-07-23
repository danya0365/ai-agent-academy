/**
 * คอมมูนิตี้ถาม-ตอบ — โมดูลกลาง (ค่าคงที่ + type + helper บริสุทธิ์)
 *
 * ไฟล์นี้ import ได้ทั้ง client component, server page และ action
 * (จงใจแยกจาก actions/community.ts เพราะไฟล์ "use server" export ได้เฉพาะ async function)
 *
 * ⚠️ type ทุกตัวต้อง serializable (ข้าม action/RSC boundary ได้) — createdAt เป็น epoch ms
 * ห้าม import lib/queries (server-only) ที่นี่ — component ฝั่ง client รับแต่ type พวกนี้
 */

import { formatDate } from "@/lib/format";

/** ความยาวสูงสุดของโพสต์/คำตอบ */
export const POST_BODY_MAX = 1000;

/** จำนวนโพสต์ต่อหน้าใน feed (ดึงเกิน 1 เพื่อเช็คว่ามีหน้าถัดไป) */
export const FEED_PAGE_SIZE = 10;

/** แทรกการ์ดสินค้า sponsored หลังทุก ๆ N โพสต์ใน feed */
export const FEED_AD_EVERY = 5;

/** ผู้เขียนโพสต์ (เท่าที่ feed ต้องใช้) */
export type PostAuthor = {
  id: string;
  name: string;
  image: string | null;
};

/** โพสต์หนึ่งชิ้นในรูปแบบ serializable สำหรับ feed/thread */
export type FeedPost = {
  id: string;
  body: string;
  tipSlug: string | null;
  /** resolve ฝั่ง server เพื่อไม่ให้ TIPS ทั้งก้อนหลุดเข้า client bundle */
  tipTitle: string | null;
  pinned: boolean;
  likeCount: number;
  replyCount: number;
  /** acceptedReplyId != null — มีคำตอบที่ถูกเลือกแล้ว */
  hasAccepted: boolean;
  likedByViewer: boolean;
  /** epoch ms — serializable ข้าม action boundary */
  createdAt: number;
  author: PostAuthor;
};

/** reply ในหน้า thread — เพิ่ม flag ว่าเป็น "คำตอบที่ใช่" หรือไม่ */
export type ThreadReply = FeedPost & { accepted: boolean };

/** cursor แบบ keyset — ต้องใช้คู่ (createdAt, id) เพราะ timestamp เก็บเป็นวินาที ชนกันได้ */
export type FeedCursor = { createdAt: number; id: string };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * เวลาแบบสัมพัทธ์ ภาษาไทย ("5 นาทีที่แล้ว")
 * รับ epoch ms ทั้งคู่เพื่อให้ pure (คำนวณ now ที่ผู้เรียก — hydration-safe)
 */
export function formatRelativeThai(thenMs: number, nowMs: number): string {
  const diff = nowMs - thenMs;
  if (diff < MINUTE) return "เมื่อสักครู่";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} นาทีที่แล้ว`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} ชั่วโมงที่แล้ว`;
  if (diff < 2 * DAY) return "เมื่อวาน";
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} วันที่แล้ว`;
  return formatDate(thenMs);
}

/** ตัดข้อความให้สั้นลง + ต่อ "…" (สำหรับ metadata / การ์ดย่อ) */
export function snippet(body: string, max = 120): string {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max).trimEnd() + "…";
}
