/**
 * สินค้าแนะนำ Shopee Affiliate — เก็บเป็น data ล้วน (typed array)
 *
 * ระบบ:
 * - แต่ละสินค้ามี tags → เอาไปจับคู่กับ tip.productTags (โชว์สินค้าที่เกี่ยวกับเนื้อหา)
 * - category → ใช้จัดกลุ่มในหน้า /shop
 * - featured → ใช้เป็น fallback เวลาไม่มี tag ตรง
 * - withSubId() → แนบ sub_id (เช่น slug ของหน้า) เพื่อดูใน dashboard Shopee ว่าหน้าไหนทำเงิน
 *
 * ⚠️ ตัวอย่างด้านล่างเป็น placeholder — เปลี่ยน url เป็น "ลิงก์ affiliate จริง"
 * (สร้างจาก affiliate.shopee.co.th) และใส่ imageUrl เป็นรูปสินค้าจริงของ Shopee
 * ราคา (price) เป็นออปชัน และอาจล้าสมัย — จะไม่ใส่ก็ได้
 */

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

export const SHOPEE_PRODUCTS: ShopeeProduct[] = [
  {
    id: "work-desk-stand",
    title: "แท่นวางโน้ตบุ๊ก / จัดโต๊ะทำงาน",
    url: "https://s.shopee.co.th/9zwMSNXwuk",
    note: "จัดโต๊ะให้ทำงานกับ AI ได้นานขึ้นโดยไม่ปวดคอ",
    category: "อุปกรณ์ทำงาน",
    tags: ["ทำงาน", "ประสิทธิภาพ"],
    featured: true,
  },
  {
    id: "wireless-keyboard",
    title: "คีย์บอร์ดไร้สาย พิมพ์เร็ว",
    url: "https://s.shopee.co.th/9zwMSNXwuk",
    note: "พิมพ์ prompt/พิมพ์งานได้ลื่นขึ้น",
    category: "อุปกรณ์ทำงาน",
    tags: ["ทำงาน", "prompt"],
  },
  {
    id: "content-mic",
    title: "ไมโครโฟนอัดคลิป คุณภาพดี",
    url: "https://s.shopee.co.th/9zwMSNXwuk",
    note: "เริ่มทำคอนเทนต์/สอนออนไลน์หารายได้เสริม",
    category: "ทำคอนเทนต์",
    tags: ["รายได้", "เครื่องมือ"],
    featured: true,
  },
  {
    id: "ring-light",
    title: "ไฟ Ring Light สำหรับถ่ายคลิป",
    url: "https://s.shopee.co.th/9zwMSNXwuk",
    note: "คลิปดูโปรขึ้น เพิ่มโอกาสมีคนติดตาม",
    category: "ทำคอนเทนต์",
    tags: ["รายได้"],
  },
];

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
