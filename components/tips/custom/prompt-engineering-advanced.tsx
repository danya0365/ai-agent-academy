import {
  Sparkles,
  Lightbulb,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BrainCircuit,
  Target,
  Shuffle,
  Repeat,
  Stars,
  Wand2,
  GitBranch,
  Layers,
  Zap,
  GraduationCap,
  MessageSquareMore,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

// ── 4 เทคนิค ──────────────────────────────────────────────────────────────────
type Technique = {
  icon: typeof BrainCircuit;
  emoji: string;
  title: string;
  subtitle: string;
  tag: string;
  color: "brand" | "accent" | "brand-dark" | "accent-dark";
  desc: string;
  when: string;
  before: string;
  after: string;
  template?: string;
  proTip: string;
};

const TECHNIQUES: Technique[] = [
  {
    icon: BrainCircuit,
    emoji: "🧠",
    title: "Chain-of-Thought",
    subtitle: "CoT",
    tag: "ง่ายที่สุด ใช้บ่อยที่สุด",
    color: "brand",
    desc: "บอกให้ AI 'คิดทีละ step' ก่อนตอบ — Accuracy เพิ่มจาก 30% เป็น 80%+ โดยเฉพาะงานใช้เหตุผล คำนวณ หรือตรรกะ",
    when: "งานที่ต้องใช้เหตุผล: แก้บั๊ก, คำนวณ, วิเคราะห์, วางแผน, เขียนโค้ดซับซ้อน",
    before: '"มีไก่ 10 ตัว ขายไป 3 ซื้อมาเพิ่ม 5 เหลือกี่ตัว" → AI ตอบ 12 (ถ้าโจทย์ยากขึ้นจะมั่ว)',
    after: '"คิดทีละ step:\nStep 1: มีไก่ 10\nStep 2: ขายไป 3 → 10-3 = 7\nStep 3: ซื้อเพิ่ม 5 → 7+5 = 12\n\nตอบ: 12"\n→ Accuracy เพิ่ม十倍!',
    template:
      '[คำถาม]\n\nคิดทีละขั้นตอน:\nStep 1: ...\nStep 2: ...\n(คิดจนได้คำตอบ)',
    proTip:
      "Zero-shot CoT = แค่ต่อท้าย prompt ด้วย 'คิดทีละขั้นตอน' หรือ 'Let's think step by step' — AI จะเปิด reasoning mode โดยอัตโนมัติ ไม่ต้องยกตัวอย่าง",
  },
  {
    icon: Stars,
    emoji: "🎭",
    title: "Role Prompting ขั้นสูง",
    subtitle: "Advanced Role",
    tag: "Context + Constraints + Goal",
    color: "accent",
    desc: "ไม่ใช่แค่บอกชื่อบทบาท — ต้องให้ Context (สถานการณ์), Constraints (ข้อจำกัด), และ Goal (เป้าหมาย) AI จะตอบตรงเป้าที่สุด",
    when: "งานเขียน, วางแผน, ให้คำปรึกษา, สร้าง content, สอน/อธิบาย",
    before: '"คุณคือ Content Writer — ช่วยเขียนแคปชันขายเครื่องดื่มเพื่อสุขภาพ"',
    after: '"คุณคือ Content Writer สายการตลาดดิจิทัล\n\nContext: เขียนแคปชันใน Shopee ให้คนวัย 30-45\nConstraints: ห้ามศัพท์เทคนิค ไม่เกิน 100 คำ\nGoal: ให้อยากลองซื้อ\n\nเขียนแคปชัน..."\n→ ผลลัพธ์ตรงเป้า เอาไปใช้ได้เลย',
    template:
      'คุณคือ [บทบาท]\nความเชี่ยวชาญ: [XYZ]\n\nContext: [สถานการณ์ / กลุ่มเป้าหมาย]\nConstraints: [ข้อจำกัด]\nGoal: [เป้าหมาย]\n\n[คำสั่ง]',
    proTip:
      "Role Prompting + CoT = จุดสูงสุด — ให้ role + context แล้วต่อด้วย 'คิดทีละ step ก่อนตอบ' ได้ผลดีที่สุดสำหรับงานซับซ้อน",
  },
  {
    icon: GitBranch,
    emoji: "🤔",
    title: "Tree-of-Thought",
    subtitle: "ToT",
    tag: "หลายทางเลือก → เลือกที่ดีสุด",
    color: "brand-dark",
    desc: "ให้ AI สร้างหลายเส้นทางแก้ปัญหาพร้อมกัน วิเคราะห์แต่ละทาง แล้วเลือกเส้นที่ดีที่สุด — เหมือนมนุษย์ brainstorm!",
    when: "วางกลยุทธ์, ออกแบบระบบ complex, แก้ปัญหาหลายมิติ, เปรียบเทียบทางเลือก",
    before: '"บริษัทขายของออนไลน์ ยอดขายตก 30% — ช่วยหาทางแก้"',
    after: '"ยอดขายตก 30% — brainstorm 3 กลยุทธ์:\n\nA: จุดแข็งต้นทุนต่ำ\nB: จุดแข็งคุณภาพ\nC: จุดแข็งบริการ\n\nวิเคราะห์แต่ละข้อ: ดี/เสีย, ทรัพยากร, ผลลัพธ์\n→ เลือกที่ดีที่สุด"\n→ AI ตอบแบบมีเหตุผล ไม่มั่ว',
    template:
      '[ปัญหา]\n\nให้ brainstorm [N] ทางเลือก:\nทางเลือก A: [จุดแข็งต่างกัน]\nทางเลือก B: [จุดแข็งต่างกัน]\n...\n\nวิเคราะห์แต่ละทางเลือก:\n- ข้อดี / ข้อเสีย\n- ทรัพยากร\n- ผลลัพธ์\n\nเลือกทางที่ดีที่สุดและอธิบายว่าทําไม',
    proTip:
      "เริ่มด้วย ToT (กว้าง) → แล้ว CoT (ลึก) = ครอบคลุมทุกมุมมองก่อน แล้วค่อยเจาะลึกทางเลือกที่เลือก",
  },
  {
    icon: Repeat,
    emoji: "🔄",
    title: "Self-Consistency",
    subtitle: "ถามซ้ำ → หาคำตอบที่ซ้ำ",
    tag: "ลด Hallucination ได้จริง",
    color: "accent-dark",
    desc: "AI ไม่ได้ตอบเหมือนเดิมทุกครั้ง — ถามคำถามเดียวกันหลายรอบ แล้วเอาคำตอบที่ซ้ำกันมากที่สุด = คำตอบที่น่าเชื่อถือที่สุด",
    when: "คำถามที่ความถูกต้องสำคัญ: ตัวเลข, วันที่, กฎหมาย, ราคา, specification",
    before: '"ปี 2026 บริษัท AI ที่มีมูลค่ามากที่สุด?" → ตอบ OpenAI (เดา)',
    after: '"ตอบ 3 รอบ อิสระไม่ขึ้นกัน:\nรอบ 1: Nvidia\nรอบ 2: Nvidia\nรอบ 3: OpenAI\n→ Nvidia 2 ใน 3 → คำตอบที่ถูก"\n→ ลด Hallucination ได้จริง!',
    template:
      'ตอบคําถามนี้ [N] รอบ โดยแต่ละรอบคิดอิสระไม่ขึ้นกับรอบอื่น\n\nคําถาม: [คำถาม]\n\nรอบที่ 1:\nรอบที่ 2:\n...\n\nหาคําตอบที่ซ้ํากันมากที่สุด → ตอบ',
    proTip:
      "ถาม 3-5 รอบ — 3 รอบก็เพียงพอสำหรับความแม่นยำ 90%+ ถ้าต้องการสูงมากใช้ 5 รอบ \n\n(แต่เปลือง token นะ!)",
  },
];

// ── Before/After ───────────────────────────────────────────────────────────────
const COMPARISON = {
  before: [
    "Prompt เดียว ห่วยตลอดกาล",
    "AI มั่ว เดา ตอบไม่ตรง",
    "ต้องสั่งซ้ำ 3-4 รอบถึงได้ที่",
    "ไม่มีเทคนิค ขอให้ตอบเลย",
  ],
  after: [
    "Prompt มีเทคนิค เพิ่ม accuracy 300%",
    "AI คิดเป็นขั้นตอน ไม่เดา",
    "รอบเดียวก็ได้คำตอบที่ต้องการ",
    "ใช้เทคนิคระดับเทพที่ Pro ใช้",
  ],
};

// ── Pro Tips Bonus ──────────────────────────────────────────────────────────────
const PRO_TIPS = [
  {
    title: "CoT + Role = จุดสูงสุด",
    desc: "Role Prompting ขั้นสูง + ต่อด้วย CoT = แทบไม่ต้องสั่งซ้ำ — ให้ Context + Constraints + Goal แล้วบอก 'คิดทีละ step'",
  },
  {
    title: "ToT เจอตัน → CoT ขุดลึก",
    desc: "เริ่มกว้างด้วย ToT (หลายทางเลือก) แล้วเลือกที่ดีที่สุด → ใช้ CoT ขุดลึกในทางเลือกนั้น = สุดยอด",
  },
  {
    title: "Self-Consistency = AI Insurance",
    desc: "คำถามสำคัญที่ผิดไม่ได้ — ถามซ้ำ 3 รอบ + หาคำตอบที่ซ้ำมากที่สุด จะลด Hallucination ได้เยอะ",
  },
];

export function PromptEngineeringAdvanced({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <MessageSquareMore className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* ก่อน vs หลัง */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sparkles className="size-5 text-brand-700" />
          Prompt ปกติ vs Prompt ระดับเทพ
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card-flat border-2 border-accent-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-accent-600">
              ❌ Prompt ปกติ
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
              ✅ Prompt ระดับเทพ
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

      {/* 4 เทคนิค */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BrainCircuit className="size-5 text-brand-700" />
          4 เทคนิค Prompt Engineering ระดับเทพ
        </h2>

        <div className="mt-4 flex flex-col gap-5">
          {TECHNIQUES.map((t, i) => {
            const Icon = t.icon;
            const isBrand = t.color === "brand";
            const isAccent = t.color === "accent";
            return (
              <div key={i} className="card overflow-hidden">
                {/* Header */}
                <div
                  className={`flex items-center gap-3 px-5 py-4 ${
                    isBrand
                      ? "bg-brand-500/10"
                      : isAccent
                        ? "bg-accent-500/10"
                        : "bg-brand-700/10"
                  }`}
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                      isBrand
                        ? "bg-brand-500"
                        : isAccent
                          ? "bg-accent-500"
                          : "bg-brand-700"
                    } text-xl leading-none text-on-brand`}
                  >
                    {t.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-foreground">
                      <span
                        className={`flex size-6 items-center justify-center rounded-lg text-xs font-bold text-on-brand ${
                          isBrand
                            ? "bg-brand-700"
                            : isAccent
                              ? "bg-accent-700"
                              : "bg-brand-700"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {t.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-muted">{t.subtitle}</span>
                      <span className="badge bg-brand-500/10 text-brand-700">
                        <Zap className="size-3" />
                        {t.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-4 p-5">
                  <p className="text-sm leading-relaxed text-muted">{t.desc}</p>

                  {/* When to use */}
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
                    <Target className="mt-0.5 size-4 shrink-0 text-brand-700" />
                    <p className="text-xs leading-relaxed text-muted">
                      <span className="font-bold text-foreground">
                        ใช้เมื่อ:
                      </span>{" "}
                      {t.when}
                    </p>
                  </div>

                  {/* Before/After */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border-2 border-accent-500/40 bg-muted-surface p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-600">
                        ❌ Prompt ห่วย
                      </div>
                      <pre className="mt-1.5 overflow-x-auto text-xs leading-relaxed text-muted">
                        <code>{t.before}</code>
                      </pre>
                    </div>
                    <div className="rounded-xl border-2 border-brand-500/40 bg-muted-surface p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
                        ✅ Prompt เทพ
                      </div>
                      <pre className="mt-1.5 overflow-x-auto text-xs leading-relaxed text-foreground">
                        <code>{t.after}</code>
                      </pre>
                    </div>
                  </div>

                  {/* Template */}
                  {t.template && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                        <Wand2 className="size-3.5 text-brand-700" />
                        Template
                      </div>
                      <pre className="mt-1.5 overflow-x-auto rounded-xl border-2 border-brand-500/30 bg-muted-surface px-4 py-3 text-xs leading-relaxed text-foreground">
                        <code>{t.template}</code>
                      </pre>
                    </div>
                  )}

                  {/* Pro Tip */}
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
                    <p className="text-xs leading-relaxed text-muted">
                      <span className="font-bold text-foreground">Pro tip: </span>
                      {t.proTip}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pro Tips Summary */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Layers className="size-5 text-brand-700" />
          Combination Tips — รวมพลัง 4 เทคนิค
        </h2>

        <ul className="mt-3 flex flex-col gap-2">
          {PRO_TIPS.map((tip, i) => (
            <li key={i} className="card-flat flex gap-3 bg-muted-surface p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-extrabold text-on-brand">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{tip.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  {tip.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
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
              title: "CoT = พื้นฐานที่ทุกคนควรใช้",
              desc: "แค่ 'คิดทีละ step' ก็เพิ่ม Accuracy จาก 30% เป็น 80%+ โดยไม่ต้องเรียนเพิ่ม",
            },
            {
              title: "Role ขั้นสูง ≠ Role ธรรมดา",
              desc: "แค่บอกชื่อไม่พอ — ต้องมี Context + Constraints + Goal ด้วย",
            },
            {
              title: "ToT + CoT = Killer Combo",
              desc: "ให้ AI คิดหลายทางเลือก (ToT) → แล้วขุดลึกทางเลือกที่ดีที่สุด (CoT)",
            },
            {
              title: "Self-Consistency = ประกัน Hallucination",
              desc: "ถามซ้ำ 3 รอบ หาคำตอบที่ซ้ำมากที่สุด — ใช้กับคำถามที่ผิดไม่ได้",
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
          <span className="font-bold">เริ่มวันนี้!</span>{" "}
          ครั้งหน้าเปิด AI — ลองแค่ 1 เทคนิคก็ดีแล้ว: ต่อท้าย prompt ด้วย "คิดทีละขั้นตอน" แค่นี้ accuracy ก็พุ่ง!
          พอชินแล้วค่อยเพิ่ม Role ขั้นสูง → ToT → Self-Consistency 🔥
        </p>
      </div>
    </div>
  );
}
