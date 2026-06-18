# คู่มือ Migration แบบ Zero-Downtime

> เป้าหมาย: อัปเดตสคีมา DB บน prod (Turso) **โดยไม่ทำให้เว็บล่ม** — อ่านก่อนทุกครั้งที่จะแก้ `db/schema.ts`

---

## 1. ความจริงของ pipeline (อ่านก่อน)

- build command: `tsx db/migrate.ts && next build`
- `db/migrate.ts` รัน migration **ตอน BUILD บน Vercel** (`VERCEL_ENV=production`) → ยิงใส่ **Turso ตัวจริง**
- จังหวะสำคัญ: migration ลง DB **ก่อน**โค้ดใหม่จะขึ้น และ **ระหว่างนั้นโค้ดเก่ายังเสิร์ฟ traffic อยู่**
  หลัง build ผ่าน Vercel ค่อยสลับโค้ดใหม่เข้า

```
[build เริ่ม] → migrate ลง Turso → next build → [deploy ใหม่ขึ้น]
                     ▲ โค้ดเก่ายังรันอยู่ตรงนี้ (schema ใหม่ + โค้ดเก่า ต้องอยู่ด้วยกันได้!)
```

👉 **สรุป:** schema ใหม่ต้องเข้ากันได้กับ "โค้ดเก่า" ชั่วคราว → ปลอดภัยเฉพาะการเปลี่ยนแบบ **additive**

---

## 2. Atomicity (ของแถมจาก SQLite/libSQL)

- migration ที่ค้างทั้งหมดถูกรวมเป็น **1 transaction** (`BEGIN … COMMIT`, ปิด FK ชั่วคราว)
- พังกลางคัน = **rollback ทั้งหมด** ไม่มี half-applied schema; build ก็ fail → deploy ไม่ถูก promote
- **แต่** ไม่มี "auto-rollback DB หลัง deploy" → ถ้า migration สำเร็จแต่โค้ดมีบั๊ก DB จะไม่ย้อนเอง
  → **ห้ามพึ่ง rollback DB** (ดูข้อ 8)

---

## 3. ⭐ กฎทอง

> **ต่อ 1 deploy ทำได้แค่การเปลี่ยนแบบ "เพิ่ม" (additive) ที่โค้ดเก่าทนได้เท่านั้น**
> destructive/breaking ต้องซอยเป็นหลาย deploy แบบ expand → migrate code → contract

มี **guard อัตโนมัติ** ใน `db/migrate.ts` คอยบล็อก migration อันตรายตอน build (ดูข้อ 5–6)

---

## 4. สูตรต่อชนิดการเปลี่ยน

| การเปลี่ยน | ปลอดภัย? | วิธีทำ |
|---|---|---|
| เพิ่มคอลัมน์ **nullable** | ✅ 1 deploy | `db:generate` → push |
| เพิ่มคอลัมน์ **มี DEFAULT** | ✅ 1 deploy | `db:generate` → push |
| สร้าง **ตารางใหม่** | ✅ 1 deploy | push |
| สร้าง **index (ไม่ unique)** | ✅ 1 deploy | push |
| เพิ่ม **NOT NULL** | ⚠️ 3 phase | A) add nullable+DEFAULT → B) backfill → C) บังคับ NOT NULL |
| **rename** คอลัมน์ | ⚠️ 3 phase | A) add คอลัมน์ใหม่ → B) โค้ด write ทั้งคู่ + backfill → C) drop เก่า |
| **drop** คอลัมน์ | ⚠️ 2 phase | A) deploy โค้ดที่เลิกใช้คอลัมน์ → B) ค่อย drop |
| เพิ่ม **UNIQUE** | ⚠️ 2 phase | A) dedupe ข้อมูลให้ไม่ซ้ำก่อน → B) ค่อย add unique index |
| เปลี่ยน **type** คอลัมน์ | ⚠️ multi | add คอลัมน์ใหม่ → backfill → สลับให้โค้ดใช้ตัวใหม่ → drop เก่า |

### ขยาย: เพิ่ม NOT NULL (3 phase)
1. **Deploy 1** — add คอลัมน์เป็น nullable + DEFAULT (additive ✅) แล้วให้โค้ดใหม่เขียนค่าลงไป
2. **Backfill** — รันสคริปต์เติมค่าให้แถวเก่า (ข้อ 6) จน `WHERE col IS NULL` = 0
3. **Deploy 2** — เปลี่ยนเป็น NOT NULL (ตอนนี้ไม่มี NULL แล้ว) → ตั้ง `ALLOW_DESTRUCTIVE_MIGRATION=1` deploy เดียว

### ขยาย: drop คอลัมน์ (2 phase)
1. **Deploy 1** — แก้โค้ดทุกที่ให้เลิกอ่าน/เขียนคอลัมน์นั้น (schema ยังไม่แตะ) → deploy ให้โค้ดเก่าหายไปก่อน
2. **Deploy 2** — `db:generate` ที่ drop คอลัมน์ → `ALLOW_DESTRUCTIVE_MIGRATION=1` → deploy
   (ตอนนี้ไม่มีโค้ดไหนแตะคอลัมน์แล้ว จึงปลอดภัย)

### ขยาย: rename คอลัมน์ (อย่า rename ตรง ๆ)
rename ตรง ๆ = โค้ดเก่าหาคอลัมน์เดิมไม่เจอทันที → ใช้ add-new + parallel-write แทน แล้วค่อย drop เก่าใน deploy หลัง

> ⚠️ **better-auth tables** (`user` / `session` / `account` / `verification`) อยู่ใน `db/schema.ts` ชุดเดียวกัน
> guard คุมให้ด้วย — `session`/`account` เป็นตาราง churn สูง **ห้าม drop/rename คอลัมน์รวดเดียว** เด็ดขาด

