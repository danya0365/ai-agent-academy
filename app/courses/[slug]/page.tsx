import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { getCourseBySlug } from "@/lib/queries";
import { getCourseContent, type ResolvedCourseContent } from "@/lib/course-content";
import { SectionHeading } from "@/components/course/section-heading";
import { CourseHero } from "@/components/course/course-hero";
import { CourseMeta } from "@/components/course/course-meta";
import { CourseOutcomes } from "@/components/course/course-outcomes";
import { CourseCurriculum } from "@/components/course/course-curriculum";
import { CourseAudience } from "@/components/course/course-audience";
import { CourseIncludes } from "@/components/course/course-includes";
import { CourseInstructor } from "@/components/course/course-instructor";
import { CourseFaq } from "@/components/course/course-faq";
import { CourseEnroll } from "@/components/course/course-enroll";

export const dynamic = "force-dynamic";

type CourseData = NonNullable<Awaited<ReturnType<typeof getCourseBySlug>>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCourseBySlug(slug);
  if (!data || !data.course.isPublished) return { title: "ไม่พบคอร์ส" };
  const summary = data.course.description.replace(/\s+/g, " ").trim().slice(0, 155);
  return {
    title: `${data.course.title} — AI Agent Academy`,
    description: summary,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getCourseBySlug(slug);
  if (!data || !data.course.isPublished) notFound();

  const { course, booking } = data;
  const content = getCourseContent(slug);
  const isLive = course.type === "live";

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

      {isLive ? (
        <>
          {/* live: กล่องจองเต็มกว้าง แล้วต่อด้วยเนื้อหา */}
          <section id="enroll" className="scroll-mt-24">
            <CourseEnroll course={course} booking={booking} />
          </section>
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-12">
            <Sections course={course} content={content} />
          </div>
        </>
      ) : (
        /* self_paced: เนื้อหาซ้าย + กล่องสมัคร sticky ขวา */
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex min-w-0 flex-col gap-12">
            <Sections course={course} content={content} />
          </div>
          <aside id="enroll" className="scroll-mt-24 lg:sticky lg:top-20 lg:self-start">
            <CourseEnroll course={course} booking={booking} />
          </aside>
        </div>
      )}
    </div>
  );
}

/** ชุด section เนื้อหา (ใช้ซ้ำทั้ง branch booking และ scheduled/open) */
function Sections({
  course,
  content,
}: {
  course: CourseData["course"];
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
