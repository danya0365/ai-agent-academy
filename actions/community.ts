"use server";

import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { communityPosts, communityPostLikes } from "@/db/schema";
import { requireUser, getSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { getTipBySlug } from "@/lib/tips";
import { getCommunityFeedPage } from "@/lib/queries";
import { POST_BODY_MAX, type FeedCursor, type FeedPost } from "@/lib/community";

type ActionResult = { ok: true } | { ok: false; error: string };

/** ตรวจเนื้อหาโพสต์/คำตอบ (hand-rolled ตาม convention repo — ไม่มี zod) */
function validateBody(
  raw: unknown,
): { ok: true; body: string } | { ok: false; error: string } {
  const body = String(raw ?? "").trim();
  if (!body) return { ok: false, error: "กรุณาพิมพ์ข้อความก่อนโพสต์" };
  if (body.length > POST_BODY_MAX) {
    return {
      ok: false,
      error: `ข้อความยาวเกิน ${POST_BODY_MAX.toLocaleString("th-TH")} ตัวอักษร`,
    };
  }
  return { ok: true, body };
}

/** ตั้งคำถามใหม่ (top-level) — แท็ก tip ได้ (ไม่บังคับ) */
export async function createPost(input: {
  body: string;
  tipSlug?: string | null;
}): Promise<ActionResult> {
  const user = await requireUser("/community");
  const rl = await rateLimit("create-post", {
    windowMs: 60_000, max: 3, message: "ตั้งคำถามได้สูงสุด 3 ครั้งต่อนาที",
  });
  if (!rl.ok) return rl;

  const v = validateBody(input.body);
  if (!v.ok) return v;

  const tipSlug = input.tipSlug ? String(input.tipSlug) : null;
  if (tipSlug && !getTipBySlug(tipSlug)) {
    return { ok: false, error: "ไม่พบเคล็ดลับที่เลือก" };
  }

  await db
    .insert(communityPosts)
    .values({
      id: randomUUID(),
      authorId: user.id,
      parentId: null,
      body: v.body,
      tipSlug,
    })
    .run();

  revalidatePath("/community");
  if (tipSlug) revalidatePath(`/tips/${tipSlug}`);
  return { ok: true };
}

/** ตอบคำถาม — ตอบได้เฉพาะคำถามหลัก (บังคับ thread ชั้นเดียว) */
export async function createReply(
  postId: string,
  body: string,
): Promise<ActionResult> {
  const user = await requireUser(`/community/${postId}`);
  const rl = await rateLimit("create-reply", {
    windowMs: 60_000, max: 5, message: "ตอบคำถามได้สูงสุด 5 ครั้งต่อนาที",
  });
  if (!rl.ok) return rl;

  const v = validateBody(body);
  if (!v.ok) return v;

  const parent = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .get();
  if (!parent) return { ok: false, error: "ไม่พบโพสต์นี้" };
  if (parent.parentId) return { ok: false, error: "ตอบได้เฉพาะในคำถามหลัก" };

  await db.transaction(async (tx) => {
    await tx
      .insert(communityPosts)
      .values({
        id: randomUUID(),
        authorId: user.id,
        parentId: postId,
        body: v.body,
      })
      .run();
    await tx
      .update(communityPosts)
      .set({ replyCount: sql`${communityPosts.replyCount} + 1` })
      .where(eq(communityPosts.id, postId))
      .run();
  });

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  return { ok: true };
}

/**
 * กด/ยกเลิกไลก์ — คืน state ล่าสุดให้ client reconcile กับ optimistic
 * ⚠️ จงใจ "ไม่" revalidatePath — กัน server re-render มาทับ optimistic state
 * (ทุกหน้าเป็น force-dynamic อยู่แล้ว ตัวเลขสดเสมอเมื่อ navigate ใหม่)
 */
export async function toggleLike(
  postId: string,
): Promise<{ ok: true; liked: boolean; likeCount: number } | { ok: false; error: string }> {
  const user = await requireUser();
  const rl = await rateLimit("toggle-like", {
    windowMs: 60_000, max: 30, message: "ไลก์บ่อยไป รอสักครู่",
  });
  if (!rl.ok) return rl;

  const post = await db
    .select({ id: communityPosts.id })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .get();
  if (!post) return { ok: false, error: "ไม่พบโพสต์นี้" };

  const existing = await db
    .select({ postId: communityPostLikes.postId })
    .from(communityPostLikes)
    .where(
      and(eq(communityPostLikes.postId, postId), eq(communityPostLikes.userId, user.id)),
    )
    .get();

  let liked = !existing;
  try {
    await db.transaction(async (tx) => {
      if (existing) {
        await tx
          .delete(communityPostLikes)
          .where(
            and(
              eq(communityPostLikes.postId, postId),
              eq(communityPostLikes.userId, user.id),
            ),
          )
          .run();
        await tx
          .update(communityPosts)
          .set({ likeCount: sql`max(${communityPosts.likeCount} - 1, 0)` })
          .where(eq(communityPosts.id, postId))
          .run();
      } else {
        await tx
          .insert(communityPostLikes)
          .values({ postId, userId: user.id })
          .run();
        await tx
          .update(communityPosts)
          .set({ likeCount: sql`${communityPosts.likeCount} + 1` })
          .where(eq(communityPosts.id, postId))
          .run();
      }
    });
  } catch {
    // ชน unique index (กดพร้อมกันหลาย tab) — ถือว่าไลก์อยู่แล้ว, ตัวเลขจริงอ่านด้านล่าง
    liked = true;
  }

  const fresh = await db
    .select({ n: communityPosts.likeCount })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .get();

  return { ok: true, liked, likeCount: Number(fresh?.n ?? 0) };
}

/** เลือก/ยกเลิก "คำตอบที่ใช่" — เจ้าของคำถามหรือแอดมิน (กดซ้ำ = ยกเลิก) */
export async function acceptReply(
  questionId: string,
  replyId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const rl = await rateLimit("accept-reply", {
    windowMs: 60_000, max: 10, message: "ดำเนินการบ่อยไป รอสักครู่",
  });
  if (!rl.ok) return rl;

  const question = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, questionId))
    .get();
  if (!question || question.parentId) {
    return { ok: false, error: "ไม่พบคำถามนี้" };
  }
  if (user.id !== question.authorId && user.role !== "admin") {
    return { ok: false, error: "เฉพาะเจ้าของคำถามหรือแอดมินเท่านั้น" };
  }

  const reply = await db
    .select({ id: communityPosts.id, parentId: communityPosts.parentId })
    .from(communityPosts)
    .where(eq(communityPosts.id, replyId))
    .get();
  if (!reply || reply.parentId !== questionId) {
    return { ok: false, error: "ไม่พบคำตอบนี้" };
  }

  const next = question.acceptedReplyId === replyId ? null : replyId;
  await db
    .update(communityPosts)
    .set({ acceptedReplyId: next })
    .where(eq(communityPosts.id, questionId))
    .run();

  revalidatePath("/community");
  revalidatePath(`/community/${questionId}`);
  return { ok: true };
}

