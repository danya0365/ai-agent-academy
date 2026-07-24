import Link from "next/link";
import { Clock, Zap, ArrowRight } from "lucide-react";
import type { courses } from "@/db/schema";
import { formatBaht, COURSE_TYPE_LABELS } from "@/lib/format";

type Course = typeof courses.$inferSelect;

// สีแถบ cover แบบ deterministic จาก id (ใช้ token utilities — ไม่ hardcode hex)
const COVERS = ["bg-brand-500", "bg-accent-500", "bg-brand-700"];
function coverClass(id: string): string {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return COVERS[sum % COVERS.length];
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.slug}`} className="card lift group flex flex-col overflow-hidden p-0">
      <div className={`relative h-24 ${coverClass(course.id)}`}>
        <span className="badge absolute left-3 top-3 bg-card text-foreground">
          {course.type === "live" ? <Clock className="size-3.5" /> : <Zap className="size-3.5" />}
          {COURSE_TYPE_LABELS[course.type]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug text-foreground">{course.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{course.description}</p>
        <div className="mt-4 flex items-center justify-between border-t-2 border-border pt-3">
          <span className="text-lg font-extrabold text-foreground">{formatBaht(course.price)}</span>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 transition-all group-hover:gap-2">
            ดูรายละเอียด
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
