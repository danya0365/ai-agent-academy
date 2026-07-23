---
name: ru-kon-krai-monetization
description: "เมนูรู้ก่อนใคร (/tips) + ร้าน /shop — เนื้อหาฟรี + กล่องสนับสนุน + ระบบ Shopee affiliate (ไม่ล็อกเนื้อหา) อ่านเมื่อแตะ tips/shop/monetization"
metadata:
  type: log
  status: active
  scope: monetization
  updated: 2026-07-23
---

# เมนู "รู้ก่อนใคร" (/tips) + ร้าน /shop + กล่องสนับสนุน dev (2026-07-23)

Dev มีเป้าหมายหารายได้ค่าเทอมลูก จึงเพิ่มเมนู "รู้ก่อนใคร" (`/tips`) — รวมเคล็ดลับ AI ฟรี
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
ไม่ใช้ลิงก์เดียว hardcode — ทำเป็นระบบ:
- สินค้าเป็น typed array `lib/shopee-products.ts` (ตอนนี้เป็น placeholder ต้องเปลี่ยน url/รูปเป็นของจริง)
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
- โค้ดเสร็จ + commit `15ed719` push ขึ้น main แล้ว (2026-07-23)
- ค้าง: เปลี่ยน placeholder สินค้า Shopee เป็นของจริง + ใส่ env AdSense/Shopee ตอน prod

ดู [[project-overview]] สำหรับบริบทโปรเจครวม
