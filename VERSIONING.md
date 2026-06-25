# Versioning & Release

ระบบเวอร์ชั่นแบบ **feature-based SemVer** (`MAJOR.MINOR.PATCH`) — **เลขมีแหล่งเดียว**
คือ field `version` ใน [package.json](./package.json) ไหลเข้า footer อัตโนมัติพร้อม commit sha
จึง **ไม่ต้องแก้เลขเวอร์ชั่นที่ไฟล์อื่นเลย**

## เลขเวอร์ชั่นแสดงตรงไหน

- footer ทุกหน้า: `AI Agent Academy vX.Y.Z (sha)` — มาจาก `NEXT_PUBLIC_APP_VERSION` + `NEXT_PUBLIC_COMMIT_SHA`
  ที่ฝังตอน build ใน [next.config.ts](./next.config.ts) (อ่านผ่าน [lib/version.ts](./lib/version.ts))
- ต้อง build ด้วย `npm run build` (ไม่ใช่ `next build` ตรง ๆ) เพื่อให้ `npm_package_version` ถูกตั้ง
- บน Vercel: `npm run build` + `VERCEL_GIT_COMMIT_SHA` ทำงานให้อัตโนมัติ

## เกณฑ์ขยับเลข (ขยับตอน "ออกรุ่น" ไม่ใช่ทุก commit)

| หลัก | ขยับเมื่อ | ตัวอย่าง |
|------|----------|---------|
| **PATCH** `1.0.x` | แก้บั๊ก, security, ปรับ UX/ถ้อยคำ/สไตล์, performance — **ไม่มีฟีเจอร์ใหม่** | แก้ปุ่มกดไม่ติด, แก้คำผิด, ปรับสี |
| **MINOR** `1.x.0` | ฟีเจอร์ใหม่ที่ผู้ใช้สังเกตได้ (backward-compatible) → reset patch=0 | เพิ่มหน้าใหม่, ระบบแจ้งเตือน |
| **MAJOR** `x.0.0` | เปลี่ยนใหญ่กระทบ workflow/โมเดลธุรกิจ หรือ redesign ใหญ่ / breaking | รื้อระบบราคาใหม่, รื้อ UI ใหม่หมด |

**ตัดสินเร็ว ๆ:** มีของใหม่ให้ผู้ใช้ใช้ไหม → MINOR · แค่ทำให้ของเดิมดีขึ้น/หายพัง → PATCH ·
ผู้ใช้ต้องปรับตัว/เรียนรู้ใหม่ → MAJOR

> ตอนนี้อยู่ `0.x` (ก่อน production แรก) — รุ่น prod แรกที่พร้อมจริงให้ออกเป็น `1.0.0`

## ขั้นตอนออกรุ่น

```bash
# 1) commit งานฟีเจอร์ให้ครบ — working tree ต้องสะอาด
# 2) ย้ายรายการใน CHANGELOG.md จาก [Unreleased] → หัวข้อเวอร์ชั่นใหม่ + วันที่ + อัปเดต link ref
# 3) เลือกระดับตามเกณฑ์ แล้วรันคำสั่งเดียว (bump + commit + tag ให้เอง):
npm run release:patch    # 0.1.0 -> 0.1.1
npm run release:minor    # 0.1.1 -> 0.2.0
npm run release:major    # 0.2.0 -> 1.0.0   (ออก production แรก)

# 4) push พร้อม tag → Vercel build ฝังเลขใหม่ลง footer ให้เอง
git push --follow-tags
```

`npm version <level>` จะทำในคำสั่งเดียว: bump `package.json` (+ lock) → รัน hook `version`
(`git add CHANGELOG.md` ดึง changelog เข้า commit เดียวกัน) → สร้าง commit `chore(release): vX.Y.Z` → สร้าง tag `vX.Y.Z`

## ไม่ต้องทำ

- ไม่ต้องแก้เลขเวอร์ชั่นในโค้ด/footer เอง (มาจาก `package.json` ที่เดียว)
- ไม่ต้อง bump ทุก commit — รวมเป็นรุ่นแล้วค่อย bump; build ย่อยระบุด้วย commit sha ที่ footer
- ไม่ต้องเขียน commit/tag ของ release เอง — `npm version` ทำให้
