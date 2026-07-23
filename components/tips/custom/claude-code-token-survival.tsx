import {
  Route,
  BatteryWarning,
  Layers,
  Download,
  Terminal,
  Info,
  ArrowRight,
  ExternalLink,
  PlugZap,
  LayoutDashboard,
  Settings2,
  FileCode,
  CheckCircle2,
  FlaskConical,
  Lightbulb,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

/**
 * Component เฉพาะของเคล็ดลับ "claude-code-token-survival"
 * — trick เอาตัวรอดตอน token/โควต้า Claude Code หมด: ต่อ 9Router แล้วให้ auto-fallback
 *   สลับไปโมเดลอื่นให้เอง
 *
 * ออกแบบเป็น step การ์ด + code block (มีคำสั่งให้ copy ไปวางได้)
 * เพิ่ม step ใหม่ = append เข้า STEPS ด้านล่าง (เขียนสดทีละ step)
 */

// ── ชั้นของ 3-tier fallback (จากเว็บ 9router.com) ─────────────────────────────
const TIERS = [
  {
    label: "Tier 1 — Subscription",
    desc: "ใช้ของที่จ่ายอยู่แล้วก่อน",
    providers: "Claude Code · Codex · Gemini · Copilot",
    cover: "bg-brand-700",
  },
  {
    label: "Tier 2 — ตัวประหยัด",
    desc: "พอ Tier 1 ชน limit → สลับมาตัวถูกอัตโนมัติ",
    providers: "GLM ($0.60) และโมเดลราคาถูกอื่น ๆ",
    cover: "bg-brand-500",
  },
  {
    label: "Tier 3 — ชั้นสำรอง",
    desc: "กันไว้ท้ายสุด ให้โค้ดต่อได้ไม่มีสะดุด",
    providers: "provider สำรองที่ตั้งไว้ในหน้า dashboard",
    cover: "bg-accent-500",
  },
];

// ── ขั้นตอน (เขียนสดทีละ step) ───────────────────────────────────────────────
type Command = { label?: string; file?: string; code: string };
type Choice = { tag: string; title: string; desc: string };
type Step = {
  icon: typeof Download;
  title: string;
  desc?: string;
  /** breadcrumb การกดในหน้า dashboard เช่น "Dashboard → Providers → Connect" */
  path?: string;
  /** ตัวเลือก provider ที่เลือกต่อได้ */
  choices?: Choice[];
  /** ขั้นตอนย่อยแบบ checklist */
  bullets?: string[];
  commands?: Command[];
  note?: string;
  /** callout เกร็ด/ข้อควรระวัง (เด่นกว่า note) */
  tip?: string;
  /** ภาพประกอบท้าย step (path ใน public/) */
  image?: { src: string; caption?: string };
};

const STEPS: Step[] = [
  {
    icon: Download,
    title: "ติดตั้ง 9Router",
    desc: "ติดตั้งแบบ global ผ่าน npm ครั้งเดียว ใช้ได้ทุกโปรเจค แล้วเปิดใช้งานด้วยคำสั่งเดียว",
    commands: [
      { label: "1) ติดตั้ง (global)", code: "npm install -g 9router" },
      { label: "2) เปิดใช้งาน", code: "9router" },
    ],
    note: "พอรัน 9router ครั้งแรก dashboard จะเด้งขึ้นเองที่ http://localhost:20128 — ตรงนี้คือศูนย์บัญชาการ ไว้เชื่อม provider (OAuth หรือ API key) endpoint แบบ OpenAI-compatible อยู่ที่ http://localhost:20128/v1",
  },
  {
    icon: PlugZap,
    title: "เชื่อม provider ในหน้า dashboard",
    desc: "ในหน้า dashboard เข้าเมนู Providers แล้วกด Connect เลือก provider ที่จะเป็น 'ชั้นสำรอง' ของเรา เคล็ดลับเอาตัวรอด: ต่ออย่างน้อย 1 ตัวที่ฟรีหรือถูก ไว้รับช่วงต่อตอนโควต้าหลักหมด",
    path: "Dashboard → Providers → Connect",
    choices: [
      {
        tag: "ฟรี (แนะนำสุด)",
        title: "Kiro AI",
        desc: "ได้ Claude 4.5 + GLM-5 + MiniMax ฟรี ไม่ต้องใส่ API key — ล็อกอินด้วย Google / GitHub / AWS Builder ID เป็นตัวสำรองที่คุ้มที่สุด (โมเดล kr/claude-sonnet-4.5)",
      },
      {
        tag: "Subscription",
        title: "Claude Code (Pro/Max)",
        desc: "กด Connect → OAuth login แล้ว 9Router จะ refresh token + ติดตามโควต้า 5 ชม./รายสัปดาห์ให้เอง (เป็น Tier 1 — โมเดล cc/claude-opus-4-7, cc/claude-sonnet-4-6)",
      },
      {
        tag: "ตัวถูก",
        title: "GLM (Zhipu AI)",
        desc: "สมัคร open.bigmodel.cn เอา API key มาใส่ที่ Add API Key ราคา ~$0.6/1M รีเซ็ตทุกวัน (โมเดล glm/glm-5.1) — ดีสำหรับสำรองแบบมีเพดานค่าใช้จ่าย",
      },
    ],
    note: "สำคัญ: ก๊อป API Key จากหน้า dashboard เก็บไว้ — จะเอาไปใส่ตอนตั้งค่าให้ Claude Code ชี้มาที่ 9Router ใน step ถัดไป",
  },
  {
    icon: Settings2,
    title: "ชี้ Claude Code ให้ route ผ่าน 9Router",
    desc: "บอก Claude Code ให้ยิง request ผ่าน 9Router แทน endpoint ปกติ — trick นี้เจาะคนใช้ผ่าน VSCode extension เป็นหลัก (สร้างไฟล์ .claude/settings.local.json ในโฟลเดอร์โปรเจค) ส่วนใครใช้ Claude Code CLI ก็มีวิธีสำรองให้ เอา API Key จาก dashboard (Step 2) มาใส่ตรง key/token",
    commands: [
      {
        file: "แนะนำสำหรับ VSCode Extension · <project>/.claude/settings.local.json",
        code: `{
  "autoUpdatesChannel": "latest",
  "env": {
    "ANTHROPIC_BASE_URL": "http://localhost:20128/v1",
    "ANTHROPIC_API_KEY": "<9router key จาก dashboard>",
    "ANTHROPIC_AUTH_TOKEN": "<9router key จาก dashboard>",
    "//": "glm/glm-5.2, ocg/glm-5.2, ocg/kimi-k2.7-code, antigravity-opus-4.6",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "oc/deepseek-v4-flash-free",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "oc/deepseek-v4-flash-free",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "oc/deepseek-v4-flash-free",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "oc/deepseek-v4-flash-free"
  }
}`,
      },
      {
        file: "Claude Code CLI · ~/.claude/config.json",
        code: '{\n  "anthropic_api_base": "http://localhost:20128/v1",\n  "anthropic_api_key": "<9router key จาก dashboard>"\n}',
      },
      {
        label: "Claude Code CLI · หรือใช้ environment variable",
        code: 'export ANTHROPIC_BASE_URL="http://localhost:20128"\nexport ANTHROPIC_AUTH_TOKEN="<9router key จาก dashboard>"\nexport ANTHROPIC_MODEL="cc/claude-opus-4-7"\nclaude',
      },
    ],
    note: "วิธี VSCode extension แมป model ทุกชั้นของ Claude Code (Opus/Sonnet/Haiku/Fable) ให้วิ่งไป oc/deepseek-v4-flash-free (ฟรี) — อยากใช้รุ่นอื่นก็แก้ที่ value ได้ ดูตัวอย่างที่บรรทัด // เช่น glm/glm-5.2, ocg/kimi-k2.7-code · เช็กว่าต่อติดที่ usage history ในหน้า dashboard แล้วรีโหลด Claude Code ให้อ่านค่าใหม่",
    tip: "บาง provider ต่อได้โดยไม่ต้อง login — เอาชื่อ model ไปใส่ในไฟล์ settings ได้เลย เช่น oc/deepseek-v4-flash-free (ตัวที่ใช้ด้านบน) แต่ของฟรีแบบนี้จะมี rate limit รายวัน · ถ้าติด rate limit ต้องหาทางแก้เอง เช่น ตั้ง Proxy Pools ที่ http://localhost:20128/dashboard/proxy-pools แล้วกำหนดให้ provider OpenCode Free ใช้ proxy pool ที่เราตั้งไว้ เพื่อเลี่ยง rate limit",
  },
  {
    icon: FlaskConical,
    title: "ทดสอบว่าใช้งานได้จริง",
    desc: "เช็กให้ชัวร์ว่า Claude Code ยิง request ผ่าน 9Router จริง ไม่ใช่ endpoint เดิม — ทำตามนี้",
    bullets: [
      "เปิด session ใหม่ใน Claude Code (ผ่าน VSCode)",
      "พิมพ์ทักสั้น ๆ เช่น “สวัสดี” แล้วรอดูว่ามีตอบกลับไหม",
      "ถ้าคุยไปนาน ๆ แล้ว session ค้าง ให้กด Reload Window ใน VSCode แล้วลองใหม่",
      "เปิดหน้า Usage ใน 9Router dashboard — เมนู Usage หรือเข้า http://localhost:20128/dashboard/usage ตรง ๆ",
    ],
    note: "ดูที่การ์ด Total Requests กับ Recent Requests — ถ้าตัวเลข request เพิ่มขึ้น และเห็นโมเดล deepseek-v4-flash-… วิ่งเข้ามา (ตรงกับที่แมปไว้ใน Step 3) = ต่อสำเร็จ! Claude Code กำลังใช้โมเดลฟรีผ่าน 9Router อยู่",
    image: {
      src: "/tips/9router-usage.png",
      caption:
        "หน้า Usage ของ 9Router dashboard — Recent Requests วิ่งเป็น deepseek-v4-flash ผ่าน 9Router และ Total Requests เดินหน้าเรื่อย ๆ",
    },
  },
];

function CodeBlock({ command }: { command: Command }) {
  const isFile = Boolean(command.file);
  const header = command.file ?? command.label;
  const HeaderIcon = isFile ? FileCode : Terminal;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted-surface">
      {header && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs font-semibold text-muted">
          <HeaderIcon className="size-3.5 shrink-0" />
          {header}
        </div>
      )}
      <pre className="overflow-x-auto px-4 py-3">
        <code className="block font-mono text-sm leading-relaxed text-foreground">
          {isFile
            ? command.code
            : command.code.split("\n").map((line, j) => (
                <span key={j} className="block">
                  <span className="select-none text-muted">$ </span>
                  {line}
                </span>
              ))}
        </code>
      </pre>
    </div>
  );
}

