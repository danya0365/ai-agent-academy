import "server-only";
import generatePayload from "promptpay-qr";
import QRCode from "qrcode";

/**
 * สร้าง PromptPay QR เป็น data-URL ตามยอดเงิน
 * คืน null ถ้าไม่ได้ตั้งค่า PROMPTPAY_ID
 */
export async function generatePromptPayQR(amount: number): Promise<string | null> {
  const id = process.env.PROMPTPAY_ID;
  if (!id) return null;

  const payload = generatePayload(id, { amount });
  return QRCode.toDataURL(payload, { margin: 1, width: 320 });
}

export function getBankInfo() {
  return {
    bankName: process.env.BANK_NAME || "",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
    accountName: process.env.BANK_ACCOUNT_NAME || "",
    promptPayId: process.env.PROMPTPAY_ID || "",
  };
}
