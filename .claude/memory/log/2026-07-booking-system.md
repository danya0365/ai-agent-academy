---
name: 2026-07-booking-system
description: ระบบจองคิว 1-on-1 แบบ Calendly (course type 'booking') — เวลาทำการ global + gen slot สด + กันจองซ้อน — built 2026-07-23 (ยังไม่ commit)
metadata:
  node_type: memory
  type: project
  originSessionId: f985471c-e9dd-4324-ab5e-10dd72b1b811
  modified: 2026-07-23T14:11:01.711Z
---

# ระบบจองคิว 1-on-1 (course type 'booking') — 2026-07-23

**ทำไม:** คอร์สแบบ `scheduled` (courseSessions รายวันตายตัว) ทำให้ต้องคอยเติม/ลบรอบตลอด
พี่อยากได้แบบ "ร้านค้าเปิด-ปิด" — ตั้งเวลาทำการครั้งเดียว ลูกค้าจองเองแบบ Calendly (1-on-1)

## โมเดล
- Admin ตั้ง **เวลาทำการ (global, ครูคนเดียว)** ครั้งเดียว → ระบบ **gen slot ว่างสด** ไม่เก็บ slot ใน DB
- **duration ตั้งต่อคอร์ส** (`courses.session_duration_min`) → หั่น slot ตามนั้น
- **1 slot = 1 คน จองแล้วหาย** · จองล่วงหน้า 14 วัน · ต้องจองก่อนอย่างน้อย 60 นาที (config ใน `lib/booking.ts`)

## Schema (migration `0003_dashing_mandrill`, additive ล้วน — ผ่าน guard)
- `courses.session_duration_min` (nullable) · `enrollments.booked_start_at/end_at` (nullable, คงไว้แม้ถูก reject)
- ตาราง `booking_hours` (global weekly: weekday/start_minute/end_minute)
- ตาราง `bookings` — **composite PK `(course_id, start_at)`** = atomic lock (แบบเดียวกับ [[2026-07-community-qa]] likes)

## จุดสำคัญ (ห้ามพลาด)
- **กันจองซ้อน 2 ชั้น**: (1) **overlap SELECT ใน transaction** (`overlapWhere`, global ไม่กรอง courseId) —
  กันเคส grid ขยับ/ข้ามคอร์ส/duration ต่าง ที่ composite PK จับไม่ได้ (2) composite PK = atomic ชั้นสุดท้าย
  → **overlap check จำเป็น** เพราะ PK จับได้แค่ start_at ตรงเป๊ะ · read-then-write race ปลอด (libsql snapshot → BUSY → fail closed)
- **busy-range เป็น GLOBAL** (`getBusyRanges` ไม่กรอง courseId) เพราะครูคนเดียว — เวลาที่ถูกจองของคอร์สไหนก็บล็อกทุกคอร์ส
- **TZ ล็อก Asia/Bangkok** (UTC+7 คงที่ ไม่มี DST → คำนวณ offset ตรงๆ ใน `lib/booking.ts`; formatBkk* ใน `lib/format.ts` timeZone Asia/Bangkok)
- **isValidSlot บังคับตรงนาทีเป๊ะ** (`offsetMs % MS_PER_MIN === 0`) — ห้ามใช้ Math.round (จะรับ epoch เพี้ยนวินาที → bypass PK)
- **lifecycle lock**: มี bookings row ตราบที่ enrollment ถือคิว (pending/slip_uploaded/confirmed)
  reject → releaseSlot (ปล่อย) · อัปสลิปใหม่หลัง reject → re-validate(isValidSlot) ก่อน saveSlip แล้ว claimSlot หลัง saveSlip

## ไฟล์
- logic: `lib/booking.ts` (gen/validate/config), `lib/booking-repo.ts` (claim/release/overlap)
- data: `lib/queries.ts` (getCourseBySlug booking branch, getBookingHours, getBusyRanges)
- actions: `actions/enrollments.ts` (bookSlot, uploadSlip), `actions/admin.ts` (parseCourseFields+duration, saveBookingHours), `lib/enrollment-confirm.ts` (booking lock check)
- UI: `components/booking-picker.tsx`, `components/booking-hours-manager.tsx`, `app/admin/booking-hours/`, course-form/course detail + display (my-courses/pay/admin enrollments)

## Verify
- 2 รอบ adversarial workflow (11 findings รอบแรก → แก้ HIGH×3 [overlap/alignment/global] + MEDIUM×2 [uploadSlip reorder/revalidate] → re-verify ยืนยันแก้ครบไม่มี double-booking/regression)
- tsc clean · next build ผ่าน · migration guard = ปลอดภัย (additive)

## ค้าง / ถัดไป
- **ยังไม่ commit** (ทำบน main — ควร branch ก่อน push)
- **ยังไม่เทส browser จริง** (จอง/reject/re-upload/confirm end-to-end)
- LOW ที่รับไว้ (ยังไม่แก้): dedup enrollment ไม่ atomic (เหมือน `enroll()` เดิม) · orphan slip-file กรณี claim แพ้หลัง saveSlip (storage ไม่มี delete API) · held-lock ข้าม re-validate (เจ้าของ lock จ่ายเลยเวลาได้)
- Admin ต้องทำหลัง deploy: ตั้งเวลาทำการ `/admin/booking-hours` + สร้างคอร์ส type "จองเวลาเอง" ใส่ duration

## Redesign หน้า course detail → landing page (2026-07-23)
- `app/courses/[slug]/page.tsx` rewrite เป็น landing มืออาชีพ: hero + meta chips + outcomes + details + curriculum + for-who/includes + instructor + FAQ (`<details>` zero-JS) + generateMetadata
- **แก้กล่องจอง booking เบียด**: booking → section เต็มกว้าง (time grid `md:grid-cols-6 lg:grid-cols-8`), scheduled/open → คง sticky rail 360px
- **เนื้อหาเสริมมาจาก `lib/course-content.ts`** (static map ต่อ slug แบบ tips) + generic fallback:
  - **อยากเติมข้อมูลคอร์สไหน → แก้ `COURSE_CONTENT[slug]`** (outcomes/curriculum/forWho/highlights/level) ไม่แตะ DB
  - includes/faq/instructor มี generic เสมอ → คอร์สที่ไม่มี key ก็ดูเต็ม · ตอนนี้เขียนจริงแค่ `ai-literacy`
- section components อยู่ `components/course/*` (server ล้วน) · reuse design system เดิม (token utility, ห้าม hex) · component ใหม่ไม่แตะ logic จอง

ดู [[project-overview]] · [[2026-07-community-qa]] (composite-PK pattern เดียวกัน)
