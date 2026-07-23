---
name: 9router-token-survival-tip
description: tip /tips/claude-code-token-survival — เอาตัวรอดตอน Claude Code token หมด ผ่าน 9Router (custom-component tip แบบ step-by-step) · อ่านเมื่อแตะ tip นี้ / custom-tip pattern / 9router / เพิ่มปุ่ม copy
metadata: 
  node_type: memory
  type: log
  status: active
  scope: tips-content
  updated: 2026-07-23
  originSessionId: 99fe31bb-b669-4f9c-acf9-7764c4ba9927
  modified: 2026-07-23T08:35:40.253Z
---

# Tip "เอาตัวรอดตอน Claude Code token หมด → 9Router" (2026-07-23)

เป้าหมาย dev: เพิ่ม trick ที่คนอยากได้มาก — คนใช้ **Claude Code ผ่าน VSCode extension**
พอ token/โควต้าหมด ให้ตั้งค่าไป route ผ่าน **9Router** แล้วสลับไปโมเดลอื่น (ฟรี) อัตโนมัติ โค้ดต่อได้ไม่สะดุด
สร้างแบบ **custom component** (เนื้อหาหลาย step) — เป็น tip ตัวที่ 2 ที่มี custom renderer (ตัวแรก `ai-speed-tips`)

## ไฟล์ (commit แล้ว push แล้ว)
- `lib/tips.ts` — เพิ่ม entry แรกของ TIPS: slug **`claude-code-token-survival`**, category "เครื่องมือ",
  `productTags: ["ทำงาน","ประสิทธิภาพ"]`, มี `sections` แค่ fallback บาง ๆ (เนื้อหาจริงอยู่ใน component)
- `components/tips/custom/claude-code-token-survival.tsx` — custom component (~400 บรรทัด, **server component**)
- `components/tips/registry.tsx` — ลงทะเบียน `"claude-code-token-survival": ClaudeCodeTokenSurvival`
- `public/tips/9router-usage.png` — screenshot หน้า Usage จริง (dev วางไฟล์เอง; `.DS_Store` ถูก gitignore)

## โครง component (pattern เอาไปใช้ซ้ำได้กับ tip อื่น)
ขับด้วย array `STEPS` — type `Step` มี field: `icon`, `title`, `desc`, `path` (breadcrumb dashboard),
`choices` (การ์ดตัวเลือก provider: tag/title/desc), `bullets` (checklist จุดกลม), `commands`
(`Command`: `file?` = โชว์เป็นไฟล์ไม่มี `$` + icon FileCode / ไม่งั้น shell prefix `$ ` ต่อบรรทัด),
`note` (กล่อง Info สีปกติ), `tip` (กล่อง accent-500 + Lightbulb = เกร็ด/ข้อควรระวัง), `image` (`{src,caption}`)
- มี array `TIERS` ทำ visual "auto-fallback 3 ชั้น"
- design token: `card`/`card-flat`/`bg-muted-surface`/`bg-brand-500|700`/`bg-accent-500`/`text-on-brand`/
  `text-foreground`/`text-muted`/`border-border`/`border-accent-500`/`badge`; icon จาก `lucide-react`
