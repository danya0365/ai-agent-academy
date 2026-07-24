import { Users, Check } from "lucide-react";
import { SectionHeading } from "@/components/course/section-heading";

/** เหมาะกับใคร */
export function CourseAudience({ forWho }: { forWho: string[] }) {
  return (
    <section>
      <SectionHeading title="เหมาะกับใคร" icon={Users} />
      <ul className="mt-5 flex flex-col gap-2.5">
        {forWho.map((w, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-alt-600" />
            {w}
          </li>
        ))}
      </ul>
    </section>
  );
}
