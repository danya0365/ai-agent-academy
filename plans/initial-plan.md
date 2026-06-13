# แผนสร้างเว็บ AI Agent Academy — เว็บจัดการร้านสอน AI (เฟส 1)

## Context

เจ้าของกำลังเปิดร้านสอนทุกอย่างเกี่ยวกับ AI (AI เบื้องต้น, AI ทำงาน, AI เขียนซอฟต์แวร์) ต้องการเว็บที่ลูกค้า **สมัครเรียน → จ่ายเงิน → ดูประวัติการลงเรียน** ได้ โดยเฟสแรกเน้น **เสร็จเร็ว ใช้งานได้จริง**

ข้อกำหนดที่ยืนยันแล้ว:

- ชำระเงินแบบ **โอนเงิน/พร้อมเพย์ + แนบสลิป** → แอดมิน (เจ้าของ) กดยืนยันเอง — ไม่ใช้ payment gateway
- คอร์สมี 2 แบบ: **มีรอบเรียน** (วัน-เวลา + จำกัดที่นั่ง) และ **สมัครได้ตลอด**
- ฐานข้อมูล **SQLite ผ่าน Turso** (dev ใช้ไฟล์ local ได้เลย ไม่ต้องมีบัญชี Turso ก่อน)
- UI ภาษาไทย, แอดมินคนเดียว

โฟลเดอร์ `/Users/marosdeeuma/ai-agent-academy` ว่างเปล่า (greenfield — มีแค่ `.agents/`)

## Tech Stack

| ส่วน         | เลือกใช้                                                                                                  | เหตุผล                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Framework    | Next.js 15 (App Router) + TypeScript + Tailwind                                                           | มาตรฐาน, scaffold เร็ว                                                       |
| DB           | Drizzle ORM + `@libsql/client`                                                                            | dev ใช้ `file:./local.db`, prod เปลี่ยน env ชี้ Turso                        |
| Auth         | **Better Auth** (email/password, Drizzle adapter)                                                         | ปลอดภัย เสร็จเร็ว มี CLI generate schema, รองรับ custom `role` field         |
| Mutations    | Server Actions ทั้งหมด                                                                                    | ลด boilerplate, รองรับ FormData upload                                       |
| เก็บสลิป     | local disk `./uploads` (ไม่ใช่ `public/`) ผ่าน helper `src/lib/storage.ts` เสิร์ฟผ่าน route ที่เช็คสิทธิ์ | สลิปเป็นข้อมูลส่วนตัว ห้าม public; helper ทำให้เปลี่ยนเป็น S3 ภายหลังได้ง่าย |
| PromptPay QR | `promptpay-qr` + `qrcode` สร้าง QR ตามยอดเงิน                                                             | ข้อมูลบัญชี/เบอร์พร้อมเพย์เก็บใน env                                         |
| ราคา         | integer บาท                                                                                               | เลี่ยงปัญหา float                                                            |

## Scaffold

```bash
mv .agents /tmp/.agents-backup   # create-next-app ต้องการ dir ว่าง
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --turbopack
mv /tmp/.agents-backup .agents
npm install drizzle-orm @libsql/client better-auth promptpay-qr qrcode
npm install -D drizzle-kit tsx @types/qrcode
```

- `.env.local`: `DATABASE_URL=file:./local.db`, `DATABASE_AUTH_TOKEN=`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `UPLOAD_DIR=./uploads`, `BANK_NAME/BANK_ACCOUNT_NUMBER/BANK_ACCOUNT_NAME/PROMPTPAY_ID` (+ `.env.example` ไว้ให้)
- scripts: `db:push` (drizzle-kit push), `db:seed` (tsx src/db/seed.ts), `db:studio`
- `next.config.ts`: `serverActions: { bodySizeLimit: '5mb' }` (รูปสลิปเกิน 1MB default)
- `.gitignore`: `local.db*`, `uploads/`, `.env.local`
- `<html lang="th">` + ฟอนต์ไทย (Noto Sans Thai ผ่าน next/font)

## Database Schema (`src/db/schema.ts`)

