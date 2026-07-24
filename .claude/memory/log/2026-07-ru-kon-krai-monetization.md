---
name: ru-kon-krai-monetization
description: เมนูไขความลับ (/tips) + ร้าน /shop — เนื้อหาฟรี + กล่องสนับสนุน + ระบบ Shopee affiliate (ไม่ล็อกเนื้อหา) อ่านเมื่อแตะ tips/shop/monetization
metadata: 
  node_type: memory
  type: log
  status: active
  scope: monetization
  updated: 2026-07-23
  originSessionId: 8f050c83-41eb-4554-a4f0-36ee06a8e084
  modified: 2026-07-23T08:36:23.612Z
---

# เมนู "ไขความลับ" (/tips) + ร้าน /shop + กล่องสนับสนุน dev (2026-07-23)

Dev มีเป้าหมายหารายได้ค่าเทอมลูก จึงเพิ่มเมนู "ไขความลับ" (`/tips`) — รวมเคล็ดลับ AI ฟรี
ท้ายหน้ามีกล่อง `SupportDev` รวม 4 ช่องทาง: PromptPay QR (open QR ผ่าน `lib/promptpay.ts`),
Shopee affiliate, Google AdSense (แสดงผล), ปุ่ม LINE OA — ทุกช่องซ่อนอัตโนมัติถ้าไม่ตั้ง env.

**Why (สำคัญ):** ผู้ใช้ขอเดิมให้ "ล็อกเนื้อหา บังคับกดโฆษณาเพื่อปลดล็อก" แต่ตกลงเลือก **ไม่ล็อก** แทน
เพราะการบังคับกด Google AdSense ผิดนโยบาย = เสี่ยงโดนแบนบัญชีถาวร รายได้หายทั้งก้อน
→ อย่าเสนอ/ทำ incentivized ad clicks ให้โปรเจคนี้เด็ดขาด

## เนื้อหา (tips)
- pure data ใน `lib/tips.ts` (typed array, ห้าม import JSX)
- แต่ละเคล็ดลับมี component เฉพาะได้ผ่าน registry `TIP_COMPONENTS` ใน `components/tips/registry.tsx`
  (map slug→component); ไม่มีก็ fallback ไป `components/tips/tip-body.tsx` อัตโนมัติ
- เพิ่มเคล็ดลับ: เติม object ใน TIPS; อยากได้ดีไซน์เฉพาะค่อยสร้าง `components/tips/custom/<slug>.tsx` + ลงทะเบียน

## ระบบสินค้า Shopee Affiliate
ไม่ใช้ลิงก์เดียว hardcode — และ **ไม่เลือกสินค้าด้วยมือแล้ว** ทำเป็น pipeline อัตโนมัติ:
- **แยก data ออกจาก logic:** `lib/shopee-products.generated.ts` = data (auto-generated, อยู่ใน eslint ignore),
  `lib/shopee-products.ts` = type + helper (`pickProducts`/`withSubId`/ฯลฯ) import จาก generated
- **แหล่งข้อมูล = Shopee "Product Feed" (CSV)** ไม่ใช่ Open API — เพราะบัญชี dev **ไม่ได้สิทธิ์ Open API**
  (หน้า `/open_api` ขึ้น "คุณไม่ได้รับสิทธิ์…") แต่ feed CSV ใช้ได้ทุกคน + **อัพเดทเองทุกวัน**
  URL: `affiliate.shopee.co.th/api/v1/datafeed/download?id=<token>` (302 → signed mkt-proxy, สดทุก request → cron ได้)
- **`scripts/fetch-shopee-products.ts`** (`npm run shopee:fetch` · flags: `--dry` `--file <csv>` `--max <n>`)
  **stream** อ่าน CSV (~1M แถว/ไฟล์ ไม่โหลดเข้า memory ด้วย `csv-parse`) → กรอง title ที่ match bucket +
  rating≥4 + stock>0 → คะแนน `log10(item_sold)×(item_rating/5)` (**ฟีดไม่มี commission**) → top-N/ชั้น → เขียน generated
  (เขียนเฉพาะตอนได้ ≥1 ตัว; fail = ไม่แตะไฟล์)
- CSV 47 คอลัมน์ที่ใช้: `title, item_sold, item_rating, sale_price/price, image_link, itemid,`
  **`product_short link`** (= affiliate an_redir link ตัวจริง — **ห้ามใช้ `product_link` ที่เปล่าๆ ไม่มี tracking**)
- **`scripts/shopee-buckets.ts`** = config "ชั้นวาง" (`category/match[]/tags/note/limit/featured`) — match = คำในชื่อสินค้า (ไทย)
- ⚠️ **ต้องมี env `SHOPEE_FEED_URL`** ใน `.env.local` (มี token ส่วนตัว — ห้าม commit) · เพิ่ม `csv-parse` เป็น devDep
- ⚠️ **ยังต้องยืนยัน attribution:** an_redir แนบ `utm_term` ตอน redirect — dev ต้องคลิกลิงก์ตัวเองแล้วเช็ค "รายงานคลิก"
  ว่านับให้บัญชี Dangito จริง (เป็นเรื่องเงิน อย่าเชื่อว่าได้คอมจนกว่าจะเห็น click ขึ้น)
