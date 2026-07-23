import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { getAllTips } from "@/lib/tips";
import { TipCard } from "@/components/tips/tip-card";
import { RecommendedProducts } from "@/components/shop/recommended-products";
import { SupportDev } from "@/components/support/support-dev";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "รู้ก่อนใคร — เคล็ดลับที่ dev ใช้จริง",
  description:
    "รวมเคล็ดลับใช้ AI ทำงานให้เร็วขึ้น เขียน prompt ให้แม่น เครื่องมือฟรี และไอเดียหารายได้ อ่านฟรีทั้งหมด",
};

export default function TipsPage() {
  const tips = getAllTips();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <div className="max-w-2xl">
        <span className="badge bg-card text-foreground">
          <Sparkles className="size-3.5" /> รู้ก่อนใคร
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          เคล็ดลับที่ dev ใช้จริง
        </h1>
        <p className="mt-3 text-lg text-muted">
          รวมเคล็ดลับใช้ AI ทำงานให้เร็วขึ้น เขียน prompt ให้แม่น เครื่องมือฟรี
          และไอเดียหารายได้ — อ่านฟรีทั้งหมด ไม่ต้องล็อกอิน
        </p>
      </div>

      {/* Grid การ์ดเคล็ดลับ */}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip) => (
          <TipCard key={tip.slug} tip={tip} />
        ))}
      </div>

      {/* ของที่ dev แนะนำ (featured) */}
      <div className="mt-12">
        <RecommendedProducts subId="tips-list" title="ของที่ dev แนะนำ" />
      </div>

      {/* กล่องสนับสนุน dev */}
      <div className="mt-12">
        <SupportDev />
      </div>
    </div>
  );
}
