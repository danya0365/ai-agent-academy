import { CheckCircle2, Target } from "lucide-react";
import { SectionHeading } from "@/components/course/section-heading";

/** "เรียนจบแล้วทำอะไรได้" — checklist grid 2 คอลัมน์ */
export function CourseOutcomes({ outcomes }: { outcomes: string[] }) {
  return (
    <section>
      <SectionHeading title="เรียนจบแล้วทำอะไรได้" icon={Target} />
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {outcomes.map((o, i) => (
          <li key={i} className="card-flat flex items-start gap-3 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
            <span className="text-sm leading-relaxed text-foreground">{o}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
