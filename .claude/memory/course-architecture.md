---
name: course-architecture
description: สถาปัตยกรรมคอร์ส — static data, schema, history page
metadata:
  type: project
---

# Course Architecture

## Core Decision
**Course data เป็น static (no DB)** — `lib/courses.ts` เป็น single source of truth
ถ้าจะอัปเดตคอร์ส: deploy ใหม่ (ไม่ต้อง migration)

## Schema
- `enrollments.courseSlug` (text) + `courseTitle` (denormalized) — no FK
- `bookings.courseSlug` (text) — no FK
- ไม่มี `courses` table ใน DB

## 6 Courses
1. `build-web-with-ai` — 30 stacks, 1290 บาท
2. `build-2d-game-with-ai` — 25 stacks, 990 บาท
3. `build-3d-game-with-ai` — 25 stacks, 1490 บาท
4. `build-multiplayer-game-with-ai` — 22 stacks, 1490 บาท
5. `build-saas-with-ai` — 28 stacks, 1490 บาท
6. `build-mobile-app-with-ai` — 24 stacks, 990 บาท

## Enrollment Model
- 1 enrollment = 1 session (2 ชม.)
- จองรอบใหม่ = จ่ายใหม่ทุกครั้ง
- `formatDuration(course.sessionDurationMin)` แทน hardcode
- ราคาไม่ผูกกับ sessionDurationMin

## Key Files
| File | Role |
|------|------|
| `lib/courses.ts` | static courses + types |
| `lib/queries.ts` | course lookup via static |
| `db/schema.ts` | no courses table |
| `app/my-courses/[slug]/page.tsx` | history + upcoming timeline |
| `db/seed/mock.ts` | multi-enrollment mock |
| `db/reset-turso.ts` | drop all + migrate + seed |
