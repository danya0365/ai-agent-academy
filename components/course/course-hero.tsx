import { Zap, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import type { courses } from "@/db/schema";
import { formatBaht, COURSE_TYPE_LABELS } from "@/lib/format";
import type { ResolvedCourseContent } from "@/lib/course-content";

type Course = typeof courses.$inferSelect;

const TYPE_ICON = { self_paced: Zap, live: Clock } as const;
const CTA_LABEL = {
  self_paced: "สมัครเรียน",
  live: "เลือกเวลาเรียน",
} as const;

// สีแถบ cover แบบ deterministic จาก id (token utilities — ไม่ hardcode hex) — pattern เดียวกับ course-card
const COVERS = ["bg-brand-500", "bg-accent-500", "bg-brand-700"];
function coverClass(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return COVERS[sum % COVERS.length];
}

export function CourseHero({
  course,
  content,
  ctaHref,
}: {
  course: Course;
  content: ResolvedCourseContent;
  ctaHref: string;
}) {
  const TypeIcon = TYPE_ICON[course.type];
  const summary = course.description.split("\n").find((l) => l.trim()) ?? "";

  return (
    <section className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge bg-card text-foreground">
            <TypeIcon className="size-3.5" />
            {COURSE_TYPE_LABELS[course.type]}
          </span>
          {content.level && (
            <span className="badge bg-muted-surface text-muted">ระดับ {content.level}</span>
          )}
        </div>

        <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">
          {course.title}
        </h1>

        {summary && <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{summary}</p>}

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <span className="text-3xl font-black text-brand-700">{formatBaht(course.price)}</span>
          <a href={ctaHref} className="btn btn-primary">
            {CTA_LABEL[course.type]}
            <ArrowRight className="size-4" />
          </a>
        </div>
      </div>

      {/* Visual panel (ซ่อนบนมือถือ) */}
      <div className="hidden lg:block">
        <div className="card overflow-hidden p-0">
          <div
            className={`flex h-36 items-center justify-center ${coverClass(course.id)}`}
          >
            <TypeIcon className="size-16 text-on-brand" />
          </div>
          {content.highlights && content.highlights.length > 0 && (
            <ul className="flex flex-col gap-2.5 p-5">
              {content.highlights.map((h, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
