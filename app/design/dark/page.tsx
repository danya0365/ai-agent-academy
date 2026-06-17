import { DEMO_COURSES, DEMO_FEATURES, DEMO_STATS, baht } from "../_data";

export const metadata = { title: "Dark Premium / Aurora — Design Preview" };

function Icon({ name, className }: { name: string; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "spark") return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>;
  if (name === "bolt") return <svg {...common}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" /></svg>;
  return null;
}

export default function DarkPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* dark glass navbar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2 font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-cyan-400 text-slate-950">◍</span>
            <span>AI Agent Academy</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <span className="hover:text-white">คอร์ส</span>
            <span className="hover:text-white">ราคา</span>
            <span className="hover:text-white">รีวิว</span>
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden px-3 py-2 text-slate-300 hover:text-white sm:inline">เข้าสู่ระบบ</span>
            <span className="rounded-xl bg-white px-4 py-2 font-semibold text-slate-950 transition hover:bg-slate-200">สมัครเรียน</span>
          </div>
        </div>
      </header>

      {/* aurora hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-indigo-600/40 blur-[120px]" />
        <div className="pointer-events-none absolute -top-10 right-1/4 h-96 w-96 rounded-full bg-cyan-500/30 blur-[120px]" />
        <div className="pointer-events-none absolute top-20 left-10 h-72 w-72 rounded-full bg-fuchsia-600/30 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-200 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-cyan-400" /> รุ่นใหม่ · เรียนออนไลน์
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            สอนทุกอย่างเกี่ยวกับ{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            ตั้งแต่ใช้ AI เบื้องต้น ทำงานให้เร็วขึ้น ไปจนถึงเขียนซอฟต์แวร์ด้วย AI เรียนกับผู้สอนตัวจริง
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]">
              เริ่มเรียน →
            </span>
            <span className="rounded-xl border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10">
              ดูตัวอย่างบทเรียน
            </span>
          </div>
          <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
            {DEMO_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-2xl font-bold text-transparent">{s.value}</div>
                <div className="mt-1 text-xs text-slate-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {DEMO_FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.06]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-cyan-400/30 text-cyan-300 ring-1 ring-white/10">
                <Icon name={f.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* courses */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">คอร์สเรียนยอดนิยม</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_COURSES.map((c, i) => (
            <div key={c.title} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-white/20">
              <div className={`relative h-32 bg-gradient-to-br ${["from-indigo-600 to-cyan-500", "from-fuchsia-600 to-indigo-500", "from-cyan-500 to-sky-600"][i]}`}>
                <span className="absolute left-4 top-4 rounded-full bg-slate-950/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {c.type === "open" ? "เรียนได้ทันที" : "มีรอบเรียน"}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-semibold text-white">{c.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-400">{c.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-lg font-bold text-cyan-300">{baht(c.price)}</span>
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition group-hover:bg-cyan-400 group-hover:text-slate-950">สมัคร</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* sample UI */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-bold text-white">ตัวอย่างองค์ประกอบ</h2>
            <div className="mt-6 space-y-4">
              <input placeholder="อีเมลของคุณ" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60 focus:ring-4 focus:ring-cyan-500/10" />
              <div className="flex flex-wrap gap-3">
                <span className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950">ปุ่มหลัก</span>
                <span className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white">ปุ่มรอง</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">ป้ายสถานะ</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="amber">รอชำระเงิน</Badge>
              <Badge tone="blue">รอตรวจสอบสลิป</Badge>
              <Badge tone="green">ยืนยันแล้ว</Badge>
              <Badge tone="red">สลิปไม่ผ่าน</Badge>
            </div>
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-slate-400 sm:flex-row">
          <div className="flex items-center gap-2 font-bold text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-cyan-400 text-slate-950">◍</span>
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
    amber: "bg-amber-400/15 text-amber-300 ring-amber-400/30",
    blue: "bg-sky-400/15 text-sky-300 ring-sky-400/30",
    green: "bg-emerald-400/15 text-emerald-300 ring-emerald-400/30",
    red: "bg-rose-400/15 text-rose-300 ring-rose-400/30",
  } as const;
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${map[tone]}`}>{children}</span>;
}
