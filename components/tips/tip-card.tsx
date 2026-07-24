import Link from "next/link";
import { Lightbulb, ArrowRight, Clock } from "lucide-react";
import type { Tip } from "@/lib/tips";

// สีแถบ cover แบบ deterministic จาก slug (ใช้ token utilities — ไม่ hardcode hex)
const COVERS = ["bg-brand-500", "bg-accent-500", "bg-alt-500"];
function coverClass(slug: string): string {
  let sum = 0;
  for (let i = 0; i < slug.length; i++) sum += slug.charCodeAt(i);
  return COVERS[sum % COVERS.length];
}

export function TipCard({ tip }: { tip: Tip }) {
  return (
    <Link
      href={`/tips/${tip.slug}`}
      className="card lift group flex flex-col overflow-hidden p-0"
    >
      <div className={`relative h-24 ${coverClass(tip.slug)}`}>
        <span className="badge absolute left-3 top-3 bg-card text-foreground">
          <Lightbulb className="size-3.5" />
          {tip.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug text-foreground">
          {tip.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{tip.summary}</p>
        <div className="mt-4 flex items-center justify-between border-t-2 border-border pt-3">
          {tip.readingTime ? (
            <span className="inline-flex items-center gap-1 text-sm text-muted">
              <Clock className="size-3.5" />
              {tip.readingTime}
            </span>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 transition-all group-hover:gap-2">
            อ่านเคล็ดลับ
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
