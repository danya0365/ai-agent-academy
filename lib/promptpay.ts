import "server-only";
import { toDataURL } from "qrcode";

// ── PromptPay Payload (EMVCo merchant-presented mode) ──
// สร้าง payload เอง ไม่ใช้ promptpay-qr (bux: field order + formatTarget)
// Reference: easy-game-arena/packages/economy/src/promptpayQr.ts (verified working)

const AID_PROMPTPAY = "A000000677010111";

function tlv(id: string, value: string): string {
  return id + value.length.toString().padStart(2, "0") + value;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function formatTarget(target: string): { subId: string; value: string } {
  const digits = target.replace(/\D/g, "");
  if (digits.length >= 15) return { subId: "03", value: digits }; // e-wallet
  if (digits.length === 13) return { subId: "02", value: digits }; // เลขบัตรประชาชน
  // เบอร์โทร: ตัด 0 นำหน้า เติมรหัสประเทศ 0066
  return { subId: "01", value: "0066" + digits.replace(/^0/, "") };
}

function buildPromptPayPayload(target: string, amountThb?: number): string {
  const { subId, value } = formatTarget(target);
  const merchantInfo = tlv("00", AID_PROMPTPAY) + tlv(subId, value);

  let payload =
    tlv("00", "01") + // payload format indicator
    tlv("01", amountThb != null ? "11" : "12") + // 11 = dynamic, 12 = static
    tlv("29", merchantInfo) +
    tlv("53", "764") + // สกุลเงิน THB
    (amountThb != null ? tlv("54", amountThb.toFixed(2)) : "") +
    tlv("58", "TH");

  payload += "6304"; // CRC id + length ต้องรวมใน checksum
  return payload + crc16(payload);
}

/**
 * สร้าง PromptPay QR เป็น data-URL
 * - ใส่ amount = QR ล็อกยอด (ใช้ในหน้าชำระค่าคอร์ส)
 * - ไม่ใส่ amount = QR แบบเปิด ผู้โอนกรอกยอดเอง (ใช้กับกล่องให้กำลังใจ)
 * คืน null ถ้าไม่ได้ตั้งค่า PROMPTPAY_ID
 */
export async function generatePromptPayQR(
  amount?: number,
): Promise<string | null> {
  const id = process.env.PROMPTPAY_ID;
  if (!id) return null;

  const payload = buildPromptPayPayload(id, amount);
  return toDataURL(payload, {
    width: 320,
    margin: 2,
    color: { dark: "#15161c", light: "#ffffff" },
  });
}

export function getBankInfo() {
  return {
    bankName: process.env.BANK_NAME || "",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
    accountName: process.env.BANK_ACCOUNT_NAME || "",
    promptPayId: process.env.PROMPTPAY_ID || "",
  };
}
