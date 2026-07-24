import { UserRound } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SectionHeading } from "@/components/course/section-heading";
import type { Instructor } from "@/lib/courses";

/** ผู้สอน */
export function CourseInstructor({ instructor }: { instructor: Instructor }) {
  return (
    <section>
      <SectionHeading title="ผู้สอน" icon={UserRound} />
      <div className="card mt-5 flex items-start gap-4 p-5">
        <Avatar name={instructor.name} image={instructor.avatar} size={56} />
        <div>
          <p className="font-extrabold text-foreground">{instructor.name}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{instructor.bio}</p>
        </div>
      </div>
    </section>
  );
}
