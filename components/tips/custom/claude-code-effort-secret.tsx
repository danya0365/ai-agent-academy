import {
  Zap,
  Cpu,
  Lightbulb,
  Gem,
  Sparkles,
  Info,
  CheckCircle2,
  ArrowRight,
  Gauge,
  BrainCircuit,
  AlertTriangle,
  Target,
  Scale,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

// ── ระดับ effort ────────────────────────────────────────────────────────────
type EffortLevel = {
  label: string;
  bars: number; // 1-4
  desc: string;
};

const EFFORT_LEVELS: EffortLevel[] = [
  { label: "auto", bars: 1, desc: "ปล่อยให้ Claude จัดการเอง" },
  { label: "low", bars: 2, desc: "งานเบาๆ ตอบเร็ว ประหยัด Token" },
  { label: "high", bars: 3, desc: "สมดุลระหว่างไวกับแม่น" },
  { label: "xhigh / max", bars: 4, desc: "รัดกุมสูงสุด — ไม่มีการเดา" },
];

// ── 2 กลยุทธ์หลัก ────────────────────────────────────────────────────────────
type Strategy = {
  model: string;
  icon: typeof Gem | typeof Cpu;
  tag: string;
  tagAccent: "brand" | "accent" | "muted";
  effortLevel: number; // index into EFFORT_LEVELS
  why: string;
  how: string;
  benefit: string;
  caution?: string;
};

const STRATEGIES: Strategy[] = [
  {
    model: "Claude Fable / Model แพง",
    icon: Gem,
    tag: "แค่ high ก็พอ",
    tagAccent: "brand",
    effortLevel: 2, // high
    why: "Model เก่งไม่เดา — อะไรไม่แน่ใจ มันสแกนโค้ดหาคำตอบเอง",
    how: "ตั้ง effort = high แล้วปล่อยให้มันทำงาน",
    benefit: "ประหยัด Token ไม่สูญเปล่า",
    caution: "ตั้ง effort สูงกว่า high → Token ฟรี",
  },
  {
    model: "Deepseek V4 / Model ถูก",
    icon: Cpu,
    tag: "ต้อง ultracode + xhigh",
    tagAccent: "accent",
    effortLevel: 3, // xhigh/max
    why: "Model ถูกชอบมโน ชอบเดา ต้องบังคับให้มันสำรวจก่อนตอบ",
    how: "เปิด ultracode + ตั้ง effort xhigh + workflow",
    benefit: "Model ถูกจะเลิกเดา ส่งผลลัพธ์เทียบเท่า Model แพง",
    caution: "งานอาจช้าลงเพราะมันใช้เวลาสแกนโค้ด",
  },
];

export function ClaudeCodeEffortSecret({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <Gauge className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* Effort levels */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Target className="size-5 text-brand-700" />
          ระดับ Effort ใน Claude Code
        </h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {EFFORT_LEVELS.map((level, i) => (
            <div
              key={i}
              className="card-flat flex flex-col gap-2 bg-muted-surface p-4"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-muted">
                {level.label}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className={`h-2 flex-1 rounded-full ${
                      j < level.bars
                        ? "bg-brand-500"
                        : "bg-card"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs leading-relaxed text-muted">
                {level.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* กลยุทธ์หลัก */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BrainCircuit className="size-5 text-brand-700" />
          เลือก Effort ยังไงให้คุ้ม
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          {STRATEGIES.map((s, i) => {
            const Icon = s.icon;
            const effort = EFFORT_LEVELS[s.effortLevel];
            return (
              <div key={i} className="card overflow-hidden">
                {/* Header strip */}
                <div
                  className={`flex items-center gap-3 px-5 py-4 ${
                    s.tagAccent === "brand"
                      ? "bg-brand-500/10"
                      : "bg-accent-500/10"
                  }`}
                >
                  <span
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                      s.tagAccent === "brand"
                        ? "bg-brand-500 text-on-brand"
                        : "bg-accent-500 text-on-brand"
                    }`}
                  >
                    <Icon className="size-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-foreground">
                      <span
                        className={`flex size-6 items-center justify-center rounded-lg text-xs font-bold text-on-brand ${
                          s.tagAccent === "brand"
                            ? "bg-brand-700"
                            : "bg-accent-700"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {s.model}
                    </h3>
                    <span
                      className={`badge mt-1 ${
                        s.tagAccent === "brand"
                          ? "bg-brand-500/10 text-brand-700"
                          : "bg-accent-500/10 text-accent-800"
                      }`}
                    >
                      {s.tag}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-4 p-5">
                  {/* Effort indicator */}
                  <div className="flex items-center gap-3">
                    <Gauge className="size-4 text-brand-700" />
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <div
                            key={j}
                            className={`h-3 w-6 rounded ${
                              j <= s.effortLevel
                                ? s.tagAccent === "brand"
                                  ? "bg-brand-500"
                                  : "bg-accent-500"
                                : "bg-card"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="whitespace-nowrap text-xs font-bold text-foreground">
                        {effort.label}
                      </span>
                    </div>
                  </div>

                  {/* Why */}
                  <div className="flex items-start gap-2 text-sm leading-relaxed text-foreground">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand-700" />
                    <span>
                      <span className="font-bold">เพราะ: </span>
                      {s.why}
                    </span>
                  </div>

                  {/* How */}
                  <div className="flex items-start gap-2 text-sm leading-relaxed text-muted">
                    <ArrowRight className="mt-0.5 size-4 shrink-0 text-brand-700" />
                    <span>
                      <span className="font-bold text-foreground">วิธี: </span>
                      {s.how}
                    </span>
                  </div>

                  {/* Benefit */}
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-muted-surface p-3">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-700" />
                    <p className="text-xs leading-relaxed text-muted">
                      <span className="font-bold text-foreground">
                        ผลลัพธ์:{" "}
                      </span>
                      {s.benefit}
                    </p>
                  </div>

                  {/* Caution */}
                  {s.caution && (
                    <div className="flex items-start gap-2 rounded-xl border-2 border-accent-500 bg-muted-surface p-3">
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-500" />
                      <p className="text-xs leading-relaxed text-muted">
                        <span className="font-bold text-foreground">
                          ข้อควรระวัง:{" "}
                        </span>
                        {s.caution}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* สรุปภาพรวม */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Scale className="size-5 text-brand-700" />
          เปรียบเทียบให้เห็นชัด
        </h2>

        {/* Comparison table */}
        <div className="card-flat mt-3 overflow-hidden bg-muted-surface">
          {/* Header row */}
          <div className="grid grid-cols-3 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">
            <div className="px-4 py-3" />
            <div className="px-4 py-3 text-center">Model แพง</div>
            <div className="px-4 py-3 text-center">Model ถูก</div>
          </div>
          {[
            {
              label: "Effort ที่แนะนำ",
              expensive: "high",
              cheap: "xhigh / max",
            },
            {
              label: "พฤติกรรม",
              expensive: "สแกนโค้ดเอง",
              cheap: "ต้องบังคับให้สแกน",
            },
            {
              label: "ความเสี่ยง",
              expensive: "ตั้งสูงไป → เสีย Token ฟรี",
              cheap: "ตั้งต่ำไป → เดา / มโน",
            },
            {
              label: "ผลลัพธ์",
              expensive: "ดีเยี่ยมแต่ประหยัด",
              cheap: "ดีได้เทียบเท่าถ้าตั้งถูก",
            },
            {
              label: "ความเร็ว",
              expensive: "เร็ว",
              cheap: "ช้าลง (สแกนเยอะ)",
            },
          ].map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 text-sm ${
                i % 2 === 0 ? "bg-card/50" : ""
              }`}
            >
              <div className="flex items-center gap-2 px-4 py-3 font-semibold text-foreground">
                {row.label}
              </div>
              <div className="flex items-center justify-center px-4 py-3 text-center text-brand-700">
                {row.expensive}
              </div>
              <div className="flex items-center justify-center px-4 py-3 text-center text-accent-700">
                {row.cheap}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-card p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-700" />
          <p className="text-xs leading-relaxed text-muted">
            กฎเหล็ก:{" "}
            <span className="font-semibold text-foreground">
              Model แพง → effort ต่ำ, Model ถูก → effort สูง
            </span>{" "}
            ถ้าจำอะไรไม่ต้องจำ จำแค่นี้ก็คุ้มทุก Token แล้ว
          </p>
        </div>
      </section>

      {/* สรุป */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">สรุป:</span>{" "}
          ถ้า Token ไม่มีปัญหา — ตั้ง effort max ตลอดเลย Agent จะรัดกุมเสมอ
          แต่ถ้าต้องบริหาร quota ให้จำไว้ว่า Fable แค่ high ก็พอ Deepseek
          ต้อง ultracode + xhigh + workflow — เท่านี้ก็คุ้มทุก Token แล้วครับ! 🔥
        </p>
      </div>
    </div>
  );
}
