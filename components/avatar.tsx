import { cn } from "@/lib/cn";

/**
 * รูปโปรไฟล์ผู้ใช้ — ใช้ user.image ถ้ามี, ไม่มีก็ fallback เป็นวงกลมอักษรแรกของชื่อ
 * (repo ยังไม่มี avatar component — ตัวนี้เป็นตัวกลางใช้ซ้ำได้)
 */
export function Avatar({
  name,
  image,
  size = 40,
  className,
}: {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const initial = firstGrapheme(name);

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        width={size}
        height={size}
        loading="lazy"
        className={cn(
          "shrink-0 rounded-full border-2 border-border object-cover",
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border-2 border-border bg-brand-500 font-black text-on-brand",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}

/** ตัวอักษรแรก (รองรับ emoji/อักษรผสม) — ว่างก็ใช้ "?" */
function firstGrapheme(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return [...trimmed][0]!.toUpperCase();
}
