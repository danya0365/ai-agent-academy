/**
 * สินค้าแนะนำ Shopee Affiliate — type + helper (logic)
 *
 * ระบบ:
 * - แต่ละสินค้ามี tags → เอาไปจับคู่กับ tip.productTags (โชว์สินค้าที่เกี่ยวกับเนื้อหา)
 * - category → ใช้จัดกลุ่มในหน้า /shop
 * - featured → ใช้เป็น fallback เวลาไม่มี tag ตรง
 * - withSubId() → แนบ sub_id (เช่น slug ของหน้า) เพื่อดูใน dashboard Shopee ว่าหน้าไหนทำเงิน
 *
 * 📦 ตัว data (array สินค้า) อยู่ใน shopee-products.generated.ts ซึ่งถูก "เขียนอัตโนมัติ"
 * โดย scripts/fetch-shopee-products.ts (ดึงของขายดีจาก Shopee Affiliate Open API)
 * อัปเดตด้วย:  npm run shopee:fetch   (ปรับหมวด/keyword ที่ scripts/shopee-buckets.ts)
 * ห้ามเพิ่มสินค้าที่นี่ด้วยมือ — จะโดนเขียนทับตอนรัน script
 */
import { GENERATED_PRODUCTS } from "./shopee-products.generated";

export type ShopeeProduct = {
  id: string;
  title: string;
  /** ลิงก์ affiliate จริง (เช่น https://s.shopee.co.th/xxxx) */
  url: string;
  /** URL รูปสินค้า (ออปชัน — ไม่มีจะโชว์ placeholder) */
  imageUrl?: string;
  /** ราคาโดยประมาณเป็นบาท (ออปชัน — อาจล้าสมัย) */
  price?: number;
  /** เหตุผลสั้น ๆ ที่ dev แนะนำ */
  note?: string;
  /** หมวดสำหรับหน้า /shop */
  category: string;
  /** แท็กสำหรับจับคู่กับเคล็ดลับ (tip.productTags) */
  tags: string[];
  /** ใช้เป็น fallback เมื่อไม่มีแท็กตรง */
  featured?: boolean;
};

/** สินค้าทั้งหมด (data มาจากไฟล์ generated — เขียนโดย npm run shopee:fetch) */
export const SHOPEE_PRODUCTS: ShopeeProduct[] = GENERATED_PRODUCTS;

/** สินค้าทั้งหมด */
export function getAllProducts(): ShopeeProduct[] {
  return SHOPEE_PRODUCTS;
}

/** สินค้าที่มีแท็กตรงกับที่ส่งมา (อย่างน้อย 1 แท็ก) */
export function getProductsByTags(tags: string[]): ShopeeProduct[] {
  const set = new Set(tags);
  return SHOPEE_PRODUCTS.filter((p) => p.tags.some((t) => set.has(t)));
}

/** สินค้าที่ตั้ง featured ไว้ */
export function getFeaturedProducts(): ShopeeProduct[] {
  return SHOPEE_PRODUCTS.filter((p) => p.featured);
}

/** หมวดทั้งหมด (ไม่ซ้ำ เรียงตามที่พบ) */
export function getProductCategories(): string[] {
  return [...new Set(SHOPEE_PRODUCTS.map((p) => p.category))];
}

/**
 * เลือกสินค้าไปแสดง: จับคู่ด้วยแท็กก่อน → ถ้าไม่เจอใช้ featured → สุดท้ายใช้ตัวแรก ๆ
 * limit = จำนวนสูงสุดที่จะโชว์
 */
export function pickProducts(tags?: string[], limit = 3): ShopeeProduct[] {
  let items: ShopeeProduct[] = [];
  if (tags && tags.length > 0) items = getProductsByTags(tags);
  if (items.length === 0) items = getFeaturedProducts();
  if (items.length === 0) items = SHOPEE_PRODUCTS;
  return items.slice(0, limit);
}

/**
 * แนบ sub_id ต่อท้ายลิงก์ เพื่อ track ว่าหน้าไหน/ตำแหน่งไหนทำเงิน (ดูใน dashboard Shopee)
 * หมายเหตุ: ได้ผลกับลิงก์ affiliate ที่รองรับ sub_id — ลิงก์ย่อ s.shopee.co.th
 * บางกรณีอาจตัด param ทิ้ง ถ้าต้องการชัวร์ให้ตั้ง sub_id ตอนสร้างลิงก์ในเครื่องมือ Shopee
 */
export function withSubId(url: string, subId?: string): string {
  if (!subId) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}sub_id=${encodeURIComponent(subId)}`;
}
