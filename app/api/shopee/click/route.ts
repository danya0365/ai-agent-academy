import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliateClicks } from "@/db/schema";
import { randomUUID } from "node:crypto";
import { withSubId } from "@/lib/shopee-products";

/**
 * รับ click จาก affiliate link → บันทึกใน DB → 302 ไป Shopee (คง sub_id ไว้ให้ Shopee track)
 *
 * เรียกจาก href ของ product-card โดยตรง (GET):
 *   /api/shopee/click?productId=shopee-12345&url=https://s.shopee.co.th/xxx&subId=shop
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const productTitle = searchParams.get("productTitle");
  const subId = searchParams.get("subId");
  const redirectUrl = searchParams.get("url");

  // fire-and-forget: ไม่รอ DB write — user ได้ redirect ไวที่สุด
  if (productId && redirectUrl) {
    db.insert(affiliateClicks)
      .values({
        id: randomUUID(),
        productId,
        productTitle: productTitle ?? "(ไม่ทราบชื่อ)",
        subId: subId || undefined,
      })
      .run()
      .catch(() => {
        // click พลาดไม่ควรพัง redirect
      });
  }

  // ส่ง sub_id ต่อให้ Shopee affiliate URL (Shopee dashboard จะได้เห็น breakdown)
  const target = redirectUrl
    ? withSubId(redirectUrl, subId ?? undefined)
    : new URL("/shop", req.url);

  return NextResponse.redirect(target);
}
