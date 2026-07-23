"use client";

import Link from "next/link";
import { MessageCircle, CheckCircle2, Pin } from "lucide-react";
import type { FeedPost } from "@/lib/community";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/avatar";
import { RelativeTime } from "./relative-time";
import { LikeButton } from "./like-button";
import { TipChip } from "./tip-chip";
import { AcceptAnswerButton } from "./accept-answer-button";
import { PostAdminControls } from "./post-admin-controls";

export type Viewer = { id: string; isAdmin: boolean } | null;

/**
 * การ์ดโพสต์ — ใช้ได้ 3 บริบท:
 * - feed: header+body คลิกเข้า thread, body line-clamp, มี pin/badge
 * - detail: คำถามเต็มบนหน้า thread (ลบ → onDeleted พากลับ feed)
 * - reply: คำตอบ (accepted ลอยบน + badge, มีปุ่มเลือกคำตอบถ้ามีสิทธิ์)
 */
export function PostCard({
  post,
  viewer,
  variant,
  accepted = false,
  canAccept = false,
  questionId,
  onDeleted,
}: {
  post: FeedPost;
  viewer: Viewer;
  variant: "feed" | "detail" | "reply";
  accepted?: boolean;
  canAccept?: boolean;
  questionId?: string;
  onDeleted?: () => void;
}) {
  const isFeed = variant === "feed";
  const isReply = variant === "reply";
  const threadHref = `/community/${post.id}`;
  const nextPath = isReply && questionId ? `/community/${questionId}` : threadHref;

  const body = (
    <p
      className={cn(
        "mt-3 break-words whitespace-pre-wrap leading-relaxed text-foreground",
        isFeed && "line-clamp-4",
      )}
    >
      {post.body}
    </p>
  );

  return (
    <article
      className={cn(
        "card p-4 sm:p-5",
        isFeed && "lift",
        accepted && "border-success bg-success-surface/40",
      )}
    >
      <div className="flex items-center gap-2">
        <Avatar name={post.author.name} image={post.author.image} size={36} />
        <div className="min-w-0">
          <div className="truncate font-bold text-foreground">{post.author.name}</div>
          <RelativeTime ms={post.createdAt} />
        </div>

        {post.pinned && !isReply && (
          <span className="badge ml-1 bg-accent-500 text-foreground">
            <Pin className="size-3" />
            ปักหมุด
          </span>
        )}

        <div className="ml-auto">
          <PostAdminControls
            post={{
              id: post.id,
              authorId: post.author.id,
              pinned: post.pinned,
              isQuestion: !isReply,
            }}
            viewer={viewer}
            onDeleted={onDeleted}
          />
        </div>
      </div>

      {isFeed ? (
        <Link href={threadHref} className="block">
          {body}
        </Link>
      ) : (
        body
      )}

      {accepted && (
        <span className="badge mt-3 bg-success-surface text-success">
          <CheckCircle2 className="size-3.5" />
          คำตอบที่ใช่
        </span>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <LikeButton
          postId={post.id}
          initialLiked={post.likedByViewer}
          initialCount={post.likeCount}
          isLoggedIn={!!viewer}
          nextPath={nextPath}
        />

        {!isReply && (
          <Link
            href={threadHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
          >
            <MessageCircle className="size-4" />
            {post.replyCount > 0 ? `${post.replyCount} คำตอบ` : "ตอบคำถาม"}
          </Link>
        )}

        {isFeed && post.hasAccepted && (
          <span className="badge bg-success-surface text-success">
            <CheckCircle2 className="size-3.5" />
            มีคำตอบแล้ว
          </span>
        )}

        {post.tipSlug && post.tipTitle && (
          <TipChip slug={post.tipSlug} title={post.tipTitle} />
        )}

        {isReply && canAccept && questionId && (
          <div className="ml-auto">
            <AcceptAnswerButton
              questionId={questionId}
              replyId={post.id}
              accepted={accepted}
            />
          </div>
        )}
      </div>
    </article>
  );
}
