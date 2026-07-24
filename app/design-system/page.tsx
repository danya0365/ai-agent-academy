"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Share2,
  Heart,
  Zap,
  Waves,
  Grape,
  Sun,
  Moon,
  X,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/cn";

/* ─── ข้อมูล tokens (sync กับ themes/*.css) ─── */

type Token = { name: string; cssVar: string; light: string; dark: string };

const SEMANTIC_TOKENS: Token[] = [
  { name: "Background", cssVar: "--background", light: "#fffdf5", dark: "#0b1020" },
  { name: "Foreground", cssVar: "--foreground", light: "#15161c", dark: "#f8fafc" },
  { name: "Card", cssVar: "--card", light: "#ffffff", dark: "#141a2e" },
  { name: "Card Foreground", cssVar: "--card-foreground", light: "#15161c", dark: "#f8fafc" },
  { name: "Muted", cssVar: "--muted", light: "#6b7280", dark: "#94a3b8" },
  { name: "Muted Surface", cssVar: "--muted-surface", light: "#f4f1e9", dark: "#141a2e" },
  { name: "Border", cssVar: "--border", light: "#15161c", dark: "#2f3855" },
  { name: "Ring", cssVar: "--ring", light: "#818cf8", dark: "#818cf8" },
  { name: "On Brand", cssVar: "--on-brand", light: "#ffffff", dark: "#ffffff" },
];

const STATUS_COLORS: { name: string; cssVar: string; color: string; surface: string }[] = [
  { name: "Success", cssVar: "--success", color: "#15803d", surface: "#dcfce7" },
  { name: "Warning", cssVar: "--warning", color: "#b45309", surface: "#fef3c7" },
  { name: "Error", cssVar: "--error", color: "#b91c1c", surface: "#fee2e2" },
];

/* ─── page ─── */

