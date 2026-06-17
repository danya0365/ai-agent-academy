import Link from "next/link";
import { STYLES } from "./_data";

export const metadata = { title: "Design Preview — AI Agent Academy" };

export default function DesignIndexPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm font-medium uppercase tracking-widest text-indigo-600">
        Design Preview
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        เลือกสไตล์ที่ชอบ
      </h1>
      <p className="mt-3 max-w-xl text-slate-600">
        ตัวอย่าง 4 แนวทางดีไซน์ของเว็บ AI Agent Academy แต่ละหน้าใช้เนื้อหาเดียวกัน
        ต่างกันที่การตกแต่ง — ลองเปิดดูทั้งบนมือถือและจอใหญ่ แล้วบอกผมว่าชอบแบบไหน
        เดี๋ยวผมเอาไปทำจริงทั้งแอป
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {STYLES.map((s, i) => (
          <Link
            key={s.slug}
            href={`/design/${s.slug}`}
            className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                {i + 1}
              </span>
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600">
                {s.name}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
              ดูตัวอย่าง
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs text-slate-400">
        * หน้าเหล่านี้เป็นตัวอย่างชั่วคราวใต้ /design — ไม่กระทบหน้าแอปจริง ลบทีหลังได้
      </p>
    </div>
  );
}
