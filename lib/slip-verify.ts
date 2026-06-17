import "server-only";
import { randomUUID } from "node:crypto";

/**
 * ระบบตรวจสลิปแบบ provider-agnostic
 *
 * สลิปจริงตรวจจากรูปอย่างเดียวไม่ได้ (รูปปลอมได้) — ต้องเรียก API ภายนอก
 * ที่อ่าน QR บนสลิปแล้วยืนยันกับธนาคาร (เช่น EasySlip, SlipOK)
 *
 * ตั้งค่าผ่าน env:
 *   SLIP_VERIFY_PROVIDER = "easyslip" | "slipok" | "mock" | "" (ว่าง = ปิด)
 *   SLIP_VERIFY_API_KEY  = <key จาก provider>
 *
 * ยังไม่ตั้งค่า → คืน { status: "unconfigured" } → ระบบจะให้แอดมินตรวจมือแทน
 */

export type SlipVerifyResult =
  | { status: "verified"; amount: number; receiver: string | null; transRef: string }
  | { status: "failed"; reason: string }
  | { status: "unconfigured" };

export async function verifySlip(file: File): Promise<SlipVerifyResult> {
  const provider = (process.env.SLIP_VERIFY_PROVIDER || "").toLowerCase().trim();

  switch (provider) {
    case "":
    case "off":
    case "none":
      return { status: "unconfigured" };
    case "mock":
      return verifyWithMock();
    case "easyslip":
      return verifyWithEasySlip(file);
    case "slipok":
      return verifyWithSlipOk();
    default:
      console.warn(`[slip-verify] ไม่รู้จัก provider "${provider}" — ข้ามการตรวจอัตโนมัติ`);
      return { status: "unconfigured" };
  }
}

/* ───────────── mock (สำหรับ dev/เดโม ไม่ต้องมี key จริง) ─────────────
 * คืนผล verified โดยใช้ env กำหนดยอด/ref เพื่อทดสอบทุกเส้นทาง:
 *   SLIP_VERIFY_MOCK_AMOUNT  — ยอดเงินที่จะคืน (default 1990)
 *   SLIP_VERIFY_MOCK_REF     — ถ้าตั้ง จะคืน ref คงที่ (ไว้ทดสอบกันสลิปซ้ำ)
 *   ผู้รับ = PROMPTPAY_ID
 */
function verifyWithMock(): SlipVerifyResult {
  const amount = Number(process.env.SLIP_VERIFY_MOCK_AMOUNT || "1990");
  const transRef = process.env.SLIP_VERIFY_MOCK_REF || `MOCK-${randomUUID()}`;
  return {
    status: "verified",
    amount,
    receiver: process.env.PROMPTPAY_ID || null,
    transRef,
  };
}

/* ───────────── EasySlip (easyslip.com) ─────────────
 * อ่านรูปสลิป/QR คืนยอด ผู้รับ และเลขอ้างอิงรายการ
 * โครงพร้อม — ใส่ SLIP_VERIFY_API_KEY แล้วเปิดใช้ได้ทันที
 */
async function verifyWithEasySlip(file: File): Promise<SlipVerifyResult> {
  const key = process.env.SLIP_VERIFY_API_KEY;
  if (!key) return { status: "unconfigured" };

  try {
    const body = new FormData();
    body.append("file", file, "slip.jpg");

    const res = await fetch("https://developer.easyslip.com/api/v1/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body,
    });

    if (!res.ok) {
      return { status: "failed", reason: `ตรวจสลิปไม่สำเร็จ (HTTP ${res.status})` };
    }

    const json = (await res.json()) as EasySlipResponse;
    const d = json?.data;
    if (!d) {
      return { status: "failed", reason: "อ่านข้อมูลจากสลิปไม่ได้" };
    }

    const amount =
      typeof d.amount === "number" ? d.amount : Number(d.amount?.amount ?? NaN);
    const receiver =
      d.receiver?.account?.proxy?.account ??
      d.receiver?.account?.bank?.account ??
      null;
    const transRef = d.transRef || d.ref || `EASYSLIP-${randomUUID()}`;

    // ยอมยอด 0 บาท (คอร์สฟรี) — ปัดเฉพาะค่าที่อ่านไม่ได้จริง (NaN)
    if (!Number.isFinite(amount)) {
      return { status: "failed", reason: "อ่านยอดเงินจากสลิปไม่ได้" };
    }
    return { status: "verified", amount, receiver, transRef };
  } catch (e) {
    console.error("[slip-verify] easyslip error:", e);
    return { status: "failed", reason: "เชื่อมต่อระบบตรวจสลิปไม่ได้" };
  }
}

/* ───────────── SlipOK (slipok.com) — เผื่ออนาคต ─────────────
 * โครงไว้ ใส่ branchId/key แล้วเปิดใช้ได้ภายหลัง
 */
async function verifyWithSlipOk(): Promise<SlipVerifyResult> {
  // TODO: implement เมื่อเลือกใช้ SlipOK — ใช้ endpoint /api/line/apikey/<branchId>
  console.warn("[slip-verify] provider slipok ยังไม่ได้ implement — ข้ามการตรวจอัตโนมัติ");
  return { status: "unconfigured" };
}

/* รูปแบบ response ของ EasySlip (เท่าที่ใช้) */
type EasySlipResponse = {
  data?: {
    amount?: number | { amount?: number };
    transRef?: string;
    ref?: string;
    receiver?: {
      account?: {
        proxy?: { account?: string };
        bank?: { account?: string };
      };
    };
  };
};
