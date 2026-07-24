import { ShoppingBag, ExternalLink } from "lucide-react";
import { type ShopeeProduct } from "@/lib/shopee-products";
import { formatBaht } from "@/lib/format";

/**
 * การ์ดสินค้า Shopee — ลิงก์ผ่าน /api/shopee/click (track click → 302 ไป Shopee)
 * ไม่มี imageUrl → โชว์ placeholder ไม่ให้รูปแตก
 */
export function ProductCard({
  product,
  subId,
}: {
  product: ShopeeProduct;
  subId?: string;
}) {
  const params = new URLSearchParams({
    productId: product.id,
    productTitle: product.title,
    url: product.url,
    ...(subId ? { subId } : {}),
  });
  const href = `/api/shopee/click?${params}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="card lift group flex flex-col overflow-hidden p-0"
    >
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.imageUrl}
          alt={product.title}
          loading="lazy"
          className="h-40 w-full border-b-2 border-border object-cover"
        />
      ) : (
        <div className="flex h-40 items-center justify-center border-b-2 border-border bg-muted-surface">
          <ShoppingBag className="size-10 text-muted" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-extrabold leading-snug text-foreground">
          {product.title}
        </h3>
        {product.note && (
          <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">
            {product.note}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between border-t-2 border-border pt-3">
          {product.price != null ? (
            <span className="font-extrabold text-foreground">
              {formatBaht(product.price)}
            </span>
          ) : (
            <span className="badge bg-muted-surface text-muted">Shopee</span>
          )}
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 transition-all group-hover:gap-2">
            ดูบน Shopee
            <ExternalLink className="size-4" />
          </span>
        </div>
      </div>
    </a>
  );
}
