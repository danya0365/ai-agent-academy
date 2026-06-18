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

การจำกัดที่นั่งของรอบเรียนถูกบังคับตอน "อนุมัติ" (ใน transaction) ทั้งแบบแอดมินกดเองและ auto-approve — ถ้าที่นั่งเต็มจะอนุมัติไม่ได้

## ตรวจสลิปอัตโนมัติ + Auto-approve

เมื่อลูกค้าอัปสลิป ระบบจะ:
1. **ย่อรูปบน client** ก่อนอัปโหลด (กันกินเน็ต) — คงคุณภาพพอให้ QR อ่านออก
2. เรียก **ระบบตรวจสลิป** (ถ้าตั้งค่า provider ไว้) อ่านยอด/ผู้รับ/เลขอ้างอิงจากสลิป
3. **auto-approve** ถ้าผ่านครบ 3 เกณฑ์: ยอดตรงกับค่าคอร์ส + บัญชีผู้รับตรงกับร้าน (เทียบ 4 ตัวท้าย) + เลขอ้างอิงไม่ซ้ำ
4. ถ้าไม่ผ่าน/ยังไม่ตั้ง provider → คงสถานะ "รอตรวจสอบสลิป" ให้แอดมินตรวจมือ (เห็นเหตุผลในหน้าแอดมิน)
5. **แจ้งเตือน LINE OA** ทุกครั้งที่มีการแจ้งโอน

### เปิดใช้ตรวจสลิปจริง

ตรวจสลิปจริงต้องใช้ API ภายนอกที่อ่าน QR บนสลิปแล้วยืนยันกับธนาคาร (รูปอย่างเดียวปลอมได้) ตั้งใน env:

```
SLIP_VERIFY_PROVIDER=easyslip      # หรือ slipok
SLIP_VERIFY_API_KEY=<key>
```

- **EasySlip** (easyslip.com) — โครงพร้อมใช้แล้ว แค่ใส่ provider + key
- **SlipOK** (slipok.com) — มี adapter ว่างไว้ใน [lib/slip-verify.ts](lib/slip-verify.ts) เติมได้
- **ทดสอบโดยไม่มี key:** `SLIP_VERIFY_PROVIDER=mock` (+ `SLIP_VERIFY_MOCK_AMOUNT`) จะคืนผล verified ปลอม
- ไม่ตั้ง provider → ปิดระบบ auto-approve (ตรวจมือเหมือนเดิม)
- ผู้รับใช้ `PROMPTPAY_ID` / `BANK_ACCOUNT_NUMBER` เดิมเทียบ — เลขจาก provider อาจถูก mask จึงเทียบแค่ 4 ตัวท้าย

### แจ้งเตือน LINE OA

LINE Notify ปิดบริการแล้ว ระบบใช้ **Messaging API push**:

```
LINE_CHANNEL_ACCESS_TOKEN=<channel access token ของ LINE OA>
LINE_ADMIN_TARGET_ID=<userId หรือ groupId ปลายทาง>
```

