import { HelpCircle, ChevronDown } from "lucide-react";
import { SectionHeading } from "@/components/course/section-heading";
import type { FaqItem } from "@/lib/course-content";

/** คำถามที่พบบ่อย — native <details> accordion (server, zero-JS, theme-safe) */
export function CourseFaq({ faq }: { faq: FaqItem[] }) {
  return (
    <section>
      <SectionHeading title="คำถามที่พบบ่อย" icon={HelpCircle} />
      <div className="mt-5 flex flex-col gap-3">
        {faq.map((f, i) => (
          <details key={i} className="card-flat group p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-bold text-foreground [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180" />
            </summary>
            <p className="border-t-2 border-border p-4 text-sm leading-relaxed text-muted">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
