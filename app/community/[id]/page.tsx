import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/session";
import { getPostWithReplies } from "@/lib/queries";
import { getTipBySlug } from "@/lib/tips";
import { snippet } from "@/lib/community";
import { ThreadQuestion } from "@/components/community/thread-question";
import { PostCard } from "@/components/community/post-card";
import { PostComposer } from "@/components/community/post-composer";
import { LoginCta } from "@/components/community/login-cta";
import { RecommendedProducts } from "@/components/shop/recommended-products";
import { SupportDev } from "@/components/support/support-dev";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getPostWithReplies(id);
  if (!data || data.parentId) return { title: "ถาม-ตอบ" };
  return { title: `${snippet(data.post.body, 60)} — ถาม-ตอบ` };
}

export default async function ThreadPage({ params }: Props) {
  const { id } = await params;

  const session = await getSession();
  const viewerRaw = session?.user ?? null;
  const viewer = viewerRaw
    ? { id: viewerRaw.id, isAdmin: viewerRaw.role === "admin" }
    : null;

  const data = await getPostWithReplies(id, viewer?.id ?? null);
  if (!data) notFound();
  // ถ้า id ที่ขอเป็น reply → พาไป thread แม่
  if (data.parentId) redirect(`/community/${data.parentId}`);

  const { post, replies } = data;
  const linkedTip = post.tipSlug ? getTipBySlug(post.tipSlug) : undefined;
  const canAccept = !!viewer && (viewer.id === post.author.id || viewer.isAdmin);

  // accepted ลอยขึ้นบนสุด แล้วเรียงเก่า→ใหม่
  const sorted = [...replies].sort((a, b) => {
    if (a.accepted !== b.accepted) return a.accepted ? -1 : 1;
    return a.createdAt - b.createdAt;
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/community"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> กลับไปถาม-ตอบ
      </Link>

      <div className="mt-3">
        <ThreadQuestion post={post} viewer={viewer} />
      </div>

      <div className="mt-6">
        {viewer ? (
          <PostComposer mode="reply" postId={post.id} />
        ) : (
          <LoginCta
            next={`/community/${post.id}`}
            message="อยากตอบคำถามนี้? เข้าสู่ระบบก่อนนะ"
          />
        )}
      </div>

      <h2 className="mt-8 text-lg font-black tracking-tight text-foreground">
        {replies.length > 0 ? `${replies.length} คำตอบ` : "คำตอบ"}
      </h2>

      {replies.length === 0 ? (
        <p className="mt-2 text-muted">ยังไม่มีใครตอบ — ร่วมตอบเป็นคนแรกเลย!</p>
      ) : (
        <div className="mt-4 space-y-4">
          {sorted.map((r) => (
            <PostCard
              key={r.id}
              post={r}
              viewer={viewer}
              variant="reply"
              accepted={r.accepted}
              canAccept={canAccept}
              questionId={post.id}
            />
          ))}
        </div>
      )}

      {/* สินค้าที่เกี่ยวข้องกับเคล็ดลับที่ผูก (contextual) */}
      <div className="mt-12">
        <RecommendedProducts
          tags={linkedTip?.productTags}
          subId={`community-${post.id}`}
        />
      </div>

      <div className="mt-12">
        <SupportDev />
      </div>
    </div>
  );
}
