import { Megaphone } from "lucide-react";
import type { ShopeeProduct } from "@/lib/shopee-products";
import { ProductCard } from "@/components/shop/product-card";

/**
 * การ์ดสินค้าแบบ "โพสต์สนับสนุน" ที่แทรกใน feed (สไตล์ promoted post ของ X)
 * ติดป้าย "ผู้สนับสนุน" ชัดเจน + disclosure affiliate — ไม่กลืนเป็นเนื้อหา (AdSense-safe)
 */
export function SponsoredProductCard({ product }: { product: ShopeeProduct }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b-2 border-border bg-accent-500 px-4 py-2 text-foreground">
        <Megaphone className="size-4" />
        <span className="text-sm font-black">ผู้สนับสนุน</span>
        <span className="ml-auto text-xs font-medium opacity-80">
          ลิงก์ affiliate · ราคาเท่าเดิม
        </span>
      </div>
      <div className="p-4">
        <ProductCard product={product} subId="community-feed" />
      </div>
    </div>
  );
}
