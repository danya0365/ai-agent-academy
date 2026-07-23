import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare, X } from "lucide-react";
import { getSession } from "@/lib/session";
import { getCommunityFeedPage } from "@/lib/queries";
import { getAllTips, getTipBySlug } from "@/lib/tips";
import { pickProducts } from "@/lib/shopee-products";
import { CommunityFeed } from "@/components/community/community-feed";
import { CommunitySidebar } from "@/components/community/community-sidebar";
import { PostComposer } from "@/components/community/post-composer";
import { LoginCta } from "@/components/community/login-cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ถาม-ตอบ — คอมมูนิตี้คนใช้ AI",
  description:
    "ติดตรงไหนเรื่อง AI ถามได้เลย คอมมูนิตี้ช่วยกันตอบ อ่านฟรีไม่ต้องล็อกอิน",
};

type Props = { searchParams: Promise<{ tip?: string }> };

export default async function CommunityPage({ searchParams }: Props) {
  const { tip } = await searchParams;
  const tipObj = tip ? getTipBySlug(tip) : undefined;
  const tipSlug = tipObj?.slug ?? null;

  const session = await getSession();
  const viewerRaw = session?.user ?? null;
  const viewer = viewerRaw
    ? { id: viewerRaw.id, isAdmin: viewerRaw.role === "admin" }
    : null;

  const { pinned, posts, nextCursor } = await getCommunityFeedPage({
    viewerId: viewer?.id ?? null,
    tipSlug,
  });
  const sponsored = pickProducts(undefined, 4);
  const tips = getAllTips().map((t) => ({ slug: t.slug, title: t.title }));

  const composerNext = tip ? `/community?tip=${tip}` : "/community";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header>
        <span className="badge bg-card text-foreground">
          <MessagesSquare className="size-3.5" />
          คอมมูนิตี้
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          ถาม-ตอบ
        </h1>
        <p className="mt-3 text-lg text-muted">
          ติดตรงไหน ถามได้เลย — คอมมูนิตี้ช่วยกันตอบ อ่านฟรีไม่ต้องล็อกอิน
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {tipObj && (
            <div className="card-flat flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="text-sm text-muted">
                กำลังดูคำถามเกี่ยวกับ:{" "}
                <Link
                  href={`/tips/${tipObj.slug}`}
                  className="font-bold text-brand-700 hover:underline"
                >
                  {tipObj.title}
                </Link>
              </span>
              <Link
                href="/community"
                className="badge bg-card text-muted transition hover:text-foreground"
              >
                <X className="size-3.5" />
                ดูทั้งหมด
              </Link>
            </div>
          )}

          {viewer ? (
            <PostComposer mode="post" tips={tips} preselectedTip={tipSlug} />
          ) : (
            <LoginCta next={composerNext} />
          )}

          <CommunityFeed
            initialPinned={pinned}
            initialPosts={posts}
            initialCursor={nextCursor}
            viewer={viewer}
            sponsored={sponsored}
            tipFilter={tipSlug}
          />
        </div>

        <div className="hidden lg:block">
          <CommunitySidebar />
        </div>
      </div>
    </div>
  );
}
