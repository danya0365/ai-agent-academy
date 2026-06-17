import { DEMO_COURSES, DEMO_FEATURES, DEMO_STATS, baht } from "../_data";

export const metadata = { title: "Elegant Minimal — Design Preview" };

function Icon({ name, className }: { name: string; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "spark") return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>;
  if (name === "bolt") return <svg {...common}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" /></svg>;
  return null;
}

export default function ElegantPage() {
  return (
    <div className="min-h-screen bg-[#fbfbfa] text-slate-900">
      {/* navbar */}
      <header className="border-b border-slate-200/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-[15px] font-semibold tracking-tight">AI Agent Academy</span>
          <nav className="hidden items-center gap-8 text-sm text-slate-500 sm:flex">
            <span className="hover:text-slate-900">คอร์ส</span>
            <span className="hover:text-slate-900">เกี่ยวกับเรา</span>
            <span className="hover:text-slate-900">รีวิว</span>
          </nav>
          <div className="flex items-center gap-5 text-sm">
            <span className="hidden text-slate-500 hover:text-slate-900 sm:inline">เข้าสู่ระบบ</span>
            <span className="rounded-full border border-slate-900 px-4 py-1.5 font-medium text-slate-900 transition hover:bg-slate-900 hover:text-white">
              สมัครเรียน
            </span>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          เรียน AI กับผู้สอนตัวจริง
        </p>
        <h1 className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          สอนทุกอย่าง
          <br className="hidden sm:block" /> เกี่ยวกับ AI
        </h1>
        <div className="mt-6 h-px w-16 bg-slate-900" />
        <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-slate-600">
          ตั้งแต่ใช้ AI เบื้องต้น ทำงานให้เร็วขึ้น ไปจนถึงเขียนซอฟต์แวร์ด้วย AI
          เรียนออนไลน์ สมัครแล้วเริ่มได้ทันที
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <span className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-700">
            ดูคอร์สทั้งหมด
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-900">
            ดูตัวอย่างบทเรียน
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>

        {/* stats */}
        <div className="mt-16 grid max-w-lg grid-cols-3 gap-8 border-t border-slate-200 pt-8">
          {DEMO_STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-semibold tracking-tight sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-5xl px-6 pb-8">
        <div className="grid gap-10 border-t border-slate-200 pt-12 sm:grid-cols-3">
          {DEMO_FEATURES.map((f) => (
            <div key={f.title}>
              <Icon name={f.icon} className="h-6 w-6 text-slate-900" />
              <h3 className="mt-4 text-base font-medium">{f.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* courses */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">คอร์สเรียน</h2>
          <span className="text-sm text-slate-400">ดูทั้งหมด →</span>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3">
          {DEMO_COURSES.map((c) => (
            <div key={c.title} className="group flex flex-col bg-[#fbfbfa] p-7 transition hover:bg-white">
              <span className="text-xs uppercase tracking-wider text-slate-400">
                {c.type === "open" ? "เรียนได้ทันที" : "มีรอบเรียน"} · {c.level}
              </span>
              <h3 className="mt-4 text-lg font-medium leading-snug">{c.title}</h3>
              <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-slate-500">{c.blurb}</p>
              <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-base font-semibold tracking-tight">{baht(c.price)}</span>
                <span className="inline-flex items-center gap-1 text-sm text-slate-900 group-hover:gap-2 transition-all">
                  สมัคร
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* sample UI */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">ตัวอย่างองค์ประกอบ</h2>
            <p className="mt-2 text-sm font-light text-slate-500">ปุ่ม อินพุต และป้ายสถานะในสไตล์นี้</p>
            <div className="mt-8 space-y-5">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-slate-400">อีเมล</label>
                <input
                  placeholder="you@email.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-900"
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white">ปุ่มหลัก</span>
                <span className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700">ปุ่มรอง</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">ป้ายสถานะ</h2>
            <p className="mt-2 text-sm font-light text-slate-500">โทนเรียบ ใช้สีน้อย</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge tone="amber">รอชำระเงิน</Badge>
              <Badge tone="blue">รอตรวจสอบสลิป</Badge>
              <Badge tone="green">ยืนยันแล้ว</Badge>
              <Badge tone="red">สลิปไม่ผ่าน</Badge>
            </div>
            <div className="mt-8 rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-medium">การ์ดเนื้อหา</p>
              <p className="mt-2 text-sm font-light leading-relaxed text-slate-500">
                เส้นขอบบาง เงาน้อย ระยะโปร่ง เน้นความสะอาดและพื้นที่ว่าง
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-slate-400 sm:flex-row">
          <span className="font-medium text-slate-700">AI Agent Academy</span>
          <span>© {new Date().getFullYear()} · สอนทุกอย่างเกี่ยวกับ AI</span>
        </div>
      </footer>
    </div>
  );
}

function Badge({ tone, children }: { tone: "amber" | "blue" | "green" | "red"; children: React.ReactNode }) {
  const map = {
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    red: "bg-rose-50 text-rose-700 ring-rose-200",
  } as const;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${map[tone]}`}>{children}</span>
  );
}
