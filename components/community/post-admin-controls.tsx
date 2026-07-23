"use client";

import { useTransition } from "react";
import { Trash2, Pin, PinOff } from "lucide-react";
import { deletePost, togglePin } from "@/actions/community";
import { cn } from "@/lib/cn";

/**
 * ปุ่มจัดการโพสต์ (inline icon — repo ยังไม่มี dropdown primitive)
 * - ลบ: เจ้าของหรือแอดมิน
 * - ปัก/ถอนหมุด: แอดมิน + เฉพาะคำถาม
 */
export function PostAdminControls({
  post,
  viewer,
  onDeleted,
}: {
  post: { id: string; authorId: string; pinned: boolean; isQuestion: boolean };
  viewer: { id: string; isAdmin: boolean } | null;
  onDeleted?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  const canDelete = !!viewer && (viewer.id === post.authorId || viewer.isAdmin);
  const canPin = !!viewer && viewer.isAdmin && post.isQuestion;
  if (!canDelete && !canPin) return null;

  function handleDelete() {
    if (!window.confirm("ลบโพสต์นี้? ลบแล้วกู้คืนไม่ได้")) return;
    startTransition(async () => {
      const res = await deletePost(post.id);
      if (res.ok) onDeleted?.();
      else window.alert(res.error);
    });
  }

  function handlePin() {
    startTransition(async () => {
      await togglePin(post.id);
    });
  }

  return (
    <div className="flex items-center gap-1">
      {canPin && (
        <button
          type="button"
          onClick={handlePin}
          disabled={pending}
          title={post.pinned ? "ถอนหมุด" : "ปักหมุด"}
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-lg border-2 border-border transition hover:bg-muted-surface",
            post.pinned ? "bg-accent-500 text-foreground" : "bg-card text-muted",
          )}
        >
          {post.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          title="ลบโพสต์"
          className="inline-flex size-8 items-center justify-center rounded-lg border-2 border-border bg-card text-muted transition hover:bg-error-surface hover:text-error"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
