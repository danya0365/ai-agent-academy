import type { LucideIcon } from "lucide-react";

/** หัวข้อ section ของหน้าคอร์ส — h2 หนา + ไอคอนในกล่องสี (โทนเดียวกับ home/feature) */
export function SectionHeading({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: LucideIcon;
}) {
  return (
    <h2 className="flex items-center gap-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
      {Icon && (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-brand-500 text-on-brand">
          <Icon className="size-5" />
        </span>
      )}
      {title}
    </h2>
  );
}
