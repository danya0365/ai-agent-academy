import {
  Sparkles,
  Lightbulb,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MessageSquareText,
  ListChecks,
  Target,
  GraduationCap,
  BrainCircuit,
  FileCode,
} from "lucide-react";;
import type { Tip } from "@/lib/tips";

// ── 5 เทคนิค ──────────────────────────────────────────────────────────────────
type Technique = {
  emoji: string;
  title: string;
  subtitle: string;
  wrong: string;
  wrongNote: string;
  right: string;
  rightNote: string;
  proTip: string;
};

const TECHNIQUES: Technique[] = [
  {
    emoji: "🎭",
    title: "บอกบทบาท AI",
    subtitle: "Role Assignment",
    wrong: '"ช่วยเขียนอีเมลหาลูกค้าหน่อย"',
    wrongNote: "AI ตอบ generic อ่านแล้วไม่รู้สึกอะไร",
    right:
      '"คุณคือ Head of Sales มีประสบการณ์ 10 ปี กําลังส่งอีเมลถึงซีอีโอ Start-up — ช่วยร่างอีเมลหาลูกค้าที่กําลังจะปิดดีลหน่อย"',
    rightNote: "AI จะใช้ภาษามืออาชีพ มีโครงสร้าง มีกลยุทธ์",
    proTip:
      "เพิ่ม context ยิ่งเยอะยิ่งดี — ใครเขียนถึง? กําลัง stage ไหน? อยากให้รู้สึกยังไง?",
  },
  {
    emoji: "📋",
    title: "ให้ตัวอย่างที่อยากได้",
    subtitle: "Few-shot Learning",
    wrong: '"เขียนแคปชันขายคอร์ส AI หน่อย"',
    wrongNote: "AI มั่วมา 5 แบบ คุณไม่ชอบสักแบบ",
    right:
      '"เขียนแคปชันขายคอร์ส AI ในสไตล์นี้:\nตัวอย่าง: \'คอร์ส AI เรียนจบใน 7 วัน ไม่ต้องมีพื้นฐานก็เริ่มได้ — สมัครวันนี้ลด 50%!\'\n\nเขียนอีก 3 แคปชันสไตล์เดียวกัน"',
    rightNote: "AI รักษาโทนเดิม สรรพคุณเดิม เป๊ะเวอร์",
    proTip:
      "ยิ่งตัวอย่างใกล้เคียงงานที่อยากได้มากเท่าไหร่ — AI จะ replicate pattern ได้แม่นยําขึ้นเท่านั้น",
  },
  {
    emoji: "📐",
    title: "กําหนดรูปแบบผลลัพธ์",
    subtitle: "Format Control",
    wrong: '"วิเคราะห์ข้อดีข้อเสียของ React กับ Vue"',
    wrongNote: "AI ตอบเป็นเรียงความยาว ยากอ่าน",
    right:
      '"วิเคราะห์ข้อดีข้อเสียของ React กับ Vue โดยตอบเป็นตาราง 4 คอลัมน์: หัวข้อ | React | Vue | หมายเหตุ"',
    rightNote: "ตารางชัดเจน อ่านแล้วเข้าใจทันที",
    proTip:
      "JSON, Markdown table, HTML, bullet, CSV — กําหนด format ไว้ตั้งแต่แรก แล้วใช้ต่อได้เลย",
  },
  {
    emoji: "🎯",
    title: "ให้เกณฑ์ตัดสิน",
    subtitle: "Evaluation Criteria",
    wrong: '"ช่วยเขียนคู่มือใช้ ChatGPT"',
    wrongNote: "AI เขียนกลางๆ ใช้ได้ทุกคน แต่ไม่ถูกใจใคร",
    right:
      '"ช่วยเขียนคู่มือใช้ ChatGPT สําหรับคนอายุ 50+ ที่เพิ่งหัดใช้คอม — ห้ามใช้ศัพท์เทคนิค อธิบายภาพทีละขั้น มีตัวอย่างทุกขั้นตอน"',
    rightNote: "คนอ่านรู้สึกว่าคู่มือนี้เขียนเพื่อฉัน!",
    proTip:
      "บอก persona ปลายทาง + อะไรห้ามใช้ + what good looks like — แล้ว AI จะปรับระดับเอง",
  },
  {
    emoji: "🔄",
    title: "ให้ AI ตรวจงานตัวเอง",
    subtitle: "Self-Review",
    wrong: '"ตอบคําถามนี้"',
    wrongNote: "AI ตอบแล้ว — ไม่มีการตรวจทาน อาจมีบั๊กหรือข้อมูลมั่ว",
    right:
      '"ตอบคําถามนี้ แล้วตรวจคําตอบของคุณอีกครั้งก่อนส่ง — ถ้ามีจุดที่ผิดหรือไม่ถูกต้องให้แก้ไข"',
    rightNote: "ลด error ได้ถึง 80% — AI เจอและแก้จุดมั่วให้เอง",
    proTip:
      "ใช้กับงานที่ความถูกต้องสําคัญมาก เช่น ราคาสินค้า วันที่ กฎหมาย การคํานวณ",
  },
];