---

## 5. ทำ destructive change ให้ปลอดภัย

guard จะบล็อก (build fail ก่อนแตะ DB) เมื่อเจอ: DROP TABLE/COLUMN, RENAME, ADD NOT NULL ไม่มี DEFAULT,
CREATE UNIQUE INDEX, หรือ recreate-table pattern เมื่อ**ตั้งใจ**จะทำจริง:

- ตั้ง env บน Vercel: `ALLOW_DESTRUCTIVE_MIGRATION=1` (Production scope) → deploy → **เอาออกหลังเสร็จ**
- ควรทำตอน **low-traffic / maintenance window** และมั่นใจว่าทำตามสูตรข้อ 4 (phase ก่อนหน้าเรียบร้อย) แล้ว
- guard จะ **ข้ามอัตโนมัติ** บน DB ใหม่ (ยังไม่มีประวัติ migration) — bootstrap ครั้งแรกจึงไม่ติด

---

## 6. Pattern การ backfill (สคริปต์ one-off)

เขียนไฟล์ใน `db/` เลียนแบบ `db/baseline.ts` (สร้าง client เอง + โหลด env) ทำเป็น **idempotent + batched**:

```ts
// db/backfill-xxx.ts — รัน: ENV_FILE=.env.local.production npx tsx db/backfill-xxx.ts
const client = createClient({ url, authToken });
for (;;) {
  const r = await client.execute(
    "UPDATE <table> SET <col> = <default> WHERE <col> IS NULL LIMIT 500",
  );
  if (r.rowsAffected === 0) break; // ทำซ้ำได้ ปลอดภัย
}
```

---

## 7. Deploy checklist (ทุกครั้งที่แก้สคีมา)

- [ ] แก้ `db/schema.ts` → `npm run db:generate` (ได้ `drizzle/NNNN_*.sql`)
- [ ] `npm run db:check` ผ่าน (สแกน migration ใหม่สุด)
- [ ] การเปลี่ยนเป็น **additive** ไหม? ถ้าไม่ → ซอยตามตารางข้อ 4 (อยู่ phase ไหน? backfill แล้วยัง?)
- [ ] commit โฟลเดอร์ `drizzle/` ลง git (เป็น source of truth)
- [ ] (ถ้า destructive โดยตั้งใจ) ตั้ง `ALLOW_DESTRUCTIVE_MIGRATION=1` บน Vercel ชั่วคราว
- [ ] push → ดู Vercel build log: `[migrate] เริ่ม → guard ผ่าน → เสร็จสิ้น ✅` **ก่อน** `next build`

### สิ่งที่ควรเห็นใน build log
- `[migrate] guard ผ่าน — N migration ปลอดภัย` แล้วตามด้วย `[migrate] เสร็จสิ้น ✅` = ปกติ
- `[migrate] ❌ พบ migration ที่ไม่ปลอดภัย …` = guard บล็อก **ก่อนแตะ DB** (build fail โดยตั้งใจ)
- `[migrate] ข้าม — ไม่ใช่ production build` บน deploy ที่เป็น Production = `VERCEL_ENV` ไม่ใช่ `production` (ตรวจว่าเป็น Production deploy ไม่ใช่ Preview)

---

## 8. Rollback

- **โค้ด:** Vercel → "Promote previous" = ย้อนทันที
- **DB:** ไม่มี auto-rollback → นี่คือเหตุผลที่ต้อง **additive-first เสมอ**
  (โค้ดเก่าที่ถูก rollback กลับมา ต้องยังทำงานกับ schema ใหม่ได้ → ถ้าทำตามกฎทอง จะ rollback โค้ดได้ปลอดภัยเสมอ)
- ถ้าจำเป็นต้องย้อน schema จริง ๆ ต้องเขียน migration ชดเชย (compensating) ใหม่ — ช้าและเสี่ยง จึงเลี่ยงด้วย additive-first

---

## 9. Preview / staging deploy

- `VERCEL_ENV=preview` → `db/migrate.ts` จะ **ข้าม** (ไม่ migrate)
- ⚠️ อย่าตั้ง `DATABASE_URL` ของ Preview เป็น **DB prod ตัวเดียวกัน** — โค้ด PR ที่คาดสคีมาใหม่อาจพังของจริง
- แนะนำ: ชี้ Preview ไป **Turso branch แยก** (หรือ DB dev เฉพาะ) — ถ้าจะให้ preview migrate ด้วย
  ค่อยปรับ gate ให้รันเมื่อ `VERCEL_ENV==="preview"` **เฉพาะกับ URL ที่ไม่ใช่ prod**
- ถ้า `DATABASE_URL` ของ Preview ว่าง → `db/index.ts` fallback เป็น `file:./local.db` (ว่าง/ephemeral บน serverless) → preview พัง

---

## 10. คำสั่งที่เกี่ยวข้อง

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run db:generate` | สร้าง migration จาก `db/schema.ts` |
| `npm run db:check` | สแกน migration ใหม่สุดหา SQL อันตราย (offline, ก่อน commit) |
| `npm run db:check:all` | สแกนทุก migration |
| `npm run db:selftest` | จำลอง migration pipeline แบบ Vercel กับ DB ชั่วคราว (พิสูจน์ว่าใช้ได้) |
| `npm run db:migrate` | apply migration ลง DB local |
| `npm run db:migrate:prod` | apply migration ลง Turso เอง (ใช้ `.env.local.production`) |
| `npm run db:baseline:prod` | ปั๊ม Turso ที่มีตารางแล้วว่า migration apply แล้ว (ครั้งเดียว) |