/** ลบโพสต์ — เจ้าของหรือแอดมิน (คำถาม: replies + likes หายตาม cascade) */
export async function deletePost(postId: string): Promise<ActionResult> {
  const user = await requireUser();

  const post = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .get();
  if (!post) return { ok: false, error: "ไม่พบโพสต์นี้" };
  // deletePost — check rate limit after post exists to avoid leaking info
  const rl = await rateLimit("delete-post", {
    windowMs: 60_000, max: 5, message: "ลบบ่อยไป รอสักครู่",
  });
  if (!rl.ok) return rl;
  if (user.id !== post.authorId && user.role !== "admin") {
    return { ok: false, error: "ลบได้เฉพาะโพสต์ของตัวเองหรือแอดมิน" };
  }

  if (post.parentId) {
    // reply: อัปเดตคำถามแม่ (ลด replyCount + เคลียร์ accepted ถ้าตรง) แล้วค่อยลบ
    const parentId = post.parentId;
    await db.transaction(async (tx) => {
      await tx
        .update(communityPosts)
        .set({
          replyCount: sql`max(${communityPosts.replyCount} - 1, 0)`,
          acceptedReplyId: sql`case when ${communityPosts.acceptedReplyId} = ${postId} then null else ${communityPosts.acceptedReplyId} end`,
        })
        .where(eq(communityPosts.id, parentId))
        .run();
      // ลบ reply (likes ของ reply หายตาม cascade)
      await tx.delete(communityPosts).where(eq(communityPosts.id, postId)).run();
    });
  } else {
    // คำถาม: cascade ลบ replies + likes ทั้ง thread
    await db.delete(communityPosts).where(eq(communityPosts.id, postId)).run();
  }

  revalidatePath("/community");
  revalidatePath(`/community/${post.parentId ?? postId}`);
  if (post.tipSlug) revalidatePath(`/tips/${post.tipSlug}`);
  return { ok: true };
}

/** ปัก/ถอนหมุดคำถาม — แอดมินเท่านั้น */
export async function togglePin(postId: string): Promise<ActionResult> {
  const s = await getSession();
  if (s?.user?.role !== "admin") {
    return { ok: false, error: "เฉพาะแอดมินเท่านั้น" };
  }

  const post = await db
    .select({ id: communityPosts.id, parentId: communityPosts.parentId, pinned: communityPosts.pinned })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .get();
  if (!post) return { ok: false, error: "ไม่พบโพสต์นี้" };
  if (post.parentId) return { ok: false, error: "ปักหมุดได้เฉพาะคำถาม" };

  await db
    .update(communityPosts)
    .set({ pinned: !post.pinned })
    .where(eq(communityPosts.id, postId))
    .run();

  revalidatePath("/community");
  return { ok: true };
}

/** โหลด feed หน้าถัดไป (อ่านอย่างเดียว — guest เรียกได้) */
export async function loadMoreFeed(
  cursor: FeedCursor,
  tipSlug?: string | null,
): Promise<{ posts: FeedPost[]; nextCursor: FeedCursor | null }> {
  const s = await getSession();
  const { posts, nextCursor } = await getCommunityFeedPage({
    viewerId: s?.user?.id ?? null,
    cursor,
    tipSlug: tipSlug ?? null,
  });
  return { posts, nextCursor };
}
