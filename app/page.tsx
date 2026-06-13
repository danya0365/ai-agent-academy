import Link from "next/link";
import { getPublishedCourses } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const courses = await getPublishedCourses();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            สอนทุกอย่างเกี่ยวกับ AI
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            ตั้งแต่การใช้ AI เบื้องต้น ใช้ AI ทำงานให้เร็วขึ้น
            ไปจนถึงการเขียนซอฟต์แวร์ด้วย AI เรียนกับผู้สอนตัวจริง สมัครออนไลน์ได้ทันที
          </p>
          <div className="mt-8">
            <Link
              href="#courses"
              className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              ดูคอร์สทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-slate-900">คอร์สเรียน</h2>
        {courses.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            ยังไม่มีคอร์สเปิดสอนในขณะนี้ กรุณากลับมาใหม่ภายหลัง
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