export default function DesignSystemPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToken = async (val: string, id: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* ─── Hero ─── */}
      <div className="max-w-3xl">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          Design System
        </h1>
        <p className="mt-4 text-lg text-muted">
          ระบบออกแบบของ AI Agent Academy — neo-brutalist bold edutech
          ขอบ 2px หนา เงา offset hard สีเดียวกับขอบ ปุ่ม pill ชัดเจน
          ออกแบบให้สลับธีมและมืด/สว่างได้ทาง CSS variables
        </p>
      </div>

      {/* ─── Themer ─── */}
      <section className="mt-10 rounded-2xl border-2 border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-extrabold text-foreground">🎨 สลับธีม / โหมด</h2>
        <p className="mt-1 text-sm text-muted">
          ทุกตัวอย่างด้านล่างเปลี่ยนสีตามธีมที่เลือก
        </p>
        <div className="mt-4 flex items-center gap-4">
          <ThemeSwitcher />
        </div>
      </section>

      {/* ─── Themes ─── */}
      <section className="mt-10">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          ธีมทั้งหมด
        </h2>
        <p className="mt-2 text-sm text-muted">
          3 template พร้อม dark mode — เลือกจาก `[data-theme="…"]` + `.dark`
          class บน `<code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs">&lt;html&gt;</code>
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { id: "bold", label: "Bold (default)", icon: Zap, desc: "Indigo + Amber, ครีมขาว, เอกลักษณ์ neo-brutalist เต็ม", bg: "#fffdf5", fg: "#15161c", brand: "#4f46e5" },
            { id: "ocean", label: "Ocean", icon: Waves, desc: "Cyan + Emerald, ฟ้าเขียวเย็นสบาย", bg: "#f3fbfd", fg: "#0c1a1f", brand: "#0891b2" },
            { id: "grape", label: "Grape", icon: Grape, desc: "Violet + Fuchsia, ม่วงหรู", bg: "#faf6ff", fg: "#1b1530", brand: "#7c3aed" },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="rounded-xl border-2 border-border bg-card p-5"
              >
                <div className="flex items-center gap-2 font-extrabold text-foreground">
                  <Icon className="size-5" />
                  {t.label}
                </div>
                <p className="mt-1.5 text-sm text-muted">{t.desc}</p>
                <div className="mt-4 flex gap-2">
                  <span className="h-6 w-6 rounded-full border-2 border-border" style={{ background: t.brand }} />
                  <span className="h-6 w-6 rounded-full border-2 border-border" style={{ background: t.bg }} />
                  <span className="h-6 w-6 rounded-full border-2 border-border" style={{ background: t.fg }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Color Tokens ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Semantic Tokens
        </h2>
        <p className="mt-2 text-sm text-muted">
          ไม่ hardcode hex ใน component — ใช้ Tailwind utility
          (<code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs">bg-card</code>,
          <code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs">text-muted</code>,
          <code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs">border-border</code>)
          ค่าจริงอยู่ใน <code className="rounded bg-muted-surface px-1.5 py-0.5 text-xs">themes/*.css</code>
        </p>

        <div className="mt-5 overflow-x-auto rounded-2xl border-2 border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-muted-surface">
                <th className="px-4 py-3 font-bold text-foreground">Token</th>
                <th className="px-4 py-3 font-bold text-foreground">CSS Var</th>
                <th className="px-4 py-3 font-bold text-foreground">Light</th>
                <th className="px-4 py-3 font-bold text-foreground">Dark</th>
                <th className="px-4 py-3 font-bold text-foreground">Preview</th>
              </tr>
            </thead>
            <tbody>
              {SEMANTIC_TOKENS.map((t) => (
                <tr key={t.name} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-semibold text-foreground">{t.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{t.cssVar}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{t.light}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">{t.dark}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block h-5 w-10 rounded border-2 border-border" style={{ background: `var(${t.cssVar})` }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status colors */}
        <h3 className="mt-8 text-lg font-extrabold text-foreground">Status Colors</h3>
        <div className="mt-3 flex flex-wrap gap-3">
          {STATUS_COLORS.map((s) => (
            <div key={s.name} className="flex items-center gap-2 rounded-lg border-2 border-border px-3 py-2">
              <span className="h-4 w-4 rounded-full" style={{ background: s.color }} />
              <span className="text-sm font-bold text-foreground">{s.name}</span>
              <span className="text-xs text-muted">{s.color}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Brand Ramp ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Brand Ramp
        </h2>
        <p className="mt-2 text-sm text-muted">
          50→900 ใช้ใน UI ตามระดับความเด่น 500 = primary button
        </p>
        <div className="mt-4 flex flex-wrap gap-1">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((s) => (
            <div
              key={s}
              className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border text-[10px] font-bold"
              style={{ background: `var(--brand-${s})`, color: s >= 500 ? "var(--on-brand)" : "var(--foreground)" }}
              title={`brand-${s}`}
            >
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Typography ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Typography
        </h2>
        <p className="mt-2 text-sm text-muted">
          Noto Sans Thai variable — น้ำหนัก 400–900 ครอบคลุมทั้ง body และ heading
        </p>

        <div className="mt-5 space-y-4 rounded-2xl border-2 border-border bg-card p-5 sm:p-6">
          {[
            { label: "H1 — หน้า Hero", cls: "text-4xl font-black sm:text-5xl", text: "เรียนรู้ AI กับเรา" },
            { label: "H2 — Section", cls: "text-3xl font-black sm:text-4xl", text: "เคล็ดลับที่ dev ใช้จริง" },
            { label: "H3 — Card title", cls: "text-lg font-extrabold", text: "ใช้ Copilot เขียน React Components" },
            { label: "Body — อ่านง่าย", cls: "text-base text-muted", text: "รวมเคล็ดลับใช้ AI ทำงานให้เร็วขึ้น เขียน prompt ให้แม่น เครื่องมือฟรี และไอเดียหารายได้ — อ่านฟรีทั้งหมด" },
            { label: "Small / Muted", cls: "text-sm text-muted", text: "อ่าน 3 นาที · 1,234 ตัวอักษร" },
            { label: "Badge / Label", cls: "text-xs font-bold", text: "เคล็ดลับเด็ด" },
          ].map((s) => (
            <div key={s.label}>
              <span className="mb-1 inline-block text-[11px] font-semibold text-muted uppercase tracking-wide">
                {s.label}
              </span>
              <p className={s.cls}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Buttons ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Buttons
        </h2>
        <p className="mt-2 text-sm text-muted">
          Pill (rounded-full), 2px border, 3D shadow offset, hover lift, active press
        </p>

        {/* Variants */}
        <div className="mt-5 space-y-4 rounded-2xl border-2 border-border bg-card p-5 sm:p-6">
          <div>
            <p className="mb-2 text-xs font-bold text-muted">VARIANTS</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary">btn-primary</button>
              <button type="button" className="btn btn-secondary">btn-secondary</button>
              <button type="button" className="btn btn-accent">btn-accent</button>
              <button type="button" className="btn btn-ghost">btn-ghost</button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-muted">SIZES</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary btn-sm">btn-sm</button>
              <button type="button" className="btn btn-primary">default</button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-muted">STATES</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary">Normal</button>
              <button type="button" className="btn btn-primary hover">Hover</button>
              <button type="button" className="btn btn-primary active">Active</button>
              <button type="button" className="btn btn-primary" disabled>Disabled</button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-muted">WITH ICON</p>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className="btn btn-primary">
                <Heart className="size-4" />
                ให้กำลังใจ
              </button>
              <button type="button" className="btn btn-secondary btn-sm">
                <Share2 className="size-3.5" />
                แชร์
              </button>
              <button type="button" className="btn btn-secondary">
                <Copy className="size-4" />
                คัดลอก
              </button>
              <button type="button" className="btn btn-accent btn-sm">
                <Check className="size-3.5" />
                คัดลอกแล้ว
              </button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold text-muted">USAGE</p>
            <pre className="overflow-x-auto rounded-lg border-2 border-border bg-muted-surface p-3 text-xs leading-relaxed">
{`<button className="btn btn-primary">ปุ่มหลัก</button>
<button className="btn btn-secondary">ปุ่มรอง</button>
<button className="btn btn-sm btn-accent">เล็ก + accent</button>
<Link href="/login" className="btn btn-primary">เข้าสู่ระบบ</Link>`}</pre>
          </div>
        </div>
      </section>

      {/* ─── Cards ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Cards
        </h2>
        <p className="mt-2 text-sm text-muted">
          3 รูปแบบ — มี/ไม่มีเงา, hover lift
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div className="card p-5">
            <p className="font-extrabold text-foreground">.card</p>
            <p className="mt-1 text-sm text-muted">มี shadow offset 4px</p>
          </div>
          <div className="card-flat p-5">
            <p className="font-extrabold text-foreground">.card-flat</p>
            <p className="mt-1 text-sm text-muted">ไม่มี shadow</p>
          </div>
          <div className="card lift p-5">
            <p className="font-extrabold text-foreground">.card.lift</p>
            <p className="mt-1 text-sm text-muted">hover แล้วยก — ใช้กับการ์ดลิงก์</p>
          </div>
        </div>

        <pre className="mt-4 overflow-x-auto rounded-lg border-2 border-border bg-card p-4 text-xs leading-relaxed">
{`<!-- Lifted card -->
<div className="card lift group flex flex-col overflow-hidden p-0">
  <div className="flex flex-1 flex-col p-5">
    <h3 className="text-lg font-extrabold">Title</h3>
    <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">...</p>
  </div>