// ── Before/After สรุป ──────────────────────────────────────────────────────────
const COMPARISON = {
  before: [
    "AI ตอบเรื่อยเปื่อย ไม่ตรงเป้า",
    "ต้อง prompt ซ้ำหลายรอบกว่าจะได้ที่ใช่",
    "เสียเวลาตัดต่อผลลัพท์ทีหลัง",
    "AI มั่วข้อมูล เพ้อเจ้อ",
  ],
  after: [
    "AI ตอบตรงเป้า ครั้งเดียวรู้เรื่อง",
    "Prompt สั้นลง แต่ผลลัพธ์ดีขึ้น",
    "ผลลัพธ์พร้อมใช้ ไม่ต้องแต่งต่อ",
    "AI ตรวจงานตัวเองก่อนส่ง",
  ],
};

// ── Prompt Templates ───────────────────────────────────────────────────────────
const PROMPT_TEMPLATES = [
  {
    label: "For Writing/Content",
    code: `คุณคือ Copywriter ระดับ Senior ที่เชี่ยวชาญการเขียนโน้มน้าวใจ
ลูกค้าเป้าหมายคือคนไทยวัย 25-40 ที่สนใจเรียน AI

ช่วยเขียนโพสต์โปรโมทคอร์ส AI ขนาด 2-3 ย่อหน้า
โดยมีโครงสร้าง: ปัญหา → ทางออก → CTA
ใช้ภาษาที่เป็นกันเอง เน้นประโยชน์ที่จับต้องได้
ไม่ต้องลงท้ายด้วย #Hashtag

ตรวจทานอีกรอบว่าไม่มีข้อมูลเกินจริงก่อนส่ง`,
    note: "แปะ Role + Goal + Format + Criteria + Self-Review = ครบ 5 ข้อใน prompt เดียว",
  },
  {
    label: "For Code/Technical",
    code: `คุณเป็น Senior Full-stack Developer ที่เชี่ยวชาญ Next.js + TypeScript

ช่วยเขียนฟังก์ชันที่รับ array ของ user objects แล้วคืนค่า
เฉพาะ user ที่ active ใน 30 วันที่ผ่านมา

ตอบเป็น TypeScript มี JSDoc
เกณฑ์: ใช้ performant approach หลีกเลี่ยงการลูปซ้อน
อธิบายสั้นๆ ว่าวิธีนี้คืออะไร

ตรวจสอบ logic อีกรอบว่า err case (empty, null, 0) ถูกจัดการหรือไม่`,
    note: "ใช้กับงานโค้ดได้เหมือนกัน — แค่เปลี่ยน Role + Format ตาม context",
  },
];

// ── Scorecard ───────────────────────────────────────────────────────────────────
const SCORE_QUESTIONS = [
  { q: "บอกบทบาท AI?", yes: false },
  { q: "ให้ตัวอย่าง?", yes: false },
  { q: "กำหนดรูปแบบ?", yes: false },
  { q: "ให้เกณฑ์ตัดสิน?", yes: false },
  { q: "ให้ตรวจงาน?", yes: false },
];

