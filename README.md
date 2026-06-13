# AI Agent Academy — เว็บจัดการร้านสอน AI

เว็บสำหรับร้านสอน AI ที่ให้ลูกค้า **สมัครเรียน → ชำระเงินด้วยการโอน/พร้อมเพย์ + แนบสลิป → ดูประวัติการลงเรียน** และให้แอดมิน **ตรวจสลิป อนุมัติ/ปฏิเสธ และจัดการคอร์ส/รอบเรียน**

เฟส 1 เน้นใช้งานได้จริงเร็ว — ไม่มี payment gateway (แอดมินยืนยันสลิปเอง), ไม่มีอีเมลแจ้งเตือน

## เทคโนโลยี

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Drizzle ORM** + SQLite ผ่าน **libSQL/Turso** (dev ใช้ไฟล์ local ได้เลย)
- **Better Auth** (อีเมล/รหัสผ่าน) — มี role `customer` / `admin`
- เก็บสลิปบน local disk (โฟลเดอร์ `uploads/`) ผ่าน helper ที่เปลี่ยนเป็น S3 ได้ภายหลัง
- PromptPay QR สร้างอัตโนมัติตามยอดเงิน

## เริ่มใช้งาน (Local)

```bash
# 1. ติดตั้ง dependencies
npm install

# 2. สร้างไฟล์ env (คัดลอกจากตัวอย่างแล้วแก้ค่า)
cp .env.example .env.local
#    - สร้าง BETTER_AUTH_SECRET ด้วย: openssl rand -hex 32
#    - แก้ข้อมูลบัญชีธนาคาร / เบอร์พร้อมเพย์ (BANK_*, PROMPTPAY_ID)

# 3. สร้างตารางในฐานข้อมูล + ใส่ข้อมูลตัวอย่าง
npm run db:push
npm run db:seed

# 4. รัน
npm run dev
```

เปิด http://localhost:3000

**บัญชีแอดมิน** ตั้งค่าใน `.env.local` ที่ `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` (default `admin@example.com` / `admin1234`)
แนะนำให้ตั้งอีเมล/รหัสผ่านจริงก่อน seed

## หน้าหลัก

| หน้า | สิทธิ์ | คำอธิบาย |
|---|---|---|
| `/` | ทุกคน | แคตตาล็อกคอร์ส |
| `/courses/[slug]` | ทุกคน | รายละเอียดคอร์ส + เลือกรอบเรียน + สมัคร |
| `/register`, `/login` | ทุกคน | สมัครสมาชิก / เข้าสู่ระบบ |
| `/enrollments/[id]/pay` | เจ้าของ | ข้อมูลโอนเงิน + พร้อมเพย์ QR + อัปโหลดสลิป |
| `/my-courses` | ล็อกอิน | ประวัติการลงเรียน + สถานะ |
| `/admin` | แอดมิน | ภาพรวม (สลิปรอตรวจ / รายได้) |
| `/admin/enrollments` | แอดมิน | ตรวจสลิป อนุมัติ/ปฏิเสธ |
| `/admin/courses` | แอดมิน | จัดการคอร์ส + รอบเรียน |

## สถานะการลงทะเบียน

```
รอชำระเงิน (pending_payment)
   → อัปสลิป → รอตรวจสอบสลิป (slip_uploaded)
        → แอดมินอนุมัติ → ยืนยันแล้ว (confirmed)
        → แอดมินปฏิเสธ  → สลิปไม่ผ่าน (rejected) → อัปสลิปใหม่ได้
```

การจำกัดที่นั่งของรอบเรียนถูกบังคับตอนแอดมิน "อนุมัติ" (ใน transaction) — ถ้าที่นั่งเต็มจะอนุมัติไม่ได้

## คำสั่งที่มี

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รันเซิร์ฟเวอร์พัฒนา |
| `npm run build` / `npm start` | build / รัน production |
| `npm run db:push` | สร้าง/อัปเดตตารางจาก schema |
| `npm run db:studio` | เปิด Drizzle Studio ดูข้อมูล |
| `npm run db:seed` | seed ระดับ initial + starter (ปลอดภัยรันบน production) |

## Seed Data 3 ระดับ

