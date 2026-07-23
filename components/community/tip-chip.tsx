import Link from "next/link";
import { Lightbulb } from "lucide-react";

/**
 * ป้ายลิงก์กลับไปหน้า tip ที่โพสต์ผูกไว้
 * stopPropagation: กันไม่ให้ไปกระตุ้นลิงก์ card ที่ครอบอยู่ (ในโหมด feed)
 */
export function TipChip({ slug, title }: { slug: string; title: string }) {
  return (
    <Link
      href={`/tips/${slug}`}
      onClick={(e) => e.stopPropagation()}
      className="badge bg-brand-100 text-brand-700 transition hover:bg-brand-500 hover:text-on-brand"
      title={`เกี่ยวกับเคล็ดลับ: ${title}`}
    >
      <Lightbulb className="size-3.5" />
      <span className="max-w-[12rem] truncate">{title}</span>
    </Link>
  );
}
