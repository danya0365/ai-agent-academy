import { notFound } from "next/navigation";
import { getCourseBySlug } from "@/lib/queries";
import { formatBaht, COURSE_TYPE_LABELS } from "@/lib/format";
import { EnrollForm } from "@/components/enroll-form";

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCourseBySlug(slug);
  if (!data || !data.course.isPublished) notFound();

  const { course, sessions } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* รายละเอียดคอร์ส */}
        <div>
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
              course.type === "scheduled"
                ? "bg-purple-100 text-purple-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {COURSE_TYPE_LABELS[course.type]}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">{course.title}</h1>
          <p className="mt-2 text-2xl font-bold text-indigo-600">
            {formatBaht(course.price)}
          </p>
          <div className="mt-6 whitespace-pre-line leading-relaxed text-slate-700">
            {course.description}
          </div>
        </div>

        {/* กล่องสมัคร */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <EnrollForm
            courseId={course.id}
            type={course.type}
            sessions={sessions}
          />
        </div>
      </div>
    </div>
  );
}
