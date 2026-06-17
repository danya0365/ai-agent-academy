import Link from "next/link";
import { CourseForm } from "@/components/course-form";

export default function NewCoursePage() {
  return (
    <div>
      <Link href="/admin/courses" className="text-sm font-medium text-muted hover:text-foreground">
        ← กลับ
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-black tracking-tight text-foreground">เพิ่มคอร์สใหม่</h1>
      <CourseForm />
    </div>
  );
}