- **auth tables** (`user`, `session`, `account`, `verification`) — generate ด้วย Better Auth CLI; เพิ่ม field `user.role: 'customer' | 'admin'` (default customer)
- **courses**: id, slug (unique), title, description, type (`'scheduled' | 'open'`), price (int THB), coverImageUrl?, isPublished, createdAt
- **courseSessions** (รอบเรียน): id, courseId (FK cascade), startAt, endAt, capacity, location?, isOpen
- **enrollments**: id, userId, courseId, sessionId (**nullable** — null สำหรับคอร์ส open), status, amount (snapshot ราคาตอนสมัคร), slipPath?, slipUploadedAt?, reviewedAt?, rejectReason?, createdAt
  - index `(userId, courseId)` และ `(sessionId, status)`

### State machine ของ enrollment status

```
pending_payment ──ลูกค้าอัปสลิป──→ slip_uploaded
slip_uploaded ──แอดมิน approve (เช็คที่นั่งผ่าน)──→ confirmed  [จบ]
slip_uploaded ──แอดมิน reject + เหตุผล──→ rejected
rejected ──ลูกค้าอัปสลิปใหม่ (enrollment เดิม)──→ slip_uploaded
```

ทุก transition เช็ค status ปัจจุบันฝั่ง server ก่อนเขียน | label ไทย: รอชำระเงิน / รอตรวจสอบสลิป / ยืนยันแล้ว / สลิปไม่ผ่าน

## Route Map

### ฝั่งลูกค้า

| Route                   | สิทธิ์          | เนื้อหา                                                                                                                 |
| ----------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `/`                     | public          | Landing + แคตตาล็อกคอร์ส (badge "รอบเรียน"/"เรียนได้ทันที", ราคา)                                                       |
| `/courses/[slug]`       | public          | รายละเอียด + session picker (แสดงที่นั่งเหลือ, รอบเต็ม disable); ปุ่มสมัคร → ถ้ายังไม่ login redirect `/login?next=...` |
| `/register`, `/login`   | public          | Better Auth email/password                                                                                              |
| `/enrollments/[id]/pay` | เจ้าของเท่านั้น | ยอดเงิน + ข้อมูลบัญชี + PromptPay QR + ฟอร์มอัปสลิป (และอัปใหม่ตอน rejected)                                            |
| `/my-courses`           | login           | ประวัติการลงเรียน: คอร์ส, รอบ, ยอด, status badge, ลิงก์จ่าย/อัปสลิปใหม่                                                 |

### ฝั่งแอดมิน (`/admin/*` — role admin เท่านั้น)

| Route                          | เนื้อหา                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `/admin`                       | Dashboard: สลิปรอตรวจ (ตัวเลขหลัก), จำนวนสมัคร, รายได้ confirmed                      |
| `/admin/courses` (+ new/edit)  | CRUD คอร์ส + publish toggle                                                           |
| `/admin/courses/[id]/sessions` | CRUD รอบเรียน (เฉพาะคอร์ส scheduled)                                                  |
| `/admin/enrollments`           | รายการกรองตาม status (default รอตรวจสลิป), ดูรูปสลิป, ปุ่ม Approve / Reject (+เหตุผล) |

### การป้องกัน

- `middleware.ts` เช็ค cookie แบบ optimistic redirect ไป `/login`
- บังคับจริงใน server: `src/lib/session.ts` → `requireUser()` / `requireAdmin()` เรียกที่ต้นทุก protected page และ **ทุก server action**
- `app/api/auth/[...all]/route.ts` — Better Auth handler
- `app/api/slips/[filename]/route.ts` — เสิร์ฟไฟล์สลิป เฉพาะแอดมินหรือเจ้าของ enrollment; กัน path traversal ด้วย `path.basename`

## Server Actions (`src/actions/*.ts`)

