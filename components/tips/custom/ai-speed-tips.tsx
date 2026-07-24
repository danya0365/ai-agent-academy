import {
  Rocket,
  PenLine,
  Bookmark,
  ListChecks,
  Sparkles,
  Lightbulb,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
  Box,
  Target,
  BrainCircuit,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

// ── 3 Steps ────────────────────────────────────────────────────────────────────
type StepData = {
  icon: typeof PenLine;
  emoji: string;
  title: string;
  subtitle: string;
  tagline: string;
  before: string;
  after: string;
  savings: string;
  cover: "bg-brand-500" | "bg-accent-500" | "bg-brand-700";
  howTo: string[];
  proTip: string;
};

const STEPS: StepData[] = [
  {
    icon: PenLine,
    emoji: "⏳",
    title: "ให้ AI ร่างก่อน",
    subtitle: "แล้วเราเกลา",
    tagline: "ประหยัดเวลา 50%+",
    before:
      '"ช่วยเขียนอีเมลเสนอไอเดียโปรเจคใหม่"\n→ AI ร่างมา 10 วิ\n→ เราเกลาสํานวน\n→ ส่ง! 15 นาที',
    after:
      '"ช่วยเขียนอีเมลเสนอไอเดียโปรเจคใหม่ให้หัวหน้า ยาว 3 ย่อหน้า"\n→ AI ร่างให้ใน 10 วิ\n→ เราเกลาสํานวน\n→ ส่ง! 15 นาที',
    savings: "ประหยัด 50%+",
    cover: "bg-brand-500",
    howTo: [
      "เริ่ม prompt ด้วย 'ช่วยร่าง...' หรือ 'ช่วยเขียน...'",
      "กำหนดรูปแบบให้ชัด (กี่ย่อหน้า / กี่ข้อ / สไตล์ไหน)",
      "ใช้เวลาไปกับการ 'ตรวจและปรับ' ไม่ใช่ 'คิดและเขียน",
    ],
    proTip:
      "ยิ่งกำหนดโครงสร้างชัดเท่าไหร่ — AI ร่างยิ่งตรง เราเกลายิ่งน้อย อย่าให้ AI เริ่มจาก 0 ลองให้ template ก่อน",
  },
  {
    icon: Bookmark,
    emoji: "📦",
    title: "เก็บ prompt แม่แบบ",
    subtitle: "เลิกคิดซ้ำทุกครั้ง",
    tagline: "ครั้งเดียว ใช้ซ้ำไม่รู้จบ",
    before:
      '"ช่วยเขียน unit test ให้ฟังก์ชันนี้หน่อย"\n→ คิด prompts ทุกครั้ง\n→ ผลลัพธ์ไม่เหมือนเดิม\n→ เสียเวลา 10 นาที/รอบ',
    after:
      '(เปิด prompts.md)\n🐛 "มี error นี้... วิเคราะห์สาเหตุ"\n📝 "ช่วยสรุปประชุมนี้เป็น bullet"\n🧪 "เขียน unit test ด้วย Vitest"\n→ แค่เปลี่ยน content → ส่ง!',
    savings: "ประหยัด 80%+",
    cover: "bg-accent-500",
    howTo: [
      "เก็บ prompt ที่ใช้บ่อยใน prompts.md ในโปรเจค",
      "แต่ละแม่แบบ: role + รูปแบบที่ชอบ + ตัวอย่าง output",
      "ครั้งหน้าแค่เปลี่ยน context → ไม่ต้องคิด prompt ใหม่",
    ],
    proTip:
      "เก็บ prompts.md เข้า git ด้วย — พกพาข้ามเครื่องได้ snippet manager หรือ extension ก็ดี (แต่ .md กัน dependency)",
  },
  {
    icon: ListChecks,
    emoji: "🧩",
    title: "สั่งงานเป็นขั้นตอน",
    subtitle: "1 prompt = 1  scope",
    tagline: "แม่นยำกว่า 3 เท่า",
    before:
      '"สร้างระบบจัดการผู้ใช้"\n→ AI มั่วโครงสร้างใหญ่\n→ แต่ละส่วนไม่ match กัน\n→ แก้งานซ้ำ เสียเวลา',
    after:
      'Step 1: "ออกแบบ Schema ตาราง users"\nStep 2: "เขียน API register/login"\nStep 3: "เขียน UI register form"\nStep 4: "เขียน validate middleware"\n→ แต่ละ step AI ทําดีเพราะ scope เล็ก',
    savings: "Accuracy +300%",
    cover: "bg-brand-700",
    howTo: [
      "แตกงานใหญ่เป็นขั้นย่อยก่อนสั่ง AI",
      "1 prompt = 1 scope เท่านั้น — อย่าสั่งหลายอย่างในเดียว",
      "เรียงลําดับ dependency ให้ถูก (Schema → API → UI)",
    ],
    proTip:
      "คิดแบบ Engineer: งานที่คนทํายากเพราะ scope กว้างไป — AI ก็เหมือนกัน Break it down แล้ว AI จะเก่งขึ้นทันที",
  },
];

// ── Before/After Table ─────────────────────────────────────────────────────────
const COMPARISON = {
  before: [
    "นั่งคิดงานจากศูนย์ทุกครั้ง",
    "เขียน prompt ซ้ำๆ ไม่มีแม่แบบ",
    "โยนงานใหญ่เข้า prompt เดียว → AI มั่ว",
    "เสียเวลาแก้ของที่ AI ทํามาไม่ตรง",
  ],
  after: [
    "AI ร่างให้ก่อน เราแค่เกลา",
    "มี prompt แม่แบบ ใช้ซ้ำไม่รู้จบ",
    "งานใหญ่แตกเป็นขั้น → AI ทําแม่น",
    "แทบไม่ต้องแก้ — พร้อมใช้งาน",
  ],
};

// ── Use Cases ───────────────────────────────────────────────────────────────────
const USE_CASES = [
  { title: "🐛 แก้บั๊ก", desc: "แปะ error + path → AI วิเคราะห์สาเหตุ เสนอ 3 วิธีแก้" },
  { title: "📝 สรุปประชุม", desc: "แปะบันทึก → AI สรุป bullet ไม่เกิน 5 ข้อ พร้อมคนรับผิดชอบ" },
  { title: "🧪 เขียน test", desc: "แปะ source → AI เขียน unit test ครอบคลุมทุก case" },
  { title: "✍️ เขียนโพสต์", desc: "บอกหัวข้อ + โทน → AI ร่างให้ 3 แบบ เลือกที่ชอบ" },
  { title: "📧 อีเมลงาน", desc: "บอก context + ใคร + ต้องการอะไร → AI ร่างให้เกลา" },
  { title: "📊 วิเคราะห์ข้อมูล", desc: "แปะ data + คำถาม → AI วิเคราะห์ + สรุป insight" },
];

export function AiSpeedTips({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <Rocket className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* ก่อน vs หลัง */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sparkles className="size-5 text-brand-700" />
          ปรับ workflow แป๊บเดียว — ความเร็วเปลี่ยนทันที
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card-flat border-2 border-accent-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-accent-600">
              ❌ workflow เดิม
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              {COMPARISON.before.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-flat border-2 border-brand-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-brand-700">
              ✅ workflow ใหม่
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              {COMPARISON.after.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BrainCircuit className="size-5 text-brand-700" />
          3 เทคนิคเพิ่มความเร็วทันที
        </h2>

        <ol className="mt-4 flex flex-col gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={i} className="card overflow-hidden">
                {/* Cover strip */}
                <div className={`flex items-center gap-3 px-5 py-4 ${step.cover}`}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl leading-none text-white">
                    {step.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-white">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-white/20 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      {step.title}
                      <span className="font-normal text-white/80">—</span>
                      <span className="font-normal text-white/80">{step.subtitle}</span>
                    </h3>
                    <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                      <Zap className="size-3" />
                      {step.tagline}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-4 p-5">
                  {/* Before/After */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border-2 border-accent-500/40 bg-muted-surface p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-600">
                        <XCircle className="size-3.5" />
                        ❌ แบบเก่า
                      </div>
                      <pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-muted">
                        <code>{step.before}</code>
                      </pre>
                    </div>
                    <div className="rounded-xl border-2 border-brand-500/40 bg-muted-surface p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
                        <CheckCircle2 className="size-3.5" />
                        ✅ แบบใหม่
                      </div>
                      <pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-foreground">
                        <code>{step.after}</code>
                      </pre>
                    </div>
                  </div>

                  {/* How to */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Target className="size-3.5 text-brand-700" />
                      วิธีทํา
                    </div>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {step.howTo.map((h, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pro Tip */}
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
                    <p className="text-xs leading-relaxed text-muted">
                      <span className="font-bold text-foreground">Pro tip: </span>
                      {step.proTip}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Use Cases — Prompt Templates */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Box className="size-5 text-brand-700" />
          Copy-Paste Prompts — ใช้ได้เลยวันนี้
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map((uc, i) => (
            <div key={i} className="card-flat bg-muted-surface p-4">
              <p className="text-sm font-bold text-foreground">{uc.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{uc.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card p-3">
          <Info className="size-4 shrink-0 text-brand-700" />
          <p className="text-xs leading-relaxed text-muted">
            เก็บ prompts พวกนี้ไวในไฟล์{" "}
            <code className="rounded bg-muted-surface px-1.5 py-0.5 font-mono text-xs font-semibold text-foreground">
              prompts.md
            </code>{" "}
            ในโปรเจค — commit เข้า git ด้วย จะพกพาข้ามเครื่อง!
          </p>
        </div>
      </section>

      {/* Key Takeaways */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Target className="size-5 text-brand-700" />
          Key Takeaways
        </h2>

        <ul className="mt-3 flex flex-col gap-2">
          {[
            {
              title: "ให้ AI ร่าง → เราเกลา",
              desc: "อย่าเริ่มจาก 0 — ให้ AI ทำส่วน 'สร้าง' เราทำส่วน 'แก้ไข' เร็วขึ้น 50%",
            },
            {
              title: "แม่แบบ prompt = เงินฝาก",
              desc: "ลงแรงครั้งเดียว ใช้ซ้ำไม่รู้จบ — เก็บ prompts.md ไว้ใน git",
            },
            {
              title: "แตกงานเป็นขั้น = AI ไม่มั่ว",
              desc: "1 prompt = 1 scope — งานใหญ่แยกเป็น step แล้ว AI จะแม่นขึ้นทันที",
            },
          ].map((k, i) => (
            <li key={i} className="card-flat flex gap-3 bg-muted-surface p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-extrabold text-on-brand">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{k.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  {k.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Summary */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">
            3 เทคนิคนี้ — เริ่มใช้พรุ่งนี้ก็ได้!
          </span>{" "}
          ให้ AI ร่างก่อน → เก็บแม่แบบ prompt → แตกงานเป็นขั้น
          workflow แบบนี้จะทำให้คุณใช้ AI ทำงานได้เร็วขึ้น 3 เท่า
          โดยไม่ต้องลงทุนเพิ่มสักบาท 🔥
        </p>
      </div>
    </div>
  );
}
