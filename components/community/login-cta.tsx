import Link from "next/link";
import { LogIn } from "lucide-react";

/**
 * กล่องชวนเข้าสู่ระบบ (แสดงแทน composer เมื่อยังไม่ล็อกอิน)
 * ⚠️ ไม่ล็อกเนื้อหา — อ่าน feed/thread ได้เสมอ (นโยบายกัน AdSense ban)
 */
export function LoginCta({
  next,
  message = "อยากถามหรือตอบ? เข้าสู่ระบบก่อนนะ",
}: {
  next: string;
  message?: string;
}) {
  const q = `?next=${encodeURIComponent(next)}`;
  return (
    <div className="card flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-bold text-foreground">{message}</p>
      <div className="flex items-center gap-2">
        <Link href={`/login${q}`} className="btn btn-primary text-sm">
          <LogIn className="size-4" />
          เข้าสู่ระบบ
        </Link>
        <Link
          href={`/register${q}`}
          className="text-sm font-medium text-muted transition hover:text-foreground"
        >
          สมัครสมาชิก
        </Link>
      </div>
    </div>
  );
}
