# AI Agent Academy — Memory Index

> Active index — โหลดทุก session **คุมให้ ≤150 บรรทัด**
> ดู [MEMORY-GUIDE.md](MEMORY-GUIDE.md) สำหรับ convention + lifecycle (เพิ่ม/archive/promote)

## Core
- [Neo Persona](core/neo-persona.md) — ตัวตนผู้ช่วย "Neo" (บุคลิก/ภาษา/สรรพนาม/บทบาท) — ตอบในนาม Neo เสมอ
- [Project Overview](core/project-overview.md) — AI Agent Academy คืออะไร, stack (Next 16/Tailwind v4/better-auth/Drizzle), โครงสร้าง, โดเมนหลัก

## Decisions (ADR)
_(ยังไม่มี — สร้างใน `decisions/NNNN-title.md` เมื่อมีการตัดสินใจสำคัญ)_

## Reference
- [Google OAuth review fixes](reference/google-oauth-review-fixes.md) — 3 จุดแก้ผ่าน OAuth review (brand name/purpose/domain)

## Log
- [ไขความลับ + Shopee monetization](log/2026-07-ru-kon-krai-monetization.md) — /tips + /shop + กล่องสนับสนุน · **ไม่ล็อกเนื้อหา** (AdSense ban risk) · ระบบ auto-fetch สินค้า Shopee จาก CSV feed (**commit `2dcb4eb`**) · ค้าง dev-side: ยืนยัน attribution (click report) + payment info
- [Community ถาม-ตอบ + Shopee](log/2026-07-community-qa.md) — คอมมูนิตี้ Q&A (Twitter/X-style) `/community` + accepted answer + ผูก tip + Shopee 3 จุด · likes ใช้ **composite PK** (guard-clean, deploy prod ไม่ต้องใช้ flag) · **commit `ebb9516`**
- [9Router token-survival tip](log/2026-07-9router-token-survival-tip.md) — tip `/tips/claude-code-token-survival` (เอาตัวรอดตอน Claude Code token หมด → route ผ่าน 9Router) · custom-component tip ตัวที่ 2 · **push แล้ว** (`f499967`,`3533d61`) · handoff: ปุ่ม Copy ยังไม่ทำ
- [ระบบจองคิว 1-on-1 (booking)](log/2026-07-booking-system.md) — course type `booking` แบบ Calendly · เวลาทำการ global + gen slot สด + duration ต่อคอร์ส · กันจองซ้อน 2 ชั้น (overlap-in-txn + composite PK) · TZ Asia/Bangkok · migration `0003` (additive) · + redesign หน้าคอร์สเป็น landing (`lib/course-content.ts` map) · **commit `ec0f2b5`** · ยังไม่เทส browser
