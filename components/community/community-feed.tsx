"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Loader2, MessagesSquare } from "lucide-react";
import { FEED_AD_EVERY, type FeedPost, type FeedCursor } from "@/lib/community";
import type { ShopeeProduct } from "@/lib/shopee-products";
import { loadMoreFeed } from "@/actions/community";
import { PostCard, type Viewer } from "./post-card";
import { SponsoredProductCard } from "./sponsored-product-card";

/**
 * Feed คำถาม — หน้าแรกมาจาก props ตรง ๆ (ให้ revalidatePath หลัง create/pin/delete รีเฟรชได้)
 * หน้าถัด ๆ ไปเก็บใน state ผ่าน loadMoreFeed; dedupe by id กันซ้ำตอน boundary ขยับ
 * แทรกการ์ดสินค้า sponsored ทุก FEED_AD_EVERY โพสต์
 */
export function CommunityFeed({
  initialPinned,
  initialPosts,
  initialCursor,
  viewer,
  sponsored,
  tipFilter,
}: {
  initialPinned: FeedPost[];
  initialPosts: FeedPost[];
  initialCursor: FeedCursor | null;
  viewer: Viewer;
  sponsored: ShopeeProduct[];
  tipFilter: string | null;
}) {
  const [extra, setExtra] = useState<FeedPost[]>([]);
  const [cursor, setCursor] = useState<FeedCursor | null>(initialCursor);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function handleLoadMore() {
    if (!cursor) return;
    startTransition(async () => {
      const res = await loadMoreFeed(cursor, tipFilter);
      setExtra((prev) => [...prev, ...res.posts]);
      setCursor(res.nextCursor);
    });
  }

  function removeLocal(id: string) {
    setDeletedIds((prev) => new Set(prev).add(id));
  }

  const pageIds = new Set(initialPosts.map((p) => p.id));
  const combined = [
    ...initialPosts,
    ...extra.filter((p) => !pageIds.has(p.id)),
  ].filter((p) => !deletedIds.has(p.id));
  const pinned = initialPinned.filter((p) => !deletedIds.has(p.id));

  const isEmpty = pinned.length === 0 && combined.length === 0;

  // แทรกโพสต์สนับสนุนหลังทุก FEED_AD_EVERY โพสต์ (วนสินค้าใน sponsored)
  const rows: ReactNode[] = [];
  combined.forEach((post, i) => {
    rows.push(
      <PostCard
        key={post.id}
        post={post}
        viewer={viewer}
        variant="feed"
        onDeleted={() => removeLocal(post.id)}
      />,
    );
    const oneBased = i + 1;
    if (oneBased % FEED_AD_EVERY === 0 && sponsored.length > 0) {
      const adIndex = Math.floor(oneBased / FEED_AD_EVERY) - 1;
      const product = sponsored[adIndex % sponsored.length];
      rows.push(<SponsoredProductCard key={`ad-${post.id}`} product={product} />);
    }
  });

  if (isEmpty) {
    return (
      <div className="card flex flex-col items-center gap-2 p-10 text-center">
        <MessagesSquare className="size-10 text-muted" />
        <p className="font-bold text-foreground">
          {tipFilter ? "ยังไม่มีคำถามเกี่ยวกับเคล็ดลับนี้" : "ยังไม่มีคำถามเลย"}
        </p>
        <p className="text-sm text-muted">เป็นคนแรกที่ถามได้เลย!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pinned.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          viewer={viewer}
          variant="feed"
          onDeleted={() => removeLocal(post.id)}
        />
      ))}

      {rows}

      {cursor && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={pending}
          className="btn btn-secondary w-full"
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              กำลังโหลด...
            </>
          ) : (
            "โหลดเพิ่ม"
          )}
        </button>
      )}
    </div>
  );
}