</div>`}
        </pre>
      </section>

      {/* ─── Badge ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Badge
        </h2>
        <p className="mt-2 text-sm text-muted">
          inline-flex pill บาง ติด .badge
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="badge bg-card text-foreground">
            <Zap className="size-3.5" /> เคล็ดลับเด็ด
          </span>
          <span className="badge bg-brand-500 text-on-brand">AI</span>
          <span className="badge bg-accent-500 text-foreground">ใหม่!</span>
          <span className="badge bg-muted-surface text-muted">ลูกค้า</span>
        </div>
        <pre className="mt-4 overflow-x-auto rounded-lg border-2 border-border bg-card p-4 text-xs leading-relaxed">
{`<span className="badge bg-card text-foreground">
  <Lightbulb className="size-3.5" /> เคล็ดลับ
</span>`}
        </pre>
      </section>

      {/* ─── Input ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Form Input
        </h2>
        <p className="mt-2 text-sm text-muted">
          ใช้ .input + .btn ประกอบกัน
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border-2 border-border bg-card p-5">
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs font-bold text-muted">อีเมล</label>
            <input type="email" placeholder="you@example.com" className="input" />
          </div>
          <button type="button" className="btn btn-primary shrink-0">สมัคร</button>
        </div>
      </section>

      {/* ─── Modal ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Modal
        </h2>
        <p className="mt-2 text-sm text-muted">
          React Portal → document.body, close ด้วย Escape / backdrop click / ปุ่ม X
        </p>
        <div className="mt-4">
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(true)}>
            เปิด Modal
          </button>
        </div>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal Title">
          <p className="text-sm text-foreground">
            เนื้อหาใน Modal — รองรับ scroll เมื่อเนื้อหายาว
          </p>
          <div className="mt-4 flex gap-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => setModalOpen(false)}>ยืนยัน</button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>ยกเลิก</button>
          </div>
        </Modal>
      </section>

      {/* ─── Theme Switcher ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Theme Switcher
        </h2>
        <p className="mt-2 text-sm text-muted">
          Zustand persist → localStorage, blocking inline script ก่อน first paint กัน FOUC
        </p>
        <div className="mt-4 flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-5">
          <ThemeSwitcher />
        </div>
      </section>

      {/* ─── Spacing ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Spacing & Layout
        </h2>
        <p className="mt-2 text-sm text-muted">
          Tailwind scale (0.25rem step), page max-w-[4-6]xl, card padding p-5
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Page container", cls: "mx-auto max-w-6xl px-4 sm:px-6 py-10", desc: "หน้าส่วนใหญ่ใช้ `max-w-6xl` + px-4/6" },
            { label: "Narrow content", cls: "mx-auto max-w-3xl", desc: "Tip detail, community" },
            { label: "Card grid", cls: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3", desc: "Tips, courses, products" },
            { label: "Section spacing", cls: "mt-12", desc: "ระหว่าง section ในหน้า" },
            { label: "Card padding", cls: "p-5", desc: "padding ใน card" },
            { label: "Stack gap", cls: "flex flex-col gap-3", desc: "flex stack" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border-2 border-border bg-card p-4">
              <p className="text-sm font-bold text-foreground">{s.label}</p>
              <code className="mt-1 inline-block rounded bg-muted-surface px-1.5 py-0.5 text-xs text-muted">{s.cls}</code>
              <p className="mt-1 text-xs text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Live Example ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Live Example: Tip Card
        </h2>
        <p className="mt-2 text-sm text-muted">
          ยกตัวอย่าง TipCard จริงที่ใช้ design system ทั้งหมด
        </p>
        <div className="mt-4 max-w-sm">
          <div className="card lift group flex flex-col overflow-hidden p-0">
            <div className="h-24 bg-brand-500" />
            <span className="badge absolute ml-3 mt-3 bg-card text-foreground">
              <Zap className="size-3.5" /> เคล็ดลับเด็ด
            </span>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-extrabold leading-snug text-foreground">
                ใช้ Copilot เขียน React Components ให้เร็วขึ้น
              </h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">
                วิธีใช้ GitHub Copilot เขียน React component, custom hooks,
                และ test ได้ในไม่กี่วินาที
              </p>
              <div className="mt-4 flex items-center justify-between border-t-2 border-border pt-3">
                <span className="inline-flex items-center gap-1 text-sm text-muted">
                  อ่าน 3 นาที
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 transition-all group-hover:gap-2">
                  อ่านต่อ →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CSS source ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          CSS Architecture
        </h2>
        <pre className="mt-4 overflow-x-auto rounded-2xl border-2 border-border bg-card p-4 text-xs leading-relaxed">
{`public/styles/
├── index.css          # @import tailwind + theme + layer base/components
├── theme.css          # Tailwind v4 @theme inline mapping (var() only)
└── themes/
    ├── bold.css       # Default — Indigo/Amber, cream/black
    ├── ocean.css      # Cyan/Emerald
    └── grape.css      # Violet/Fuchsia

