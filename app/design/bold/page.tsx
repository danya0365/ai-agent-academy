import { DEMO_COURSES, DEMO_FEATURES, DEMO_STATS, baht } from "../_data";

export const metadata = { title: "Bold Edutech — Design Preview" };

function Icon({ name, className }: { name: string; className?: string }) {
  const common = { className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "spark") return <svg {...common}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" /></svg>;
  if (name === "bolt") return <svg {...common}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
  if (name === "shield") return <svg {...common}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" /></svg>;
  return null;
}

const ACCENTS = ["bg-indigo-600", "bg-amber-400", "bg-emerald-500"];

export default function BoldPage() {
  return (
    <div className="min-h-screen bg-amber-50 text-slate-900">
      {/* chunky navbar */}
      <header className="sticky top-0 z-20 border-b-2 border-slate-900 bg-amber-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">🤖</span>
            <span>AI ACADEMY</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-bold md:flex">
            <span className="hover:text-indigo-600">คอร์ส</span>
            <span className="hover:text-indigo-600">ราคา</span>
            <span className="hover:text-indigo-600">รีวิว</span>
          </nav>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="hidden px-3 py-2 sm:inline">เข้าสู่ระบบ</span>
            <span className="rounded-full border-2 border-slate-900 bg-amber-400 px-5 py-2 shadow-[3px_3px_0_0_#0f172a] transition active:translate-x-0.5 active:translate-y-0.5">
              สมัครเรียน
            </span>
          </div>
        </div>
      </header>

      {/* vibrant hero — สีพื้นทึบ (ไม่ใช้ gradient) */}
      <section className="relative overflow-hidden border-b-2 border-slate-900 bg-indigo-600">
        <div className="pointer-events-none absolute -right-10 top-10 h-40 w-40 rotate-12 rounded-3xl bg-amber-400/80" />
        <div className="pointer-events-none absolute bottom-6 left-10 h-24 w-24 rounded-full bg-emerald-400/80" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center text-white sm:px-6 sm:py-28">
          <span className="inline-block rounded-full border-2 border-white/30 bg-white/15 px-4 py-1.5 text-sm font-bold backdrop-blur">
            🚀 เปิดรับสมัครแล้ววันนี้
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            สอนทุกอย่างเกี่ยวกับ AI!
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg font-medium text-indigo-100">
            ตั้งแต่ใช้ AI เบื้องต้น ทำงานให้เร็วขึ้น ไปจนถึงเขียนซอฟต์แวร์ด้วย AI สนุก เข้าใจง่าย ใช้ได้จริง
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border-2 border-slate-900 bg-amber-400 px-7 py-3 font-extrabold text-slate-900 shadow-[4px_4px_0_0_#0f172a]">
              ดูคอร์สเลย!
            </span>
            <span className="rounded-full border-2 border-white bg-white/10 px-7 py-3 font-extrabold text-white backdrop-blur">
              ทดลองฟรี
            </span>
          </div>
          <div className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
            {DEMO_STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border-2 border-white/30 bg-white/10 p-4 backdrop-blur">
                <div className="text-2xl font-black text-amber-300">{s.value}</div>
                <div className="mt-1 text-xs font-semibold text-indigo-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* features */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-3">
          {DEMO_FEATURES.map((f, i) => (
            <div key={f.title} className="rounded-3xl border-2 border-slate-900 bg-white p-6 shadow-[5px_5px_0_0_#0f172a]">
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${ACCENTS[i]} ${i === 1 ? "text-slate-900" : "text-white"}`}>
                <Icon name={f.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold">{f.title}</h3>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* courses */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h2 className="text-2xl font-black tracking-tight sm:text-3xl">คอร์สเรียนยอดฮิต 🔥</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {DEMO_COURSES.map((c, i) => (
            <div key={c.title} className="group flex flex-col overflow-hidden rounded-3xl border-2 border-slate-900 bg-white shadow-[5px_5px_0_0_#0f172a] transition hover:-translate-y-1">
              <div className={`relative h-28 ${["bg-indigo-600", "bg-fuchsia-600", "bg-emerald-500"][i]}`}>
                <span className="absolute left-4 top-4 rounded-full border-2 border-slate-900 bg-amber-400 px-3 py-1 text-xs font-extrabold text-slate-900">
                  {c.type === "open" ? "เรียนได้ทันที" : "มีรอบเรียน"}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-extrabold">{c.title}</h3>
                <p className="mt-2 line-clamp-2 flex-1 text-sm font-medium text-slate-600">{c.blurb}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-black text-indigo-600">{baht(c.price)}</span>
                  <span className="rounded-full border-2 border-slate-900 bg-amber-400 px-4 py-1.5 text-sm font-extrabold text-slate-900 shadow-[2px_2px_0_0_#0f172a]">
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
        <div className="grid gap-8 rounded-3xl border-2 border-slate-900 bg-white p-8 shadow-[6px_6px_0_0_#0f172a] sm:grid-cols-2">
          <div>
            <h2 className="text-xl font-extrabold">ตัวอย่างองค์ประกอบ</h2>
            <div className="mt-6 space-y-4">
              <input placeholder="อีเมลของคุณ" className="w-full rounded-2xl border-2 border-slate-900 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:bg-amber-50" />
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full border-2 border-slate-900 bg-indigo-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[3px_3px_0_0_#0f172a]">ปุ่มหลัก</span>
                <span className="rounded-full border-2 border-slate-900 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-900">ปุ่มรอง</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-extrabold">ป้ายสถานะ</h2>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge tone="amber">รอชำระเงิน</Badge>
              <Badge tone="blue">รอตรวจสอบสลิป</Badge>
              <Badge tone="green">ยืนยันแล้ว</Badge>
              <Badge tone="red">สลิปไม่ผ่าน</Badge>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-slate-900 bg-amber-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm font-semibold text-slate-600 sm:flex-row">
          <div className="flex items-center gap-2 text-base font-extrabold text-slate-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">🤖</span>
            AI ACADEMY
          </div>
          <span>© {new Date().getFullYear()} · สอนทุกอย่างเกี่ยวกับ AI</span>
        </div>
      </footer>
    </div>
  );
}

function Badge({ tone, children }: { tone: "amber" | "blue" | "green" | "red"; children: React.ReactNode }) {
  const map = {
    amber: "bg-amber-300 text-slate-900",
    blue: "bg-sky-300 text-slate-900",
    green: "bg-emerald-300 text-slate-900",
    red: "bg-rose-300 text-slate-900",
  } as const;
  return <span className={`rounded-full border-2 border-slate-900 px-3 py-1 text-xs font-extrabold ${map[tone]}`}>{children}</span>;
}