export function ClaudeCodeTokenSurvival({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* ปัญหา → ทางออก */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <BatteryWarning className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* 9Router คืออะไร */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Route className="size-5 text-brand-700" />
          9Router คืออะไร?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          เป็น <span className="font-semibold text-foreground">gateway อัจฉริยะ</span>{" "}
          (OpenAI-compatible) ที่คั่นกลางระหว่างเครื่องมือของเรา — Claude Code,
          Cursor, Codex, Cline, Copilot — กับ{" "}
          <span className="font-semibold text-foreground">60+ AI providers</span>{" "}
          ผ่าน endpoint เดียว หัวใจคือระบบ{" "}
          <span className="font-semibold text-foreground">
            fallback อัตโนมัติ 3 ชั้น
          </span>{" "}
          พอชั้นบนชน limit/โควต้าหมด มันสลับไปชั้นถัดไปให้เองโดยเราไม่ต้องหยุดพิมพ์
        </p>
      </section>

      {/* 3-tier fallback visual */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Layers className="size-5 text-brand-700" />
          Auto-Fallback 3 ชั้นทำงานยังไง
        </h2>
        <ol className="mt-3 flex flex-col gap-2">
          {TIERS.map((tier, i) => (
            <li key={i}>
              <div className="card flex items-center gap-4 p-4">
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl border-2 border-border font-extrabold text-on-brand ${tier.cover}`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {tier.label}
                    <span className="ml-2 font-normal text-muted">
                      — {tier.desc}
                    </span>
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {tier.providers}
                  </p>
                </div>
              </div>
              {i < TIERS.length - 1 && (
                <div className="flex justify-center py-1 text-muted">
                  <ArrowRight className="size-4 rotate-90" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* ขั้นตอนทำจริง */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Terminal className="size-5 text-brand-700" />
          ลงมือทำทีละขั้น
        </h2>

        <ol className="mt-4 flex flex-col gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={i} className="card flex gap-4 p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-brand-500 text-on-brand">
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
                    <span className="text-brand-700">{i + 1}.</span>
                    {step.title}
                  </h3>
                  {step.desc && (
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {step.desc}
                    </p>
                  )}
                  {step.path && (
                    <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted-surface px-3 py-2 font-mono text-xs font-semibold text-foreground">
                      <LayoutDashboard className="size-3.5 text-muted" />
                      {step.path}
                    </div>
                  )}
                  {step.choices && step.choices.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {step.choices.map((c, j) => (
                        <div
                          key={j}
                          className="rounded-xl border border-border bg-muted-surface p-3"
                        >
                          <span className="badge bg-card text-foreground">
                            {c.tag}
                          </span>
                          <p className="mt-1.5 text-sm font-bold text-foreground">
                            {c.title}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted">
                            {c.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {step.bullets && step.bullets.length > 0 && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {step.bullets.map((b, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.commands && step.commands.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {step.commands.map((cmd, j) => (
                        <CodeBlock key={j} command={cmd} />
                      ))}
                    </div>
                  )}
                  {step.note && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-muted-surface p-3">
                      <Info className="mt-0.5 size-4 shrink-0 text-brand-700" />
                      <p className="text-xs leading-relaxed text-muted">
                        {step.note}
                      </p>
                    </div>
                  )}
                  {step.tip && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-accent-500 bg-muted-surface p-3">
                      <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
                      <p className="text-xs leading-relaxed text-muted">
                        <span className="font-bold text-foreground">
                          หมายเหตุ:{" "}
                        </span>
                        {step.tip}
                      </p>
                    </div>
                  )}
                  {step.image && (
                    <figure className="mt-3 overflow-hidden rounded-xl border-2 border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={step.image.src}
                        alt={step.image.caption ?? "ภาพประกอบขั้นตอน"}
                        loading="lazy"
                        className="w-full"
                      />
                      {step.image.caption && (
                        <figcaption className="border-t-2 border-border bg-muted-surface px-4 py-2 text-xs leading-relaxed text-muted">
                          {step.image.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </div>
              </li>
            );
          })}
        </ol>

        {/* สรุปจบ flow หลัก — พร้อมใช้ */}
        <div className="card-flat mt-4 flex items-start gap-3 bg-muted-surface p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" />
          <p className="text-sm leading-relaxed text-foreground">
            <span className="font-bold">เท่านี้ก็รอดแล้ว!</span> จากนี้พอโควต้า Claude
            Code หลักหมด 9Router จะสลับไปใช้ provider สำรองที่ต่อไว้ให้อัตโนมัติ —
            โค้ดต่อได้ยาว ๆ ไม่ต้องนั่งรอรีเซ็ต
          </p>
        </div>
      </section>

      {/* เครดิต + แหล่งอ้างอิงทางการ (เผื่อเอกสารมีการเปลี่ยนแปลง) */}
      <div className="card-flat flex flex-col gap-3 bg-muted-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Route className="mt-0.5 size-5 shrink-0 text-brand-700" />
          <p className="text-sm leading-relaxed text-muted">
            ขั้นตอนติดตั้งอ้างอิงจากเว็บทางการของ{" "}
            <span className="font-semibold text-foreground">9Router</span> —
            เอกสารอาจมีอัปเดต แนะนำเช็กหน้า Get Started ให้ตรงเวอร์ชันล่าสุดก่อนติดตั้งเสมอ
          </p>
        </div>
        <a
          href="https://9router.com/#get-started"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary shrink-0 self-start whitespace-nowrap sm:self-auto"
        >
          <ExternalLink className="size-4" />
          เปิดเว็บทางการ 9router.com
        </a>
      </div>
    </div>
  );
}
