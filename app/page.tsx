import Link from "next/link";
import { Sparkles, Zap, RefreshCw, ArrowRight } from "lucide-react";
import { getPublishedCourses, getLearnerCount } from "@/lib/queries";
import { CourseCard } from "@/components/course-card";

export const dynamic = "force-dynamic";

const FEATURES = [
  { icon: Sparkles, title: "ผู้สอนตัวจริง", desc: "เรียนกับคนที่ใช้ AI ทำงานจริง ไม่ใช่แค่ทฤษฎี", cover: "bg-brand-500" },
  { icon: Zap, title: "จ่ายแล้วเริ่มได้ทันที", desc: "สมัคร โอน แนบสลิป ระบบยืนยันที่นั่งอัตโนมัติ", cover: "bg-accent-500" },
  { icon: RefreshCw, title: "เนื้อหาอัปเดตเสมอ", desc: "ตามทันเครื่องมือ AI ใหม่ ๆ ที่เปลี่ยนเร็วทุกเดือน", cover: "bg-brand-700" },
];

export default async function HomePage() {
  const [courses, learners] = await Promise.all([
    getPublishedCourses(),
    getLearnerCount(),
  ]);
  const stats = [
    { value: learners.toLocaleString("en-US"), label: "ผู้เรียน" },
    { value: String(courses.length), label: "คอร์ส" },
  ];

  return (
    <div>
      {/* Hero — โทนครีม ตัวอักษรเข้ม */}
      <section className="relative overflow-hidden border-b-2 border-border">
        <div className="pointer-events-none absolute -right-8 top-10 hidden h-28 w-28 rotate-12 rounded-3xl border-2 border-border bg-accent-400 sm:block" />
        <div className="pointer-events-none absolute bottom-8 left-6 hidden h-16 w-16 rounded-full border-2 border-border bg-brand-400 sm:block" />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <span className="badge bg-card text-foreground">
            <Sparkles className="size-3.5" /> แพลตฟอร์มเรียน AI ออนไลน์
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-foreground sm:text-6xl">
            <span className="text-brand-500">AI Agent Academy</span><br />
            สอนทุกอย่างเกี่ยวกับ AI
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
            แพลตฟอร์มเรียน AI ออนไลน์ — ตั้งแต่การใช้ AI เบื้องต้น ทำงานให้เร็วขึ้น
            ไปจนถึงเขียนซอฟต์แวร์ด้วยคู่มือ AI สมัครแล้วเริ่มได้ทันที
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="#courses" className="btn btn-primary">
              ดูคอร์สทั้งหมด
            </Link>
            <Link href="/register" className="btn btn-secondary">
              สมัครสมาชิก
            </Link>
          </div>
          <div className="mx-auto mt-14 grid max-w-sm grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="card-flat px-3 py-4">
                <div className="text-2xl font-black text-foreground">{s.value}</div>
                <div className="mt-1 text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card p-6">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-border text-on-brand ${f.cover}`}>
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          คอร์สเรียน <ArrowRight className="size-6 text-brand-500" />
        </h2>
        {courses.length === 0 ? (
          <p className="card-flat p-8 text-center text-muted">
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
