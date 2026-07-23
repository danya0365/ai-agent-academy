import type { Metadata } from "next";
import { ShoppingBag, ExternalLink } from "lucide-react";
import { getProductCategories, getAllProducts } from "@/lib/shopee-products";
import { ProductCard } from "@/components/shop/product-card";
import { SupportDev } from "@/components/support/support-dev";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ของที่ dev แนะนำ",
  description:
    "รวมของ/เครื่องมือที่ dev คัดมาแนะนำ ช้อปผ่านลิงก์เพื่อช่วยสนับสนุน dev ในราคาปกติ",
};

export default function ShopPage() {
  const categories = getProductCategories();
  const total = getAllProducts().length;
  const mainShopUrl = process.env.NEXT_PUBLIC_SHOPEE_AFFILIATE_URL;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <div className="max-w-2xl">
        <span className="badge bg-card text-foreground">
          <ShoppingBag className="size-3.5" /> ของที่ dev แนะนำ
        </span>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
          ของที่ dev คัดมาแนะนำ
        </h1>
        <p className="mt-3 text-lg text-muted">
          ช้อปผ่านลิงก์เหล่านี้ในราคาปกติ แล้ว dev จะได้ค่าคอมเล็กน้อยจาก Shopee
          เป็นกำลังใจหาค่าเทอมลูก 🙏
        </p>
        <p className="mt-2 text-xs text-muted">
          * ลิงก์ทั้งหมดเป็น affiliate — ราคาที่คุณจ่ายเท่าเดิมทุกบาท
        </p>
        {mainShopUrl && (
          <a
            href={mainShopUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="btn btn-secondary mt-4"
          >
            <ExternalLink className="size-4" />
            ไปที่ร้าน Shopee ของ dev
          </a>
        )}
      </div>

      {/* สินค้าแยกตามหมวด */}
      {total === 0 ? (
        <p className="card-flat mt-8 p-8 text-center text-muted">
          ยังไม่มีสินค้าแนะนำในขณะนี้ กลับมาใหม่เร็ว ๆ นี้
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {categories.map((category) => {
            const items = getAllProducts().filter(
              (p) => p.category === category,
            );
            return (
              <section key={category}>
                <h2 className="mb-4 text-2xl font-black tracking-tight text-foreground">
                  {category}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      subId="shop"
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* กล่องสนับสนุน dev */}
      <div className="mt-12">
        <SupportDev />
      </div>
    </div>
  );
}
