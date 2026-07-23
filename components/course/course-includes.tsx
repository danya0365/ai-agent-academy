import { Gift, Check } from "lucide-react";
import { SectionHeading } from "@/components/course/section-heading";

/** ในคอร์สมีอะไร */
export function CourseIncludes({ includes }: { includes: string[] }) {
  return (
    <section>
      <SectionHeading title="ในคอร์สมีอะไร" icon={Gift} />
      <ul className="mt-5 flex flex-col gap-2.5">
        {includes.map((it, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            {it}
          </li>
        ))}
      </ul>
    </section>
  );
}
