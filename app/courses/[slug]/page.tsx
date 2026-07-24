import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Layers } from "lucide-react";
import { getCourseBySlug, getCourseContent, type ResolvedCourseContent } from "@/lib/courses";
import { getCourseBySlugWithBooking } from "@/lib/queries";
import { SectionHeading } from "@/components/course/section-heading";
import { formatDuration } from "@/lib/format";
import { CourseHero } from "@/components/course/course-hero";
import { CourseMeta } from "@/components/course/course-meta";
import { CourseOutcomes } from "@/components/course/course-outcomes";
import { CourseCurriculum } from "@/components/course/course-curriculum";
import { CourseAudience } from "@/components/course/course-audience";
import { CourseIncludes } from "@/components/course/course-includes";
import { CourseInstructor } from "@/components/course/course-instructor";
import { CourseFaq } from "@/components/course/course-faq";
import { CourseEnroll } from "@/components/course/course-enroll";
import type { Course } from "@/lib/courses";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course || !course.isPublished) return { title: "ไม่พบคอร์ส" };
  const summary = course.description.replace(/\s+/g, " ").trim().slice(0, 155);
  return {
    title: `${course.title} — AI Agent Academy`,
    description: summary,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCourseBySlugWithBooking(slug);
  if (!data || !data.course.isPublished) notFound();

  const { course, booking } = data;
  const content = getCourseContent(slug);

  return (
    <div className="flex flex-col gap-10">
      <Link
        href="/#courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> กลับไปหน้าคอร์ส
      </Link>

      <CourseHero course={course} content={content} ctaHref="#enroll" />
      <CourseMeta course={course} content={content} />

      {/* กล่องจองเวลา */}
      <section id="enroll" className="scroll-mt-24">
        <CourseEnroll course={course} booking={booking} />
      </section>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
        <Sections course={course} content={content} />

        {/* Stacks — หัวข้อย่อยให้เลือกเรียน */}
        <StackSection course={course} />
      </div>
    </div>
  );
}

/** Stacks section — list all topics student can pick per session */
function StackSection({ course }: { course: Course }) {
  return (
    <section>
      <SectionHeading title={`${course.stacks.length} หัวข้อให้เลือกเรียน`} icon={Layers} />
      <p className="mt-2 text-sm text-muted">
        1 enrollment = {formatDuration(course.sessionDurationMin)} เลือกเรียน 1 หัวข้อ ถ้าอยากเรียนหัวข้ออื่น จองรอบใหม่ จ่ายใหม่
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {course.stacks.map((s, i) => (
          <div key={i} className="card-flat p-4">
            <h3 className="font-extrabold text-foreground">{s.title}</h3>
            {s.desc && <p className="mt-1 text-sm text-muted">{s.desc}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

/** ชุด section เนื้อหา */
function Sections({
  course,
  content,
}: {
  course: Course;
  content: ResolvedCourseContent;
}) {
  return (
    <>
      {content.outcomes && <CourseOutcomes outcomes={content.outcomes} />}

      <section>
        <SectionHeading title="รายละเอียดคอร์ส" icon={FileText} />
        <div className="mt-4 whitespace-pre-line leading-relaxed text-muted">
          {course.description}
        </div>
      </section>

      {content.curriculum && <CourseCurriculum items={content.curriculum} />}

      <div className="grid gap-8 md:grid-cols-2">
        {content.forWho && <CourseAudience forWho={content.forWho} />}
        <CourseIncludes includes={content.includes} />
      </div>

      <CourseInstructor instructor={content.instructor} />
      <CourseFaq faq={content.faq} />
    </>
  );
}
