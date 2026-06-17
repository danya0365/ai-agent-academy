import "server-only";
import { formatBaht } from "@/lib/format";

/**
 * แจ้งเตือนไปยัง LINE OA ด้วย Messaging API push
 * (LINE Notify ปิดบริการแล้ว — ใช้ Messaging API แทน)
 *
 * ตั้งค่าผ่าน env:
 *   LINE_CHANNEL_ACCESS_TOKEN = <channel access token ของ LINE OA>
 *   LINE_ADMIN_TARGET_ID      = userId หรือ groupId ที่จะส่งข้อความเข้า
 *
 * ยังไม่ตั้งค่า → log เฉย ๆ (ไม่ throw) เพื่อให้ dev ทำงานได้
 * ทุก error ถูก catch — ไม่ขัด flow ของผู้ใช้
 */

export type PaymentNotifyInput = {
  courseTitle: string;
  customerName: string;
  amount: number;
  /** ผลการตรวจ: ข้อความสรุปสถานะ เช่น "อนุมัติอัตโนมัติแล้ว" / "รอตรวจสอบ: ยอดไม่ตรง" */
  resultText: string;
  autoApproved: boolean;
};

const PUSH_URL = "https://api.line.me/v2/bot/message/push";

export async function notifyPaymentSlip(input: PaymentNotifyInput): Promise<void> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_ADMIN_TARGET_ID;

  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  const icon = input.autoApproved ? "✅" : "🔔";
  const text =
    `${icon} แจ้งโอนเงิน\n` +
    `คอร์ส: ${input.courseTitle}\n` +
    `ลูกค้า: ${input.customerName}\n` +
    `ยอด: ${formatBaht(input.amount)}\n` +
    `สถานะ: ${input.resultText}\n` +
    `ตรวจสอบ: ${baseUrl}/admin/enrollments`;

  if (!token || !to) {
    console.log(`[line] (ยังไม่ตั้งค่า LINE) ข้อความที่จะส่ง:\n${text}`);
    return;
  }

  try {
    const res = await fetch(PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[line] push ล้มเหลว HTTP ${res.status}: ${detail}`);
    }
  } catch (e) {
    console.error("[line] push error:", e);
  }
}
