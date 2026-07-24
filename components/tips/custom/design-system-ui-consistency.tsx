import {
  Palette,
  Box,
  Layers,
  Sun,
  Moon,
  Code2,
  Sparkles,
  Paintbrush,
  Lightbulb,
  Info,
  CheckCircle2,
  ArrowRight,
  Brush,
  FileCode,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

// ── Design Tokens (ตัวอย่าง) ─────────────────────────────────────────────────
const SEMANTIC_TOKENS = [
  { name: "--background", light: "#fefce8", dark: "#1a1208", desc: "พื้นหลัง" },
  { name: "--foreground", light: "#1c1917", dark: "#fefce8", desc: "สีตัวอักษรหลัก" },
  { name: "--card", light: "#ffffff", dark: "#2b1d0c", desc: "พื้นหลังการ์ด" },
  { name: "--muted", light: "#78716c", dark: "#a8a29e", desc: "สีข้อความรอง" },
  { name: "--border", light: "#15161c", dark: "#78350f", desc: "สีขอบ 2px" },
  { name: "--brand-500", light: "#f97316", dark: "#f97316", desc: "สีแบรนด์หลัก (ปุ่ม)" },
];

// ── Component Classes ────────────────────────────────────────────────────────
type CompClass = {
  name: string;
  desc: string;
  snippet: string;
  icon: typeof Box;
};

const COMP_CLASSES: CompClass[] = [
  {
    name: ".card / .card-flat",
    desc: "Card มี shadow 4px (.card) หรือไม่มี (.card-flat)",
    snippet: `<div className="card p-5">\n  <h3>Title</h3>\n  <p className="text-muted">Detail</p>\n</div>`,
    icon: Box,
  },
  {
    name: ".btn / .btn-primary / .btn-secondary",
    desc: "ปุ่ม pill 3D shadow — มี 5 variants + sizes",
    snippet: `<button className="btn btn-primary">\n  ลงทะเบียน\n</button>`,
    icon: Paintbrush,
  },
  {
    name: ".badge",
    desc: "Pill เล็กๆ ติด tag/category",
    snippet: `<span className="badge bg-brand-500 text-on-brand">\n  เคล็ดลับเด็ด\n</span>`,
    icon: Brush,
  },
  {
    name: ".input",
    desc: "Form input 2px border + focus ring",
    snippet: `<input className="input" placeholder="you@example.com" />`,
    icon: FileCode,
  },
];

// ── Prompt Templates ──────────────────────────────────────────────────────────
const PROMPTS = [
  {
    icon: Code2,
    title: "Prompt บอก AI ครั้งแรก — แปะ Design Tokens ให้ AI รู้",
    code: `คุณกำลังทำงานในโปรเจคที่ใช้ Design System นี้:

**Design Tokens (CSS variables):**
- --background / --card / --border → พื้นหลัง
- --foreground / --muted → สีข้อความ
- --brand-500 / --accent-500 → สีแบรนด์
- --on-brand → สีตัวอักษรบนพื้น brand

**Component Classes (Tailwind):**
- \`card\` / \`card-flat\` / \`card lift\` → Card
- \`btn btn-primary\` / \`btn-secondary\` / \`btn-accent\` → ปุ่ม
- \`badge bg-*\` → Badge
- \`input\` → Form input
- \`text-muted\` → ข้อความรอง
- \`border-border\` → ขอบ

⚠️ ห้าม hardcode hex/size — ใช้ class ของ DS เท่านั้น`,
    note: "แปะไว้ใน System Prompt หรือ Project Instructions (CLAUDE.md) — AI จะจำและใช้ class ถูกตลอด",
  },
  {
    icon: FileCode,
    title: "Prompt สั่งงาน — ให้ AI เขียน Component ด้วย DS",
    code: `ใช้ Design System ของโปรเจคสร้าง Section "คอร์สแนะนำ" ประกอบด้วย:
- หัวข้อ H2
- Grid 3 คอลัมน์
- แต่ละ card มี: รูป, หัวข้อ, คำอธิบาย, ปุ่ม "ดูเพิ่มเติม"
- ใช้ \`card lift\` สำหรับ card
- ปุ่มใช้ \`btn btn-primary\`
- ข้อความรองใช้ \`text-muted\`

⚠️ ห้าม hardcode ค่าสี/ขนาด/ระยะ — ใช้ class ของ DS เท่านั้น`,
    note: "ใส่ท้าย prompt ทุกครั้งที่ให้ AI เขียน UI — AI จะเลือก class ให้เหมาะสมเอง",
  },
  {
    icon: Layers,
    title: "Prompt สำหรับ Claude Code / AI Agent — เพิ่มใน CLAUDE.md",
    code: `## Design System

โปรเจคนี้ใช้ Design System ผ่าน CSS Utility classes:
- สี: bg-brand-500, text-muted, border-border, bg-accent-500
- พื้นหลัง: bg-background, bg-card, bg-muted-surface
- ข้อความ: text-foreground, text-muted, text-on-brand, text-brand-700
- Component: card, card-flat, .card.lift, btn btn-primary, btn btn-secondary, badge, input
- ระยะ: p-5 (card padding), gap-3/4 (stack), mt-3/4 (section)

⚠️ IMPORTANT: ห้าม hardcode hex/size/radius — ใช้ class ของ DS เท่านั้น
ไฟล์ CSS อยู่ที่ public/styles/ — เปิดอ่านได้ถ้าต้องการ`,
    note: "ใส่ใน .claude/CLAUDE.md หรือ .cursorrules — Agent จะใช้ Design System อัตโนมัติทุกครั้ง",
  },
];
const BEFORE_CODE = `<div style={{
  background: "#fff",
  borderRadius: "16px",
  padding: "20px",
  border: "1px solid #ddd",
  boxShadow: "2px 2px 0 #ddd"
}}>
  <h3>สมัครคอร์ส</h3>
  <input style={{
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "8px",
    display: "block",
    width: "100%"
  }} />
  <button style={{
    background: "#f97316",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 20px",
    marginTop: "10px"
  }}>
    สมัคร
  </button>
</div>`;

const AFTER_CODE = `<div className="card p-5">
  <h3 className="text-lg font-extrabold text-foreground">
    สมัครคอร์ส
  </h3>
  <input
    className="input mt-3"
    placeholder="you@example.com"
  />
  <button className="btn btn-primary mt-3">
    สมัคร
  </button>
</div>`;

// ── Themes Data ──────────────────────────────────────────────────────────────
const THEMES = [
  {
    name: "Bold",
    icon: Sun,
    brand: "#f97316",
    bg: "#fefce8",
    desc: "ส้มสด neo-brutalist",
  },
  {
    name: "Ocean",
    icon: Sun,
    brand: "#0891b2",
    bg: "#f3fbfd",
    desc: "ฟ้าเขียวเย็นสบาย",
  },
  {
    name: "Grape",
    icon: Sun,
    brand: "#7c3aed",
    bg: "#faf6ff",
    desc: "ม่วงหรู",
  },
];

export function DesignSystemUiConsistency({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <Palette className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* ปัญหา → ทางออก */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sparkles className="size-5 text-brand-700" />
          Design System คือภาษากลางระหว่างคนกับ AI
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {/* ก่อนมี DS */}
          <div className="card-flat border-2 border-accent-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-accent-600">
              ❌ ก่อนมี Design System
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                AI ใช้สีมั่ว ขนาดเพี้ยนทุกครั้ง
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                ต้อง prompt "ใช้สี xxx padding yyy" ซ้ำทุกครั้ง
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                Theme ใหม่ = ไล่เปลี่ยนทุก component
              </li>
            </ul>
          </div>

          {/* หลังมี DS */}
          <div className="card-flat border-2 border-brand-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-brand-700">
              ✅ หลังมี Design System
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                AI ใช้ class ของ DS → UI match ทันที
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                แค่บอก "ใช้ btn-primary" — ไม่ต้องบอกสีซ้ำ
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                Theme ใหม่ = แค่เปลี่ยน CSS variables
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CSS Variables — Semantic Tokens */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Layers className="size-5 text-brand-700" />
          1. CSS Variables = หัวใจของ Design System
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          กำหนด semantic tokens ไว้ที่ CSS ไฟล์เดียว — ทั้งหมดใช้{" "}
          <code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs font-semibold">
            var(--ชื่อ)
          </code>{" "}
          AI แค่ใช้ utility class (<code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs font-semibold">
            bg-brand-500
          </code>
          ,{" "}
          <code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs font-semibold">
            text-muted
          </code>
          ) — ค่าสีเปลี่ยนที่ var ที่เดียวทั้งโปรเจคเปลี่ยนตาม
        </p>

        {/* Token Table */}
        <div className="mt-3 overflow-hidden rounded-xl border-2 border-border">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-border bg-muted-surface">
                <th className="px-3 py-2 font-bold text-foreground">Token</th>
                <th className="px-3 py-2 font-bold text-foreground">Light</th>
                <th className="px-3 py-2 font-bold text-foreground">Dark</th>
                <th className="px-3 py-2 font-bold text-foreground">ใช้ทำ</th>
              </tr>
            </thead>
            <tbody>
              {SEMANTIC_TOKENS.map((t, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-3 py-2 font-mono font-semibold text-foreground">
                    {t.name}
                  </td>
                  <td className="px-3 py-2 font-mono text-muted">
                    <span
                      className="mr-1.5 inline-block size-3 rounded border border-border align-middle"
                      style={{ background: t.light }}
                    />
                    {t.light}
                  </td>
                  <td className="px-3 py-2 font-mono text-muted">
                    <span
                      className="mr-1.5 inline-block size-3 rounded border border-border align-middle"
                      style={{ background: t.dark }}
                    />
                    {t.dark}
                  </td>
                  <td className="px-3 py-2 text-muted">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-card p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-brand-700" />
          <p className="text-xs leading-relaxed text-muted">
            เริ่มแค่{" "}
            <span className="font-semibold text-foreground">
              3 ตัวแปร
            </span>{" "}
            ก็พอ — <code className="rounded bg-muted-surface px-1 py-0.5 font-mono text-xs">--brand-500</code>,{" "}
            <code className="rounded bg-muted-surface px-1 py-0.5 font-mono text-xs">--background</code>,{" "}
            <code className="rounded bg-muted-surface px-1 py-0.5 font-mono text-xs">--foreground</code>{" "}
            ค่อยขยับไป 10+ ตัว + component classes
          </p>
        </div>
      </section>

      {/* Component Classes */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Box className="size-5 text-brand-700" />
          2. Component Classes — ให้ AI หยิบใช้สำเร็จรูป
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          component classes เหล่านี้ใช้ <code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs font-semibold">var()</code>{" "}
          ล้วน — AI ไม่ต้องคิด styling เลย แค่เลือก class ที่เหมาะสมกับ context
        </p>

        <div className="mt-3 flex flex-col gap-3">
          {COMP_CLASSES.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="card-flat flex flex-col gap-3 bg-muted-surface p-4 sm:flex-row sm:items-start">
                <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-start sm:gap-1 sm:pt-1">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-on-brand">
                    <Icon className="size-4" />
                  </span>
                  <code className="whitespace-nowrap text-xs font-bold text-foreground">
                    {c.name}
                  </code>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-relaxed text-muted">{c.desc}</p>
                  <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-card p-3 text-xs leading-relaxed">
                    <code>{c.snippet}</code>
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Theme System */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sun className="size-5 text-brand-700" />
          3. Theme System — สลับธีมได้ไม่ต้องแตะ Component
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          แต่ละธีมคือไฟล์ CSS ที่กำหนด <code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs font-semibold">[data-theme="..."]</code> selector —{" "}
          component ใช้ <code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs font-semibold">var()</code> ล้วน
          ธีมใหม่ = แค่เพิ่ม CSS ไฟล์ใหม่ ไม่ต้องแก้ JS เลย
        </p>

        {/* Theme cards */}
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {THEMES.map((t, i) => (
            <div
              key={i}
              className="rounded-xl border-2 border-border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="size-4 rounded-full border-2 border-border"
                  style={{ background: t.brand }}
                />
                <span className="text-sm font-bold text-foreground">
                  {t.name}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">{t.desc}</p>
              <div className="mt-3 flex gap-1.5">
                <span
                  className="h-5 flex-1 rounded border border-border"
                  style={{ background: t.bg }}
                />
                <span
                  className="h-5 flex-1 rounded border border-border"
                  style={{ background: t.brand }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Architecture diagram */}
        <div className="card-flat mt-3 flex flex-col gap-2 bg-muted-surface p-4">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            <Code2 className="size-4 text-brand-700" />
            ไฟล์ Architecture
          </h3>
          <pre className="overflow-x-auto rounded-lg border border-border bg-card p-3 text-xs leading-relaxed">{`public/styles/
├── index.css          # @import tailwind + theme + components
├── theme.css          # Tailwind @theme inline mapping (var() only)
└── themes/
    ├── bold.css       # :root + [data-theme="bold"]
    ├── ocean.css      # [data-theme="ocean"]
    └── grape.css      # [data-theme="grape"]

/* Theme ใหม่ = cp grape.css purple.css + แก้ค่า → แค่นั้น! */`}</pre>
          <div className="flex items-start gap-2 rounded-lg border border-border bg-card p-2">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-accent-500" />
            <p className="text-xs leading-relaxed text-muted">
              Zustand persist → localStorage ➜{" "}
              <code className="rounded bg-muted-surface px-1 py-0.5 font-mono text-xs">ThemeScript</code>{" "}
              inline blocking ก่อน first paint — ป้องกัน FOUC (flash of unstyled content)
            </p>
          </div>
        </div>
      </section>

      {/* Before/After Code Comparison */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Code2 className="size-5 text-brand-700" />
          4. Before / After — AI เขียน UI มี DS vs ไม่มี DS
        </h2>

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {/* Before */}
          <div className="flex flex-col rounded-xl border-2 border-accent-500/30">
            <div className="flex items-center justify-between rounded-t-xl bg-accent-500/10 px-4 py-2">
              <span className="text-xs font-bold text-accent-600">❌ ไม่มี Design System</span>
              <span className="text-[10px] text-muted">54 บรรทัด</span>
            </div>
            <pre className="overflow-x-auto rounded-b-xl bg-card p-4 text-xs leading-relaxed">
              <code>{BEFORE_CODE}</code>
            </pre>
          </div>

          {/* After */}
          <div className="flex flex-col rounded-xl border-2 border-brand-500/30">
            <div className="flex items-center justify-between rounded-t-xl bg-brand-500/10 px-4 py-2">
              <span className="text-xs font-bold text-brand-700">✅ มี Design System</span>
              <span className="text-[10px] text-muted">13 บรรทัด</span>
            </div>
            <pre className="overflow-x-auto rounded-b-xl bg-card p-4 text-xs leading-relaxed">
              <code>{AFTER_CODE}</code>
            </pre>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card p-3">
          <ArrowRight className="size-4 shrink-0 text-brand-700" />
          <p className="text-xs leading-relaxed text-muted">
            จาก{" "}
            <span className="font-bold text-accent-600">54 บรรทัด</span>{" "}
            เหลือ{" "}
            <span className="font-bold text-brand-700">13 บรรทัด</span>{" "}
            — AI ใช้ class ของ DS แล้ว อ่านง่ายขึ้น เข้าใจโครงสร้าง更快
            Theme เปลี่ยนก็ไม่ต้องแก้
          </p>
        </div>
      </section>

      {/* Prompt Templates */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Lightbulb className="size-5 text-brand-700" />
          5. Prompt ตัวอย่าง — คัดลอกไปใช้ได้เลย
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          คัดลอก prompt ด้านล่างไปวางใน System Prompt, CLAUDE.md หรือส่งให้ AI
          โดยตรง — AI จะใช้ Design System ของคุณถูกต้องทุกครั้ง
        </p>

        <div className="mt-4 flex flex-col gap-4">
          {PROMPTS.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="card overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border bg-brand-500/10 px-5 py-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-on-brand">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
                      <span className="flex size-5 items-center justify-center rounded bg-brand-700 text-[10px] font-bold text-on-brand">
                        {i + 1}
                      </span>
                      {p.title}
                    </h3>
                  </div>
                </div>

                {/* Code */}
                <pre className="overflow-x-auto bg-card p-4 text-xs leading-relaxed">
                  <code>{p.code}</code>
                </pre>

                {/* Note */}
                {p.note && (
                  <div className="flex items-start gap-2 border-t border-border bg-muted-surface px-5 py-3">
                    <Info className="mt-0.5 size-3.5 shrink-0 text-brand-700" />
                    <p className="text-xs leading-relaxed text-muted">
                      {p.note}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl border-2 border-accent-500 bg-muted-surface p-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-bold text-foreground">Pro tip: </span>
            ถ้าใช้ Claude Code ให้เพิ่ม prompts เหล่านี้ใน{" "}
            <code className="rounded bg-muted-surface px-1 py-0.5 font-mono text-xs">CLAUDE.md</code>{" "}
            หรือ <code className="rounded bg-muted-surface px-1 py-0.5 font-mono text-xs">AGENTS.md</code>{" "}
            — Agent จะจำ Design System ของคุณตลอดทุก session ไม่ต้องบอกซ้ำอีก!
          </p>
        </div>
      </section>

      {/* Key Takeaways */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Lightbulb className="size-5 text-brand-700" />
          Key Takeaways
        </h2>

        <ul className="mt-3 flex flex-col gap-2">
          {[
            {
              title: "CSS Variables = ภาษาเดียว",
              desc: "กำหนด --brand-500, --background, --border ไว้ที่เดียว AI ใช้ utility class ได้ทันที — เปลี่ยนค่าที่ var ทั้งโปรเจคเปลี่ยนตาม",
            },
            {
              title: "Component Classes = สำเร็จรูปให้ AI หยิบใช้",
              desc: ".btn .card .badge .input — AI ไม่ต้องคิด styling แค่เลือก class ที่เหมาะกับ context",
            },
            {
              title: "Theme = แค่เปลี่ยน CSS variables",
              desc: "ธีมใหม่ = ไฟล์ CSS ใหม่ component ไม่ต้องแก้ — สลับ data-theme attribute แค่นั้น",
            },
            {
              title: "เริ่มเล็กๆ ก่อน",
              desc: "แค่ 3 variables ก็เริ่มแล้ว — --brand-500, --background, --foreground ค่อยขยับไป 10+ ตัว + component classes",
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

      {/* สรุป */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">Design System = ภาษากลางระหว่างคนกับ AI</span>{" "}
          มี DS ที่ดี → AI generate UI ที่ match ดีไซน์ทันที ไม่ต้อง prompt ซ้ำ
          เปลี่ยนธีมได้ไม่ต้องแตะ component — เริ่มวันนี้แค่ 3 CSS variables ก็พอแล้ว! 🔥
        </p>
      </div>
    </div>
  );
}
