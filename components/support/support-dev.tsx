import Link from "next/link";
import { Heart, ShoppingBag, MessageCircle } from "lucide-react";
import { generatePromptPayQR, getBankInfo } from "@/lib/promptpay";
import { AdsenseUnit } from "@/components/support/adsense-unit";
import { EncourageButton } from "@/components/support/support-actions";
import { PromptPaySection } from "@/components/support/promptpay-section";

/**
 * กล่อง "ให้กำลังใจ dev" — ใช้ซ้ำได้ทั้งหน้ารวมและหน้า detail
 * รวม 4 ช่องทางสนับสนุนแบบสมัครใจ (ไม่ล็อกเนื้อหา):
 *   1) พร้อมเพย์ QR   2) Shopee Affiliate   3) Google AdSense (แสดงผล)   4) LINE OA
 * ช่องไหนยังไม่ตั้งค่า env จะถูกซ่อนไว้อย่างสวยงาม
 */
export async function SupportDev() {
  // QR แบบเปิด (ผู้โอนกรอกยอดเอง) — คืน null ถ้าไม่ได้ตั้ง PROMPTPAY_ID
  const qr = await generatePromptPayQR();
  const { promptPayId } = getBankInfo();
  const lineUrl = process.env.NEXT_PUBLIC_LINE_OA_ADD_URL;

  return (
    <section className="card p-6">
      <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
        <Heart className="size-5 text-brand-500" />
        ให้กำลังใจ dev คนนี้
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        สวัสดีครับ ผมเป็น dev ที่ตกงานตอนอายุ 40 ตอนนี้กำลังสู้เพื่อหาค่าเทอมให้ลูก
        เนื้อหาทั้งหมดในหน้านี้เปิดอ่านฟรี ถ้ามันมีประโยชน์กับคุณ
        การสนับสนุนเล็ก ๆ น้อย ๆ มีความหมายกับครอบครัวผมมากครับ 🙏
      </p>

      <div className="mt-4">
        <EncourageButton />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* 1) พร้อมเพย์ — เลือกยอด + ดาวน์โหลด QR ได้ */}
        {qr && (
          <PromptPaySection initialQR={qr} promptPayId={promptPayId} />
        )}

        {/* ช่องทางลิงก์ (ของที่แนะนำ / LINE) */}
        <div className="flex flex-col gap-3">
          <Link
            href="/shop"
            className="btn btn-secondary w-full justify-start"
          >
            <ShoppingBag className="size-4" />
            ดูของที่ dev แนะนำ (ช้อปช่วยค่าคอม)
          </Link>
          {lineUrl && (
            <a
              href={lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary w-full justify-start"
            >
              <MessageCircle className="size-4" />
              ติดตาม LINE OA รับเคล็ดลับใหม่ก่อนใคร
            </a>
          )}
        </div>
      </div>

      {/* 3) โฆษณา AdSense (แบบแสดงผล) */}
      <div className="mt-6">
        <AdsenseUnit />
      </div>
    </section>
  );
}
