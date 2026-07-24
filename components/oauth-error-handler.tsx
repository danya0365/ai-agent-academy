"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

/** ข้อความ error ที่ user ควรเห็น แปลจาก error code ของ better-auth */
const ERROR_MESSAGES: Record<string, string> = {
  account_not_linked:
    "อีเมลนี้มีผู้ใช้งานอยู่แล้ว แต่ยังไม่ได้เชื่อมต่อกับบัญชี Google เข้าสู่ระบบด้วยอีเมล + รหัสผ่านก่อน แล้วไปที่ตั้งค่าบัญชีเพื่อเชื่อมต่อ",
  email_doesnt_match:
    "อีเมลของบัญชี Google ไม่ตรงกับอีเมลที่มีในระบบ",
  unable_to_link_account:
    "ไม่สามารถเชื่อมต่อบัญชี Google กับผู้ใช้ปัจจุบันได้",
};

/**
 * OAuthErrorHandler — วางใน root layout
 * อ่าน `?error=` จาก URL ทุก path (รวม `/`) แสดง toast + ล้าง param
 */
export function OAuthErrorHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    // debounce: กัน effect ทำงานซ้ำตอน replaceState
    const msg = ERROR_MESSAGES[error] ?? `เกิดข้อผิดพลาด: ${error}`;
    const description = searchParams.get("error_description");
    if (description) {
      toast.error(msg, { description });
    } else {
      toast.error(msg);
    }

    // ลบ error params ออกจาก URL
    const p = new URLSearchParams(searchParams.toString());
    p.delete("error");
    p.delete("error_description");
    const q = p.toString();
    router.replace(q ? `${window.location.pathname}?${q}` : window.location.pathname);
  }, [searchParams, router]);

  return null;
}