ไฟล์ธีมให้ CSS variables ทั้งหมด
theme.css map var → Tailwind utility
component layer (.btn, .card, .badge, .input) ใช้ var() ล้วน
→ สลับธีมได้แค่เปลี่ยน [data-theme="…"]`}
        </pre>
      </section>

      {/* ─── Token Copy Area ─── */}
      <section className="mt-14">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Quick Reference
        </h2>
        <p className="mt-2 text-sm text-muted">
          คลิก CSS var เพื่อคัดลอก
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "bg-background", "text-foreground",
            "bg-card", "text-card-foreground",
            "text-muted", "bg-muted-surface",
            "border-border", "bg-brand-500", "text-on-brand",
            "bg-accent-500", "text-brand-700",
            "card", "card-flat", "btn btn-primary", "btn btn-secondary",
            "btn btn-accent", "btn btn-ghost", "btn-sm", "badge", "input",
          ].map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => copyToken(cls, cls)}
              className={cn(
                "rounded-lg border-2 border-border bg-card px-2.5 py-1 text-xs font-semibold transition",
                copied === cls
                  ? "border-brand-500 bg-brand-500 text-on-brand"
                  : "text-foreground hover:bg-muted-surface",
              )}
            >
              {copied === cls ? (
                <span className="inline-flex items-center gap-1"><Check className="size-3" /> คัดลอก!</span>
              ) : (
                `.${cls}`
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Footer ─── */}
      <div className="mt-14 border-t-2 border-border pt-6 text-center text-xs text-muted">
        AI Agent Academy Design System — Last updated July 2026
      </div>
    </div>
  );
}
