import { DEMO_COURSES, DEMO_FEATURES, DEMO_STATS, baht } from "../_data";

export const metadata = { title: "Modern Gradient SaaS — Design Preview" };

function Icon({ name, className }: { name: string; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "spark") return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>;
  if (name === "bolt") return <svg {...common}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" /></svg>;
  return null;
}

export default function ModernPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* glass navbar */}
      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">◆</span>
            <span>AI Agent Academy</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <span className="hover:text-slate-900">คอร์ส</span>
            <span className="hover:text-slate-900">ราคา</span>
            <span className="hover:text-slate-900">รีวิว</span>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden px-3 py-2 font-medium text-slate-600 hover:text-slate-900 sm:inline">เข้าสู่ระบบ</span>
            <span className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 font-medium text-white shadow-lg shadow-indigo-600/25 transition hover:shadow-indigo-600/40">
              สมัครเรียน
            </span>
          </div>
        </div>
      </header>

      {/* hero with blobs */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-10 h-96 w-96 rounded-full bg-violet-300/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-200/40 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> เปิดรับสมัครรุ่นใหม่แล้ว
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            สอนทุกอย่างเกี่ยวกับ{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            ตั้งแต่ใช้ AI เบื้องต้น ทำงานให้เร็วขึ้น ไปจนถึงเขียนซอฟต์แวร์ด้วย AI เรียนกับผู้สอนตัวจริง
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02]">
              ดูคอร์สทั้งหมด
            </span>
            <span className="rounded-xl border border-slate-300 bg-white/70 px-6 py-3 font-semibold text-slate-700 backdrop-blur transition hover:bg-white">
              ทดลองเรียนฟรี
            </span>
          </div>
          <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
            {DEMO_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm backdrop-blur">
                <div className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-2xl font-bold text-transparent">{s.value}</div>
                <div className="mt-1 text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {DEMO_FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
                <Icon name={f.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* courses */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">คอร์สเรียนยอดนิยม</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_COURSES.map((c, i) => (
            <div key={c.title} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className={`relative h-32 bg-gradient-to-br ${["from-indigo-500 to-violet-500", "from-violet-500 to-fuchsia-500", "from-sky-500 to-indigo-500"][i]}`}>
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                  {c.type === "open" ? "เรียนได้ทันที" : "มีรอบเรียน"}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600">{c.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{c.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-600">{baht(c.price)}</span>
                  <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition group-hover:bg-indigo-600 group-hover:text-white">
                    สมัคร
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* sample UI */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold">ตัวอย่างองค์ประกอบ</h2>
            <div className="mt-6 space-y-4">
              <input placeholder="อีเมลของคุณ" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
              <div className="flex flex-wrap gap-3">
                <span className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25">ปุ่มหลัก</span>
                <span className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700">ปุ่มรอง</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold">ป้ายสถานะ</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="amber">รอชำระเงิน</Badge>
              <Badge tone="blue">รอตรวจสอบสลิป</Badge>
              <Badge tone="green">ยืนยันแล้ว</Badge>
              <Badge tone="red">สลิปไม่ผ่าน</Badge>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-white">◆</span>
            AI Agent Academy
          </div>
          <span>© {new Date().getFullYear()} · สอนทุกอย่างเกี่ยวกับ AI</span>
        </div>
      </footer>
    </div>
  );
}

function Badge({ tone, children }: { tone: "amber" | "blue" | "green" | "red"; children: React.ReactNode }) {
  const map = {
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-rose-100 text-rose-700",
  } as const;
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${map[tone]}`}>{children}</span>;
}