- สร้าง LINE OA → ที่ [LINE Developers](https://developers.line.biz) สร้าง Messaging API channel → คัดลอก channel access token
- หา `target id`: เพิ่ม OA เป็นเพื่อนแล้วดู userId จาก webhook event หรือใช้ group id (ถ้าส่งเข้ากลุ่ม)
- ไม่ตั้งค่า → ระบบ log ข้อความที่จะส่งใน console เฉย ๆ (ไม่ขัดการทำงาน)

## คำสั่งที่มี

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รันเซิร์ฟเวอร์พัฒนา |
| `npm run build` / `npm start` | build (มี auto-migrate ตอน production) / รัน production |
| `npm run db:generate` | สร้างไฟล์ migration จาก schema (หลังแก้ `db/schema.ts`) |
| `npm run db:check` | สแกน migration ใหม่สุดหา SQL ที่ไม่ปลอดภัยต่อ zero-downtime (ก่อน commit) |
| `npm run db:selftest` | จำลอง migration pipeline แบบ Vercel กับ DB ชั่วคราว (พิสูจน์ว่าใช้ได้) |
| `npm run db:migrate` | apply migration ลง DB local (`.env.local`) |
| `npm run db:migrate:prod` | apply migration ลง Turso (ใช้ `.env.local.production`) |
| `npm run db:baseline:prod` | ปั๊ม Turso ที่มีตารางแล้วว่า migration apply แล้ว (ครั้งเดียว, ไม่แตะข้อมูล) |
| `npm run db:studio` | เปิด Drizzle Studio ดูข้อมูล |
| `npm run db:seed` | seed initial + starter (local) · `db:seed:prod` = ลง Turso |
| `npm run db:push` | (scratch เท่านั้น) ดัน schema ตรง ๆ — canonical คือ generate+migrate |

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

## แยก Local กับ Production

| | ฐานข้อมูล | เก็บสลิป | env มาจาก |
|---|---|---|---|
| **Local (dev)** | `file:./local.db` | local disk (`uploads/`) | `.env.local` |
| **Production (Vercel)** | Turso (`libsql://...`) | Cloudflare R2 | Vercel env vars |

- `.env.local` → dev (DB local, R2 เว้นว่าง = ใช้ disk)
- `.env.local.production` → เก็บ Turso creds + secret ไว้รันคำสั่ง prod จากเครื่อง (gitignored) เรียกผ่าน `ENV_FILE`
- คำสั่งที่ลงท้าย `:prod` ใช้ `.env.local.production` อัตโนมัติ (เช่น `db:migrate:prod`, `db:baseline:prod`, `db:seed:prod`)

## ระบบ Migration (Drizzle)

ใช้ migration files เป็น source of truth (commit โฟลเดอร์ `drizzle/` ลง git)

**แก้สคีมา:** แก้ `db/schema.ts` → `npm run db:generate` (ได้ไฟล์ `drizzle/NNNN_*.sql`) → `npm run db:check` → commit → `npm run db:migrate` (local)

**Auto-migrate บน Vercel:** build command คือ `tsx db/migrate.ts && next build` — `db/migrate.ts` จะรัน migration **เฉพาะตอน production deploy** (`VERCEL_ENV=production`); preview/local build จะข้าม (ไม่แตะ DB)

**ความปลอดภัย/Zero-downtime:** `db/migrate.ts` มี guard บล็อก migration อันตราย (DROP/RENAME/ADD NOT NULL/UNIQUE) ตอน build — destructive ที่ตั้งใจทำต้องตั้ง `ALLOW_DESTRUCTIVE_MIGRATION=1` 👉 อ่านวิธีอัปเดตแบบไม่ล่มใน **[MIGRATIONS.md](./MIGRATIONS.md)**

## ขึ้น Vercel (ครั้งแรก)

1. **ตั้ง env บน Vercel** (Production scope): `DATABASE_URL`, `DATABASE_AUTH_TOKEN` (Turso), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (โดเมนจริง), `BANK_*`, `PROMPTPAY_ID`, `ADMIN_*`, `R2_*` (ดูด้านล่าง), และถ้าใช้ `SLIP_VERIFY_*` / `LINE_*` / `NEXT_PUBLIC_LINE_OA_ADD_URL`
2. **Baseline Turso ครั้งเดียว** (เพราะ Turso มีตารางอยู่แล้วจากการ push ก่อนหน้า): เติม `.env.local.production` ให้ครบ แล้วรัน
   ```bash
   npm run db:baseline:prod   # ปั๊มว่า migration 0000 apply แล้ว โดยไม่ลบข้อมูล
   ```
3. `git push` → Vercel build จะรัน migrate อัตโนมัติ (เห็น 0000 apply แล้ว → ไม่ทำซ้ำ) แล้ว build ต่อ
4. การแก้สคีมาครั้งต่อ ๆ ไป: `db:generate` → commit → push → production deploy migrate ให้เอง

> ฐานข้อมูลใหม่ (เช่นถ้าสร้าง Turso ใหม่หมด) ไม่ต้อง baseline — แค่ deploy แล้ว migrate จะสร้างตารางจาก 0000 ให้เอง

## เก็บสลิปบน Cloudflare R2

สลิปเก็บผ่าน `lib/storage.ts` ซึ่งสลับอัตโนมัติ:
- **ตั้ง `R2_*` ครบ → ใช้ R2** (จำเป็นบน Vercel เพราะ serverless ไม่มีดิสก์ถาวร)
- **ไม่ตั้ง → fallback เก็บ local disk** (`uploads/`) สำหรับ dev

ตั้งค่า: สร้าง **bucket แบบ private** + R2 API token (Object Read & Write) ที่ Cloudflare แล้วใส่ใน Vercel:
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (และ `R2_ENDPOINT` ถ้าจะ override)

> สลิปเป็นข้อมูลส่วนตัว — bucket ต้อง **private** เสมอ เสิร์ฟผ่าน route `/api/slips` ที่เช็คสิทธิ์เท่านั้น ไม่มี public URL

## โครงสร้างโค้ดสำคัญ

- `db/schema.ts` — ตาราง (auth + courses/sessions/enrollments)
- `drizzle/` — ไฟล์ migration (commit ลง git)
- `db/migrate.ts` — รัน migration (gated: prod deploy หรือ `RUN_MIGRATE=1`)
- `db/baseline.ts` — ปั๊ม DB เดิมให้ adopt migrations โดยไม่ลบข้อมูล
- `db/seed/` — ข้อมูลเริ่มต้น 3 ระดับ (initial/starter/mock)
- `lib/storage.ts` — เก็บสลิป R2 (prod) / local disk (dev) — สลับด้วย env `R2_*`
- `lib/auth.ts`, `lib/session.ts` — auth + `requireUser`/`requireAdmin`
- `lib/storage.ts` — เก็บสลิป (จุดที่ต้องแก้ตอนขึ้น serverless)
- `lib/slip-verify.ts` — ตรวจสลิปอัตโนมัติ (provider-agnostic: easyslip/slipok/mock)
- `lib/line.ts` — แจ้งเตือน LINE OA (Messaging API push)
- `lib/enrollment-confirm.ts` — ยืนยันที่นั่ง (transaction) ใช้ร่วม admin/auto-approve
- `lib/queries.ts` — query รวม (นับที่นั่ง ฯลฯ)
- `actions/enrollments.ts` — สมัคร/อัปสลิป + ตรวจ + auto-approve + แจ้ง LINE
- `actions/admin.ts` — อนุมัติ/ปฏิเสธ + CRUD คอร์ส/รอบ
