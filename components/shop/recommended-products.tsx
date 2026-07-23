import { ShoppingBag } from "lucide-react";
import { pickProducts } from "@/lib/shopee-products";
import { ProductCard } from "@/components/shop/product-card";

/**
 * บล็อก "ของที่ dev แนะนำ" — เลือกสินค้าตามแท็ก (contextual) แล้ว fallback เป็น featured
 * ใช้ซ้ำได้ทั้งหน้าเคล็ดลับ, หน้ารวม, และหน้า /shop
 *
 * - tags  = แท็กของเคล็ดลับ (tip.productTags) เพื่อจับคู่สินค้าที่เกี่ยวข้อง
 * - subId = ตัวติดตามใน dashboard Shopee (เช่น slug ของหน้า)
 */
export function RecommendedProducts({
  tags,
  subId,
  title = "ของที่ dev แนะนำ",
  limit = 3,
}: {
  tags?: string[];
  subId?: string;
  title?: string;
  limit?: number;
}) {
  const items = pickProducts(tags, limit);
  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
        <ShoppingBag className="size-5 text-brand-500" />
        {title}
      </h2>
      <p className="mt-1 text-xs text-muted">
        เป็นลิงก์ affiliate — ถ้าคุณช้อปผ่านลิงก์นี้ dev ได้ค่าคอมเล็กน้อย
        โดยราคาคุณเท่าเดิม 🙏
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} subId={subId} />
        ))}
      </div>
    </section>
  );
}