แยกข้อมูลเริ่มต้นเป็น 3 ระดับ รันแยกหรือรวมก็ได้:

| คำสั่ง | ระดับ | เนื้อหา | รันบน production? |
|---|---|---|---|
| `npm run db:seed:initial` | **initial** | บัญชีแอดมิน (จาก env) | ✅ ได้ |
| `npm run db:seed:starter` | **starter** | คอร์สจริง 11 คอร์ส (พื้นฐาน 6 เปิด, ขั้นสูง 5 ปิดไว้ก่อน) + ลบคอร์สเดโมเก่าที่ไม่มีคนสมัคร | ✅ ได้ |
| `npm run db:seed:mock` | **mock** | ลูกค้าปลอม 8 คน + การสมัครครบทุกสถานะ + สลิป (ไว้ทดสอบหน้าแอดมิน) | ❌ dev เท่านั้น |
| `npm run db:seed` | initial + starter | สำหรับตั้งค่า production | ✅ ได้ |
| `npm run db:seed:all` | ทั้งหมด | สำหรับ dev | ❌ dev เท่านั้น |

- **initial / starter** เป็น *insert-if-absent* — รันซ้ำได้ ไม่ทับค่าที่แก้เองในหน้าแอดมิน (เช่น เปิด/ปิดคอร์ส)
- **mock** ลบของเดิมแล้วสร้างใหม่ทุกครั้ง — รันซ้ำได้สะอาด
- คอร์สที่ปิดไว้ (`ai-image-design`, `ai-data-analysis`, `ai-automation`, `build-ai-agent`, `ai-for-business`) ไปกดเปิดได้ที่ `/admin/courses` เมื่อพร้อมสอน

> **⚠️ mock กันลง production:** ถ้า `DATABASE_URL` ชี้ Turso (`libsql://...`) คำสั่ง mock จะถูกปฏิเสธอัตโนมัติ
> ตอน dev ให้ใช้ DB local: `DATABASE_URL=file:./local.db npm run db:seed:all`
> (ถ้าตั้งใจใส่ mock บน remote จริง ๆ ใช้ `ALLOW_MOCK_SEED=1`)

## ขึ้น Production กับ Turso

1. สร้างฐานข้อมูลบน Turso แล้วเอา URL + token มา:
   ```bash
   turso db create ai-academy
   turso db show ai-academy --url        # → DATABASE_URL (libsql://...)
   turso db tokens create ai-academy     # → DATABASE_AUTH_TOKEN
   ```
2. ตั้งค่า env บน production: `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (โดเมนจริง), `BANK_*`, `PROMPTPAY_ID`, `ADMIN_*`
3. รัน `npm run db:push` ครั้งแรกเพื่อสร้างตารางบน Turso แล้ว `npm run db:seed` (ใส่แอดมิน + คอร์สจริง — ปลอดภัย ไม่มี mock)

> **ข้อควรระวังเรื่องเก็บสลิป:** เฟส 1 เก็บไฟล์สลิปบน local disk (`uploads/`) ซึ่งใช้ได้กับโฮสต์ที่มีดิสก์ถาวร (VPS, Railway/Fly volume) **แต่ใช้กับ Vercel/serverless ไม่ได้** — ให้แก้เฉพาะภายใน `lib/storage.ts` (ฟังก์ชัน `saveSlip`/`readSlip`) ให้เก็บบน S3/Supabase Storage โดยส่วนอื่นของโค้ดไม่ต้องแก้

## โครงสร้างโค้ดสำคัญ

- `db/schema.ts` — ตาราง (auth + courses/sessions/enrollments)
- `db/seed.ts` — ข้อมูลเริ่มต้น
- `lib/auth.ts`, `lib/session.ts` — auth + `requireUser`/`requireAdmin`
- `lib/storage.ts` — เก็บสลิป (จุดที่ต้องแก้ตอนขึ้น serverless)
- `lib/queries.ts` — query รวม (นับที่นั่ง ฯลฯ)
- `actions/enrollments.ts` — สมัคร/อัปสลิป (ฝั่งลูกค้า)
- `actions/admin.ts` — อนุมัติ/ปฏิเสธ + CRUD คอร์ส/รอบ (มี seat check ใน transaction)
