"use client";

import { useRouter } from "next/navigation";
import type { FeedPost } from "@/lib/community";
import { PostCard, type Viewer } from "./post-card";

/**
 * wrapper ฝั่ง client ของการ์ดคำถามในหน้า thread
 * (ต้องเป็น client เพราะ onDeleted ใช้ router.push — ส่ง function จาก server → client ไม่ได้)
 */
export function ThreadQuestion({ post, viewer }: { post: FeedPost; viewer: Viewer }) {
  const router = useRouter();
  return (
    <PostCard
      post={post}
      viewer={viewer}
      variant="detail"
      onDeleted={() => router.push("/community")}
    />
  );
}
