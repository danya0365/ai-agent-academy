import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { pickProducts } from "@/lib/shopee-products";
import { ProductCard } from "@/components/shop/product-card";

/**
 * แถบข้างขวา (desktop เท่านั้น) — สินค้าที่ dev แนะนำ เรียงเดี่ยวแนวตั้ง
 * ⚠️ ไม่ใช้ <RecommendedProducts> เพราะ grid ของมันเป็น viewport-based
 * (sm:grid-cols-2 lg:grid-cols-3) จะบี้ 3 คอลัมน์ในความกว้าง 320px
 */
export function CommunitySidebar() {
  const items = pickProducts(undefined, 3);
  if (items.length === 0) return null;

  return (
    <aside className="sticky top-20 space-y-4">
      <div className="card p-4">
        <h2 className="flex items-center gap-2 font-black tracking-tight text-foreground">
          <ShoppingBag className="size-5 text-brand-500" />
          ของที่ dev แนะนำ
        </h2>
        <p className="mt-1 text-xs text-muted">
          เป็นลิงก์ affiliate — ช้อปผ่านลิงก์นี้ dev ได้ค่าคอมเล็กน้อย ราคาคุณเท่าเดิม 🙏
        </p>
      </div>

      <div className="space-y-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} subId="community-sidebar" />
        ))}
      </div>

      <Link
        href="/shop"
        className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 transition hover:gap-2"
      >
        ดูของแนะนำทั้งหมด
        <ArrowRight className="size-4" />
      </Link>
    </aside>
  );
}
