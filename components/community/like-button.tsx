"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toggleLike } from "@/actions/community";
import { cn } from "@/lib/cn";

/**
 * ปุ่มไลก์แบบ optimistic
 * - guest: เด้งไปหน้า login (ไม่ล็อกการอ่าน แต่ต้องล็อกอินถึงจะไลก์)
 * - member: flip state + count ทันที แล้วค่อย reconcile กับค่าจริงจาก server / revert ถ้า error
 */
export function LikeButton({
  postId,
  initialLiked,
  initialCount,
  isLoggedIn,
  nextPath,
}: {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
  nextPath: string;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const res = await toggleLike(postId);
      if (res.ok) {
        setLiked(res.liked);
        setCount(res.likeCount);
      } else {
        setLiked(prevLiked);
        setCount(prevCount);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "เลิกถูกใจ" : "ถูกใจ"}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-bold transition",
        liked ? "text-error" : "text-muted hover:text-foreground",
      )}
    >
      <Heart className={cn("size-4 transition-transform", liked && "scale-110 fill-current")} />
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