- external link: `btn btn-secondary` + `target="_blank" rel="noopener noreferrer"` (footer เครดิต → 9router.com/#get-started)
- `<img>` ใช้ตาม convention โปรเจค (`// eslint-disable-next-line @next/next/no-img-element` เหมือน product-card)

## เนื้อหา trick (flow ในหน้า)
ปัญหา token หมด → 9Router คืออะไร → visual 3-tier → **Step 1** ติดตั้ง (`npm install -g 9router` → `9router`,
dashboard `http://localhost:20128`, endpoint OpenAI-compat `…/v1`) → **Step 2** เชื่อม provider
(Dashboard → Providers → Connect) เรียง priority: **OpenCode Free** (แนะนำสุด, ไม่ต้อง login, ดู model ที่
`…/dashboard/providers/opencode`, ใช้ **`oc/deepseek-v4-flash-free`**) → **Kiro AI** (อันดับ 2, ต้อง login แต่ได้ Claude 4.5) →
Claude Code Pro/Max (subscription) → GLM (ตัวถูก) → **Step 3** ชี้ Claude Code (3 วิธี) → **Step 4** ทดสอบ → สรุป → เครดิต

**Step 3 — 3 วิธี (dev เลือก "เขียนทั้งหมด"):**
1. **VSCode extension (พระเอกของ trick)** — สร้าง `<project>/.claude/settings.local.json` มี `env` block:
   `ANTHROPIC_BASE_URL=http://localhost:20128/v1`, `ANTHROPIC_API_KEY`+`ANTHROPIC_AUTH_TOKEN` = 9router key,
   และ **แมป `ANTHROPIC_DEFAULT_{FABLE,OPUS,SONNET,HAIKU}_MODEL` → `oc/deepseek-v4-flash-free`** (บรรทัด `"//"` โชว์รุ่นสำรอง)
2. Claude Code CLI — `~/.claude/config.json` (`anthropic_api_base` + `anthropic_api_key`)
3. Claude Code CLI — env var (`ANTHROPIC_BASE_URL`/`AUTH_TOKEN`/`MODEL`)
   - **หมายเหตุใน step (callout accent):** provider ฟรีบางตัวไม่ต้อง login เอา model ใส่ได้เลย แต่มี **rate limit รายวัน** →
     ถ้าติดให้ตั้ง **Proxy Pools** (`…/dashboard/proxy-pools`) ให้ provider **OpenCode Free** ใช้ proxy pool ที่ตั้งไว้

**Step 4 — ทดสอบ:** เปิด session ใหม่ → พิมพ์ "สวัสดี" → ถ้าค้าง กด Reload Window → เปิด `…/dashboard/usage`
เห็น Recent Requests เป็น `deepseek-v4-flash-…` + Total Requests เพิ่ม = ต่อสำเร็จ (screenshot ประกอบ)

## แหล่งข้อมูลทางการ 9Router (ยืนยันแล้ว — ไม่เดา)
- repo: **github.com/decolua/9router** (README อยู่ branch **master**), docs.9router.com, เว็บ 9router.com
  ⚠️ เว็บ/docs เป็น SPA → **WebFetch โดน 403** ให้ใช้ `curl -A "<browser UA>"` แทน; README ดึง raw ได้ปกติ
- ค่า config วิธี VSCode (`settings.local.json`) มาจาก dev โดยตรง (dev ทดสอบใช้จริงแล้ว เห็น request วิ่งใน dashboard)
- วิธี CLI config.json มาจาก README ทางการ; footer เครดิตเตือนคนอ่านให้เช็คเวอร์ชันล่าสุดเอง

## สถานะ (จบ session 2026-07-23)
- **เสร็จ + live + push แล้ว** — commit `f499967` (ตัว tip) + `3533d61` (Step 2 = OpenCode Free เป็นตัวแนะนำสุด)
  ผ่าน ESLint 0 · tsc --noEmit 0 · dev server `localhost:3100` render 200 ทุก step
- (session เดียวกันยัง commit `2dcb4eb` = ปิด handoff Shopee auto-fetch ที่ค้างจาก session ก่อน — ดู [[ru-kon-krai-monetization]])

## ▶️ ต่อ session หน้า (handoff)
- **งานที่เสนอไว้แต่ dev ยังไม่สั่งทำ:** เพิ่ม **ปุ่ม Copy** ทุก code block — ต้องแยก CodeBlock เป็น
  client component (`"use client"`) เพราะตอนนี้ทั้งไฟล์เป็น server component (ใช้ `<img>`/ไม่มี handler)
  → ทำเป็น client CodeBlock ย่อยแล้ว import เข้ามา, ตัว custom component หลักคง server ได้
- ต่อยอดได้: ใส่ screenshot ให้ step อื่น, ทำ trick ตัวถัดไป (pattern `Step`/`CodeBlock` พร้อมใช้ซ้ำ),
  หรือทำปุ่ม copy เป็น util กลางให้ tip ทุกตัวใช้
- ข้อควรระวังความแม่นยำ: วิธี CLI `~/.claude/config.json` ยึดจาก README ทางการ — ถ้าจะเน้นความชัวร์
  ควรลองจริงว่า Claude Code เวอร์ชันปัจจุบันอ่าน key นี้ไหม (วิธี VSCode + env var ยืนยันแล้วว่าเวิร์ก)

ดู [[project-overview]] สำหรับบริบทโปรเจครวม · [[ru-kon-krai-monetization]] สำหรับระบบ /tips + monetization