export function PromptsThatWork({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <MessageSquareText className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* ก่อน vs หลัง */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sparkles className="size-5 text-brand-700" />
          ก่อน vs หลัง ใช้ 5 เทคนิค
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card-flat border-2 border-accent-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-accent-600">
              ❌ Prompt ธรรมดา
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
              ✅ Prompt สุดปัง
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

      {/* 5 เทคนิค */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BrainCircuit className="size-5 text-brand-700" />
          5 เทคนิคเปลี่ยนชีวิต prompt
        </h2>

        <ol className="mt-4 flex flex-col gap-5">
          {TECHNIQUES.map((t, i) => (
            <li key={i} className="card overflow-hidden">
              {/* Header strip */}
              <div className="flex items-center gap-3 bg-brand-500/10 px-5 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-lg leading-none text-on-brand">
                  {t.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 text-base font-extrabold text-foreground">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-on-brand">
                      {i + 1}
                    </span>
                    {t.title}
                  </h3>
                  <span className="text-xs text-muted">{t.subtitle}</span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-4 p-5">
                {/* ❌ Wrong */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-600">
                    <XCircle className="size-3.5" />
                    ❌ แบบเดิม
                  </div>
                  <pre className="mt-1.5 overflow-x-auto rounded-xl border border-border bg-muted-surface px-4 py-3 text-xs leading-relaxed text-muted">
                    <code>{t.wrong}</code>
                  </pre>
                  <p className="mt-1 text-xs italic text-muted">{t.wrongNote}</p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center text-brand-700">
                  <ArrowRight className="size-5" />
                </div>

                {/* ✅ Right */}
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
                    <CheckCircle2 className="size-3.5" />
                    ✅ แบบเทพ
                  </div>
                  <pre className="mt-1.5 overflow-x-auto rounded-xl border-2 border-brand-500/30 bg-muted-surface px-4 py-3 text-xs leading-relaxed text-foreground">
                    <code>{t.right}</code>
                  </pre>
                  <p className="mt-1 text-xs italic text-muted">{t.rightNote}</p>
                </div>

                {/* Pro tip */}
                <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
                  <p className="text-xs leading-relaxed text-muted">
                    <span className="font-bold text-foreground">Pro tip: </span>
                    {t.proTip}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Quick-check Scorecard */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <ListChecks className="size-5 text-brand-700" />
          Prompt Scorecard — เช็กก่อนส่ง
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          สั่่ง AI แต่ละครั้ง ถามตัวเอง 5 ข้อนี้ — ยิ่งเช็กหลายข้อเท่าไหร่
          ผลลัพธ์ยิ่งตรงเป้า
        </p>

        <div className="card-flat mt-3 flex flex-col gap-2 bg-muted-surface p-5">
          {SCORE_QUESTIONS.map((q, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted-surface text-xs font-bold text-muted">
                {i + 1}
              </span>
              <span className="flex-1">{q.q}</span>
              <span className="rounded-md border-2 border-dashed border-brand-500/50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                ✅ / ❌
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card p-3">
          <Info className="size-4 shrink-0 text-brand-700" />
          <p className="text-xs leading-relaxed text-muted">
            ถ้าตอบ{" "}
            <span className="font-bold text-foreground">"ใช่" 3+ ข้อ</span>{" "}
            — prompt คุณอยู่ในเกณฑ์ดีแล้ว! ถ้า{" "}
            <span className="font-bold text-accent-600">&lt; 3</span>{" "}
            ลองกลับไปเพิ่มอีกนิด
          </p>
        </div>
      </section>

      {/* Prompt Templates */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <FileCode className="size-5 text-brand-700" />
          Prompt ตัวอย่าง — คัดลอกไปใช้ได้เลย
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          รวม 5 เทคนิคไว้ใน prompt เดียว — แค่เปลี่ยน content ตามงานที่ทำ
        </p>

        <div className="mt-4 flex flex-col gap-4">
          {PROMPT_TEMPLATES.map((p, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border bg-brand-500/10 px-5 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-on-brand">
                  {i === 0 ? (
                    <GraduationCap className="size-5" />
                  ) : (
                    <FileCode className="size-5" />
                  )}
                </span>
                <h3 className="text-sm font-extrabold text-foreground">
                  {p.label}
                </h3>
              </div>
              <pre className="overflow-x-auto bg-card p-4 text-xs leading-relaxed">
                <code>{p.code}</code>
              </pre>
              {p.note && (
                <div className="flex items-start gap-2 border-t border-border bg-muted-surface px-5 py-3">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-brand-700" />
                  <p className="text-xs leading-relaxed text-muted">{p.note}</p>
                </div>
              )}
            </div>
          ))}
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
              title: "AI Tools เดียวกัน — Prompt ต่างกัน ผลลัพธ์คนละโลก",
              desc: "ไม่ต้องเสียตังอัปเกรด plan แค่ปรับ prompt ก็เห็นผลต่างชัดเจน",
            },
            {
              title: "เริ่มเพิ่มทีละเทคนิคก็ได้",
              desc: "เริ่มจาก Role Assignment อย่างเดียวก็ดีกว่าไม่ทำอะไรเลย — ค่อยขยับไปครบ 5 ข้อ",
            },
            {
              title: "Scorecard = เพื่อนสนิทก่อนส่ง prompt",
              desc: "5 คำถาม 30 วินาที — ช่วยให้ prompt คุณดีขึ้นโดยไม่ต้องคิดมาก",
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

      {/* CTA */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">
            ครั้งหน้าสั่ง AI — ลองใช้ 5 เทคนิคนี้ดู!
          </span>{" "}
          เช็ก Scorecard ก่อนส่ง prompt แค่ 30 วินาที —
          ผลลัพธ์ที่ได้จะดีขึ้นโดยไม่ต้องลงทุนเพิ่มสักบาท 🔥
        </p>
      </div>
    </div>
  );
}