- `enroll(courseId, sessionId?)` — เช็ค: คอร์ส published, session ตรงคอร์สและ isOpen, ไม่มี enrollment ที่ยัง active ซ้ำ (ทุก status ยกเว้น rejected), soft seat check (นับ pending+uploaded+confirmed < capacity) → สร้าง enrollment + redirect ไปหน้าจ่าย
- `uploadSlip(enrollmentId, formData)` — เช็คเจ้าของ, status ต้องเป็น pending_payment/rejected, validate รูป ≤5MB, ตั้งชื่อไฟล์ `randomUUID()`
- `approveEnrollment(id)` — **ใน `db.transaction`**: นับ confirmed ของ session นั้น ถ้า ≥ capacity โยน error "รอบนี้ที่นั่งเต็มแล้ว" มิฉะนั้น → confirmed (hard enforcement ของที่นั่งอยู่ตรงนี้)
- `rejectEnrollment(id, reason)`, course/session CRUD — admin only, `revalidatePath` หลัง mutate

## Seed (`src/db/seed.ts`)

- สร้างแอดมินผ่าน `auth.api.signUpEmail` (ให้ hash ถูกต้อง) แล้ว update role เป็น admin — พิมพ์ credentials ออกมา (`admin@example.com / admin1234`)
- คอร์สตัวอย่างไทย 3 คอร์ส: "พื้นฐานการใช้ AI" (scheduled ฿1,990, 2 รอบ), "AI สำหรับการทำงาน" (scheduled ฿2,990, 1 รอบ), "เขียนโปรแกรมด้วย AI" (open ฿3,990)
- Idempotent (ข้ามถ้า slug มีแล้ว)

## ลำดับการสร้าง (แต่ละ milestone รันได้)

1. **M1 — Scaffold + DB + แคตตาล็อก**: create-next-app, schema, auth config, seed, หน้า `/` + `/courses/[slug]` → เปิดดูคอร์สได้
2. **M2 — Auth + สมัคร + จ่ายเงิน**: register/login, enroll action, หน้าจ่าย + QR + อัปสลิป, `/my-courses` → ลูกค้าเดินทางครบถึง "รอตรวจสอบสลิป"
3. **M3 — แอดมิน**: ตรวจสลิป approve/reject (transaction เช็คที่นั่ง), course/session CRUD, dashboard → ครบ loop
4. **M4 — เก็บงาน**: ข้อความ error/empty state ไทย, mobile, README (วิธีรัน, วิธีชี้ Turso prod, ข้อจำกัดเก็บสลิปบน serverless), `.env.example`

## Verification (เดินทดสอบมือ)

1. `npm run db:push && npm run db:seed && npm run dev`
2. `/` เห็น 3 คอร์ส → เปิดคอร์ส scheduled เห็น 2 รอบพร้อมที่นั่งเหลือ
3. สมัครบัญชีลูกค้าใหม่ → enroll เลือกรอบ → หน้าจ่ายแสดงยอด + QR → `/my-courses` = "รอชำระเงิน"
4. อัปรูปสลิป → "รอตรวจสอบสลิป"; เช็คว่า URL สลิปเข้าไม่ได้ถ้าไม่ login
5. login แอดมิน → reject พร้อมเหตุผล → ลูกค้าเห็นเหตุผล + อัปใหม่ได้ → approve → "ยืนยันแล้ว" + ที่นั่งเหลือลดลง
6. ทดสอบรอบเต็ม: capacity 1 → approve คนที่สองต้องเจอ "รอบนี้ที่นั่งเต็มแล้ว", ปุ่มสมัครรอบเต็มถูก disable
7. คอร์ส open สมัครได้โดยไม่มี session picker
8. ลูกค้าเข้า `/admin` → โดน redirect; ไม่ login เข้า `/my-courses` → ไป `/login`

## หมายเหตุ/ความเสี่ยง

- ต้องย้าย `.agents/` ออกชั่วคราวตอน create-next-app
- สลิปบน local disk ใช้ไม่ได้บน Vercel/serverless — production ต้องใช้ host มี persistent disk หรือเปลี่ยน `storage.ts` เป็น S3/Supabase (แก้ไฟล์เดียว)
- เฟส 1 ตัดออก: อีเมลแจ้งเตือน, payment gateway, i18n framework (hardcode ไทย)
