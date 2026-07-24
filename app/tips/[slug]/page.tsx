import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Lightbulb } from "lucide-react";
import { getTipBySlug } from "@/lib/tips";
import { TIP_COMPONENTS } from "@/components/tips/registry";
import { TipBody } from "@/components/tips/tip-body";
import { TipSocialCopy } from "@/components/tips/tip-social-copy";
import { RecommendedProducts } from "@/components/shop/recommended-products";
import { SupportDev } from "@/components/support/support-dev";
import { TipQuestions } from "@/components/community/tip-questions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tip = getTipBySlug(slug);
  if (!tip) return { title: "ไม่พบเคล็ดลับ" };
  return {
    title: `${tip.title} — รู้ก่อนใคร`,
    description: tip.summary,
  };
}

export default async function TipDetailPage({ params }: Props) {
  const { slug } = await params;
  const tip = getTipBySlug(slug);
  if (!tip) notFound();

  // มี component เฉพาะก็ใช้ตัวนั้น ไม่มีก็ fallback ไปที่ <TipBody />
  const Custom = TIP_COMPONENTS[slug];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/tips"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> กลับไปรู้ก่อนใคร
      </Link>

      <header className="mt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge bg-card text-foreground">
            <Lightbulb className="size-3.5" />
            {tip.category}
          </span>
          {tip.social && (
            <TipSocialCopy social={tip.social} slug={slug} />
          )}
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          {tip.title}
        </h1>
        <p className="mt-3 text-lg text-muted">{tip.summary}</p>
        {tip.readingTime && (
          <p className="mt-2 inline-flex items-center gap-1 text-sm text-muted">
            <Clock className="size-3.5" />
            อ่าน {tip.readingTime}
          </p>
        )}
      </header>

      <article className="mt-8">
        {Custom ? <Custom tip={tip} /> : <TipBody tip={tip} />}
      </article>

      {/* คำถาม-คำตอบเกี่ยวกับเคล็ดลับนี้ (ทำตาม tip ไม่ได้ ถามในคอมมูนิตี้) */}
      <div className="mt-12">
        <TipQuestions slug={slug} />
      </div>

      {/* สินค้าที่เกี่ยวข้องกับเคล็ดลับนี้ (contextual + sub_id = slug) */}
      <div className="mt-12">
        <RecommendedProducts tags={tip.productTags} subId={tip.slug} />
      </div>

      {/* กล่องสนับสนุน dev (ท้ายเนื้อหา — เว้นระยะจากปุ่มอื่นเพื่อความปลอดภัยของ AdSense) */}
      <div className="mt-12">
        <SupportDev />
      </div>
    </div>
  );
}
