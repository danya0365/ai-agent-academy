---
name: 2026-07-course-redesign
description: redesign คอร์ส, static data, schema reset, history page
metadata:
  type: log
---

# Course Redesign — 6 คอร์สใหม่, Static Data, History Page

**Commit:** `718f471`

## What Changed
- **6 คอร์สใหม่** — กว้าง ๆ ละ 24-30 stacks (project/skill hybrid)
  - build-web-with-ai, build-2d-game-with-ai, build-3d-game-with-ai
  - build-multiplayer-game-with-ai, build-saas-with-ai, build-mobile-app-with-ai
- **ย้าย course data จาก DB → static**: `lib/courses.ts` single source of truth
- **sessionDurationMin**: 120 (2 ชม.) — ถ้าต้องเปลี่ยน ให้เปลี่ยนที่ `lib/courses.ts` จุดเดียว
- **hardcode duration** ต้องใช้ `formatDuration()` ไม่ใช่เขียนข้อความตรง ๆ

## Schema
- **ลบ `courses` table** จาก `db/schema.ts`
- `enrollments.courseId` → `courseSlug` (text) + `courseTitle` (denormalized)
- `bookings.courseId` → `courseSlug` (text)
- Reset migrations → fresh `0000_unique_pete_wisdom.sql`

## ไฟล์ใหม่
- `lib/courses.ts` — static course catalog + types
- `app/my-courses/[slug]/page.tsx` — history + upcoming timeline
- `db/reset-turso.ts` — drop all → migrate → seed remote DB

## ไฟล์ที่ถูกลบ
- `lib/course-content.ts` (merged)
- `components/course-form.tsx`
- `components/publish-toggle.tsx`
- Migrations เก่า (0000-0004)

## Enrollment Model
1 enrollment = 1 session (2 ชม.) — จองรอบใหม่ = จ่ายใหม่
ลบ guard กันจองซ้ำคอร์สเดิมใน `bookSlot`

## Key Note
Turso reset ต้องใช้ `db/reset-turso.ts` → then `ENV_FILE=.env.local.production RUN_MIGRATE=1 npx tsx db/migrate.ts` → `db/seed/index.ts`
