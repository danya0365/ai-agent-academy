import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { CourseForm } from "@/components/course-form";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await db.select().from(courses).where(eq(courses.id, id)).get();
  if (!course) notFound();

  return (
    <div>
      <Link href="/admin/courses" className="text-sm font-medium text-muted hover:text-foreground">
        ← กลับ
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-black tracking-tight text-foreground">แก้ไขคอร์ส</h1>
      <CourseForm
        initial={{
          id: course.id,
          title: course.title,
          description: course.description,
          type: course.type,
          price: course.price,
          isPublished: course.isPublished,
        }}
      />
    </div>
  );
}
