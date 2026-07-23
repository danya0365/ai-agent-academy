import { ListChecks } from "lucide-react";
import { SectionHeading } from "@/components/course/section-heading";
import type { CurriculumItem } from "@/lib/course-content";

/** หลักสูตร — numbered step cards (โครงเดียวกับ tips/custom/ai-speed-tips) */
export function CourseCurriculum({ items }: { items: CurriculumItem[] }) {
  return (
    <section>
      <SectionHeading title="สิ่งที่จะได้เรียน" icon={ListChecks} />
      <ol className="mt-5 flex flex-col gap-4">
        {items.map((step, i) => (
          <li key={i} className="card flex gap-4 p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-brand-500 text-lg font-black text-on-brand">
              {i + 1}
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-foreground">{step.title}</h3>
              {step.desc && (
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.desc}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
