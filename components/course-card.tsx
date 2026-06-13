import Link from "next/link";
import type { courses } from "@/db/schema";
import { formatBaht, COURSE_TYPE_LABELS } from "@/lib/format";

type Course = typeof courses.$inferSelect;

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            course.type === "scheduled"
              ? "bg-purple-100 text-purple-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {COURSE_TYPE_LABELS[course.type]}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
        {course.title}
      </h3>
      <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-600">
        {course.description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-indigo-600">
          {formatBaht(course.price)}
        </span>
        <span className="text-sm font-medium text-indigo-600 group-hover:underline">
          ดูรายละเอียด →
        </span>
      </div>
    </Link>
  );
}
