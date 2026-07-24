---
name: project-overview
description: "ภาพรวม AI Agent Academy — แพลตฟอร์มเรียน AI ออนไลน์ (ไทย), stack, โครงสร้าง, โดเมนหลัก (อ่านเมื่อต้องเข้าใจบริบทโปรเจคหรืออธิบายภาพใหญ่)"
metadata:
  type: overview
  status: active
  scope: global
  updated: 2026-07-23
---

# AI Agent Academy

แพลตฟอร์ม **เรียนคอร์ส AI ออนไลน์ (ภาษาไทย)** — เข้าเว็บ → เลือกคอร์ส → สมัคร →
โอนเงิน/แนบสลิป → ระบบตรวจสลิป (auto หรือแอดมินตรวจ) → ยืนยันที่นั่ง

## Stack
- **Next.js 16** (canary) + **React 19** — App Router ที่ **root `app/`** (ไม่มี `src/`), Server Components เป็น default, หลายหน้าใช้ `export const dynamic = "force-dynamic"`
  - ⚠️ Next 16 มี breaking changes — **อ่าน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด Next** (เช่น `params` เป็น `Promise` ต้อง await, `next/script`, `metadata`)
- **Tailwind CSS v4** (CSS-first `@theme`, ไม่มี `tailwind.config.js`) — semantic token + component classes `.btn/.btn-primary/.btn-accent/.btn-secondary`, `.card/.card-flat/.lift`, `.badge`, `.input` (นิยาม @layer components ใน `public/styles/index.css`) · ธีมสลับ runtime ด้วย `[data-theme]` (bold/ocean/grape)
- **better-auth** — email/password + Google OAuth · server helpers `lib/session.ts` (`getSession/requireUser/requireAdmin`) · role `customer|admin`
- **Drizzle ORM + libSQL/Turso** (SQLite) — schema `db/schema.ts`, client `db/index.ts`, migrations `drizzle/` (additive-only guard, ดู MIGRATIONS.md) · dev = `file:./local.db`
- **State:** Zustand v5 (+ persist localStorage) · **Icons:** lucide-react · **Fonts:** Noto_Sans_Thai
- Payments: `promptpay-qr` + `qrcode` (`lib/promptpay.ts`) · slip verify (`lib/slip-verify.ts`) · LINE OA push (`lib/line.ts`) · storage S3/R2 (`lib/storage.ts`)

## โครงสร้าง
- `app/` = routes (คอร์ส `/`, `/courses/[slug]`, `/my-courses`, `/enrollments/[id]/pay`, `/login` `/register`, `/admin/*`, `/tips` `/tips/[slug]` `/shop`)
- `lib/` = โลจิก + data access (`queries.ts` = อ่าน DB, `import "server-only"`) · `actions/` = Server Actions (mutations)
- `components/` = UI (custom classes ไม่มี UI lib) · `db/` = schema/migrate/seed

## โดเมนหลัก
1. **คอร์ส + สมัครเรียน + ชำระเงิน/สลิป** (แกนเดิม) — courses, course_sessions, enrollments (state machine: pending_payment → slip_uploaded → confirmed/rejected)
2. **หารายได้ให้ dev** (ใหม่ 2026-07) — เมนู "ไขความลับ" (`/tips`) + ร้าน "ของที่แนะนำ" (`/shop`) → ดู [[ru-kon-krai-monetization]]

## Persona/สไตล์การทำงาน
- ผู้ช่วยมีตัวตนชื่อ **Neo** — ตอบในนาม Neo เสมอ (ดู [[neo-persona]])
- ผู้ใช้สื่อสารภาษาไทย · dev ตกงานวัย 40 กำลังหารายได้ค่าเทอมลูก → งานหลายอย่างมุ่งหารายได้
- ตอบตรง จริงใจ เตือนความเสี่ยงจริง (เช่น นโยบาย AdSense) แทนที่จะทำตามคำสั่งที่เป็นอันตรายต่อผู้ใช้
