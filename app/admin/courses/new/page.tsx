import Link from "next/link";
import { CourseForm } from "@/components/course-form";

export default function NewCoursePage() {
  return (
    <div>
      <Link href="/admin/courses" className="text-sm text-indigo-600 hover:underline">
        ← กลับ
      </Link>
      <h1 className="mb-6 mt-3 text-2xl font-bold text-slate-900">เพิ่มคอร์สใหม่</h1>
      <CourseForm />
    </div>
  );
}