- เฟสหน้าที่ค้าง: cron auto-commit (feed อัพเดททุกวันอยู่แล้ว) + AI เขียน note ต่อชิ้น
- จับคู่ contextual: `tip.productTags` ↔ `product.tags` ผ่าน `pickProducts()` (fallback = featured)
- `withSubId(url, subId)` แนบ `sub_id` (= slug ของหน้า) → ดูใน dashboard Shopee ว่าหน้าไหนทำเงิน (ไม่มี tracking DB เอง)
- component: `components/shop/{product-card,recommended-products}.tsx`; หน้ารวม `app/shop/page.tsx` (nav "ของที่แนะนำ")
- `<RecommendedProducts tags subId />` วางบน tip detail (tags+slug), /tips list (featured), /shop

## ช่องทางอื่น
- Zustand persist store ปุ่มให้กำลังใจ: `lib/support-store.ts` (ไม่ gate อะไร)
- AdSense: `components/support/adsense-unit.tsx` ใช้ `next/script` + placeholder ถ้าไม่มี client id
- SupportDev ปุ่ม Shopee ชี้เข้า `/shop` (ภายใน) ไม่ใช้ env link เดียวแล้ว
- env ที่ยังต้องใส่จริง: `NEXT_PUBLIC_SHOPEE_AFFILIATE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT_ID`, `NEXT_PUBLIC_ADSENSE_SLOT_TIPS` (+ ต้องผ่านอนุมัติ AdSense + ads.txt ก่อน)

## สถานะ
- โค้ดเดิม (tips/shop/support) commit `15ed719` push main แล้ว (2026-07-23)
- **ระบบ auto-fetch Shopee ทำงานจริงแล้ว (2026-07-23):** รัน `npm run shopee:fetch` กับ feed จริง →
  generated file มีสินค้าจริง 18 ตัว (ลิงก์ affiliate/รูป/ราคา ครบ) — tsc/lint ผ่าน · **commit `2dcb4eb` push main แล้ว** ✅
## ▶️ ต่อ session หน้า (handoff — จบ session 2026-07-23)

dev พอใจระดับ "ใช้ได้แล้ว" — ระบบพร้อม เหลืองาน ops ฝั่ง dev + งานเสริมที่ dev ยังไม่สั่งทำ

**สถานะ code:** เสร็จ + ทดสอบผ่าน (tsc/lint) — **commit `2dcb4eb` push main แล้ว (session 2026-07-23 รอบ 2)** ✅
ไฟล์: `scripts/{fetch-shopee-products,shopee-buckets}.ts`, `lib/shopee-products.generated.ts` (data จริง 18 ตัว),
`lib/shopee-products.ts`, `.env.example`, `eslint.config.mjs`, `package.json`(+csv-parse)

**ค้างฝั่ง dev (ไม่ใช่งาน code):**
1. คลิกลิงก์สินค้าตัวเองแล้ว **"รายงานคลิก" ยังไม่ขึ้น** ณ 2026-07-23 — น่าจะแค่ delay (Shopee report ดีเลย์ได้ถึง ~24ชม.)
   → session หน้าถ้า dev ถาม ให้เช็คว่า click ขึ้นยัง = ยืนยัน attribution ได้จริงไหม (เรื่องเงิน สำคัญสุด)
2. dev ยังต้องกรอก "ข้อมูลการชำระเงินและภาษี" ในแดชบอร์ด affiliate (แถบแดงค้าง = ไม่งั้นไม่ได้เงิน)
3. ตั้ง `SHOPEE_FEED_URL` (มี token) ตอน deploy prod — generated file commit แล้ว (`2dcb4eb`)

**งานเสริมที่เสนอได้ (dev ยังไม่สั่ง):**
- ตั้ง **cron/GitHub Actions** ดึง feed + commit อัตโนมัติทุกสัปดาห์ (feed อัพเดททุกวันอยู่แล้ว รองรับได้ทันที)
- ปรับ `match[]` ใน `shopee-buckets.ts` ลด noise (ชื่อ Shopee ยัดคีย์เวิร์ด บางตัวหลุดหมวด เช่น "สติกเกอร์คีย์บอร์ด")
  หรือเพิ่มหมวดใหม่ (แก็ดเจ็ต AI / หนังสือ)
- ให้ AI เขียน `note` ต่อชิ้น (ตอนนี้ note ใช้ template ต่อหมวด)
- วิธีรันซ้ำ: `npm run shopee:fetch` (flags: `--dry` ดูก่อน, `--file <csv>` โหมดไฟล์, `--max <n>` จำกัดแถว)
  หมายเหตุ: ~60–120k แถวแรกก็ได้ pool ดีพอแล้ว (674 ตัวเข้าเกณฑ์) ไม่ต้องโหลดครบ 1M

ดู [[project-overview]] สำหรับบริบทโปรเจครวม
