import {
  BatteryWarning,
  Calendar,
  Zap,
  Repeat,
  BarChart3,
  Flame,
  Sparkles,
  Info,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Sun,
  Moon,
  Server,
  Route,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

/**
 * Component เฉพาะของเคล็ดลับ "claude-code-quota-strategy"
 * — กลยุทธ์บริหาร quota Claude Code รายสัปดาห์ สลับ Subscription + Free model
 *   ผ่าน 9Router เพื่อยืด quota ไม่ให้หมดก่อนครบ 7 วัน
 *
 * อ้างอิง: raw content จาก tips/1.md
 */

// ── วันในสัปดาห์ ────────────────────────────────────────────────────────────
type DayInfo = {
  day: string;
  short: string;
  icon: typeof Zap | typeof Server;
  model: string;
  provider: string;
  quotaUsed: number; // สะสม %
  quotaDelta: number; // % ที่ใช้ในวันนี้
  desc: string;
  accent: "brand" | "muted";
};

const DAYS: DayInfo[] = [
  {
    day: "วันจันทร์",
    short: "จ.",
    icon: Zap,
    model: "Claude Fable",
    provider: "Claude Subscription",
    quotaUsed: 30,
    quotaDelta: 30,
    desc: "วางแผน + ใส่ฟีเจอร์ใหม่ จัดเต็มกับโมเดลหลัก",
    accent: "brand",
  },
  {
    day: "วันอังคาร",
    short: "อ.",
    icon: Server,
    model: "Deepseek V4",
    provider: "9Router (free)",
    quotaUsed: 30,
    quotaDelta: 0,
    desc: "พัก subscription — ใช้โมเดลฟรีทำงานต่อเนื่อง",
    accent: "muted",
  },
  {
    day: "วันพุธ",
    short: "พ.",
    icon: Zap,
    model: "Claude Fable",
    provider: "Claude Subscription",
    quotaUsed: 60,
    quotaDelta: 30,
    desc: "กลับมาใช้ Claude ต่อ — quota ยังเหลือให้จัดเต็ม",
    accent: "brand",
  },
  {
    day: "วันพฤหัสบดี",
    short: "พฤ.",
    icon: Server,
    model: "Deepseek V4",
    provider: "9Router (free)",
    quotaUsed: 60,
    quotaDelta: 0,
    desc: "พัก subscription อีกรอบ — งานเดินต่อ",
    accent: "muted",
  },
  {
    day: "วันศุกร์",
    short: "ศ.",
    icon: Zap,
    model: "Claude Fable",
    provider: "Claude Subscription",
    quotaUsed: 85,
    quotaDelta: 25,
    desc: "ปิดฟีเจอร์ค้าง — quota สัปดาห์เริ่มบางแล้ว",
    accent: "brand",
  },
  {
    day: "วันเสาร์",
    short: "ส.",
    icon: Server,
    model: "Deepseek V4",
    provider: "9Router (free)",
    quotaUsed: 85,
    quotaDelta: 0,
    desc: "วันหยุด — ใช้ฟรี ไม่กิน quota",
    accent: "muted",
  },
  {
    day: "วันอาทิตย์",
    short: "อา.",
    icon: Flame,
    model: "Claude Fable",
    provider: "Claude Subscription",
    quotaUsed: 100,
    quotaDelta: 15,
    desc: "เผา quota ที่เหลือ! ปรับแต่ง + รีไฟน์จนหมด",
    accent: "brand",
  },
];

// ── ทำไมถึงใช้ได้ผล ──────────────────────────────────────────────────────────
const REASONS = [
  {
    title: "ไม่เครียด",
    desc: "ไม่ต้องตั้งเวลามาเขียนโค้ด ไม่ต้องรีบ — มีโมเดลฟรีให้สลับใช้ตลอด",
  },
  {
    title: "ประหยัด quota",
    desc: "วันไหนแค่ปรับนิดหน่อย ใช้โมเดลฟรีก็พอ quota หลักเก็บไว้ใช้วันสำคัญ",
  },
  {
    title: "ไม่เสีย productivity",
    desc: "9Router สลับ provider ให้อัตโนมัติ โค้ดเดินต่อโดยไม่ต้องหยุดรอรีเซ็ต",
  },
];

export function ClaudeCodeQuotaStrategy({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* ปัญหา → ทางออก */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <BatteryWarning className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* Weekly Strategy — 7-day timeline */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Calendar className="size-5 text-brand-700" />
          กลยุทธ์ 7 วัน
        </h2>

        <ol className="mt-4 flex flex-col gap-3">
          {DAYS.map((day, i) => {
            const Icon = day.icon;
            const isSubscription = day.accent === "brand";
            return (
              <li key={i}>
                <div className="card flex gap-4 p-4">
                  {/* Day number */}
                  <div className="flex shrink-0 flex-col items-center gap-1">
                    <span className="flex size-10 items-center justify-center rounded-xl border-2 border-border bg-card font-extrabold text-foreground">
                      {i + 1}
                    </span>
                    <span className="text-xs font-semibold text-muted">
                      {day.short}
                    </span>
                  </div>

                  {/* Day icon */}
                  <div
                    className={`mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl ${
                      isSubscription
                        ? "bg-brand-500 text-on-brand"
                        : "bg-card text-muted"
                    }`}
                  >
                    <Icon className="size-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span className="text-sm font-bold text-foreground">
                        {day.day}
                      </span>
                      <span
                        className={`badge ${
                          isSubscription
                            ? "bg-brand-500/10 text-brand-700"
                            : "bg-muted-surface text-muted"
                        }`}
                      >
                        {day.model}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {day.desc}
                    </p>

                    {/* Quota bar (เฉพาะวันที่มีการใช้ subscription) */}
                    {isSubscription && (
                      <div className="mt-2 flex items-center gap-3">
                        <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted-surface">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all"
                            style={{ width: `${day.quotaUsed}%` }}
                          />
                        </div>
                        <span className="whitespace-nowrap text-xs font-semibold text-foreground">
                          {day.quotaUsed}%
                        </span>
                      </div>
                    )}

                    {/* Provider badge */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                      <Route className="size-3" />
                      {day.provider}
                    </div>
                  </div>
                </div>

                {/* Arrow connector */}
                {i < DAYS.length - 1 && (
                  <div className="flex justify-center py-1 text-muted">
                    <ArrowRight className="size-4 rotate-90" />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {/* Quota Overview — แผนภูมิ quota สะสม */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BarChart3 className="size-5 text-brand-700" />
          สัดส่วนการใช้ quota
        </h2>
        <div className="card-flat mt-3 flex flex-col gap-3 bg-muted-surface p-5">
          {/* Overall progress bar */}
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-xs font-semibold text-muted">
              Claude
            </span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-card">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: "55%" }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-foreground">
              55%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-xs font-semibold text-muted">
              Free
            </span>
            <div className="h-4 flex-1 overflow-hidden rounded-full bg-card">
              <div
                className="h-full rounded-full bg-brand-300"
                style={{ width: "45%" }}
              />
            </div>
            <span className="shrink-0 text-xs font-semibold text-foreground">
              45%
            </span>
          </div>

          <div className="mt-1 flex items-start gap-2 rounded-xl border border-border bg-card p-3">
            <Info className="mt-0.5 size-4 shrink-0 text-brand-700" />
            <p className="text-xs leading-relaxed text-muted">
              สลับวันเว้นวันแบบนี้ quota Claude Subscription ใช้แค่ 55%
              ของสัปดาห์ — ที่เหลือใช้โมเดลฟรีผ่าน 9Router
              ยืดอายุ quota ได้เกือบเท่าตัว!
            </p>
          </div>
        </div>
      </section>

      {/* ทำไมถึงใช้ได้ผล */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sparkles className="size-5 text-brand-700" />
          ทำไมวิธีนี้ถึงเวิร์ก
        </h2>

        <ul className="mt-3 flex flex-col gap-2">
          {REASONS.map((reason, i) => (
            <li key={i} className="card-flat flex gap-3 bg-muted-surface p-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-extrabold text-on-brand">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">
                  {reason.title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  {reason.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Prerequisites — ต่อ 9Router */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Repeat className="size-5 text-brand-700" />
          ต้องมีอะไรก่อน?
        </h2>

        <div className="card-flat mt-3 flex flex-col gap-3 bg-muted-surface p-5">
          <p className="text-sm leading-relaxed text-muted">
            หัวใจของกลยุทธ์นี้คือการมี{" "}
            <span className="font-semibold text-foreground">
              ตัวเลือกโมเดลฟรี
            </span>{" "}
            ไว้สลับใช้ตอนพัก subscription — ใช้ 9Router เป็น gateway
            คั่นกลางเพื่อสลับ provider ได้ทันที
          </p>

          <ol className="flex flex-col gap-2">
            {[
              "ติดตั้ง 9Router (npm install -g 9router)",
              "ต่อ provider ฟรีใน dashboard (OpenCode Free / Kiro AI)",
              "ชี้ Claude Code มา endpoint 9Router",
              "เซ็ต default model เป็นโมเดลฟรี",
            ].map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm text-muted"
              >
                <span className="mt-0.5 size-2 shrink-0 rounded-full bg-brand-700" />
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="flex items-start gap-2 rounded-xl border-2 border-accent-500 bg-card p-3">
            <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
            <p className="text-xs leading-relaxed text-muted">
              <span className="font-bold text-foreground">แนะนำ: </span>
              อ่าน{" "}
              <a
                href="/tips/claude-code-token-survival"
                className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-500"
              >
                Claude Code token หมดกลางงาน? สลับไปใช้ model อื่นด้วย 9Router
              </a>{" "}
              สำหรับขั้นตอนติดตั้ง 9Router แบบละเอียด
            </p>
          </div>
        </div>
      </section>

      {/* สรุป */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">แค่นี้ก็รอด!</span>{" "}
          ทำตาม 7-day strategy นี้รับรอง quota Claude Code
          ครบสัปดาห์โดยไม่ต้องรอรีเซ็ต — ไม่เครียด ไม่ต้องรีบ
          มีโมเดลฟรีให้สลับใช้ทั้งสัปดาห์!
        </p>
      </div>
    </div>
  );
}
