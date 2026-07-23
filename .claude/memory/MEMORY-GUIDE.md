---
name: memory-guide
description: คู่มือ convention + lifecycle ของระบบ memory (อ่านก่อนเขียน/ย้าย/archive memory ทุกครั้ง) — ไฟล์นี้ไม่ถูกโหลดอัตโนมัติ
metadata:
  type: convention
  status: active
  scope: global
  updated: 2026-07-23
---

# AI Agent Academy Memory — คู่มือ & Lifecycle

ระบบนี้ทำงานทับกลไก auto-memory ของ Claude Code (ตั้งผ่าน `autoMemoryDirectory`
ใน `.claude/settings.json` ให้ชี้มาที่ `.claude/memory/` ในโปรเจค) เพื่อให้ memory
**พกพาได้** (commit เข้า git → clone แล้วใช้ต่อได้) และ **context ไม่บวม** แม้ไฟล์จะเยอะ

## หลักการ (ทำไมไม่บวม)
- **เฉพาะ `MEMORY.md` ที่โหลดทุก session** → คุมให้ **≤150 บรรทัด**
- Topic files **ไม่โหลดตอนเริ่ม** — เปิดอ่าน on-demand เมื่อ description ใน index ชี้ว่าเกี่ยว
- ไฟล์ที่ **ไม่อยู่ใน `MEMORY.md` = ไม่ recall อัตโนมัติ แต่เปิดอ่านได้** → กลไก "library"

## โครงสร้างโฟลเดอร์
| โฟลเดอร์ | เก็บอะไร |
|----------|----------|
| `core/` | ความรู้แกนถาวร: project-overview (บริบทโปรเจค), conventions, policy |
| `decisions/` | ADR — 1 ไฟล์ = 1 การตัดสินใจ ตั้งชื่อ `NNNN-title.md` (เลขรันต่อ) |
| `reference/` | ความรู้อ้างอิงเฉพาะเรื่อง (how-to, gotcha, integration) |
| `log/` | working log/progress ต่อฟีเจอร์ — ตั้งชื่อ `YYYY-MM-title.md` เก่าย้าย `_archive/` |
| `_archive/` | library/cold storage — **ไม่ลิสต์ใน MEMORY.md** มี `INDEX.md` เป็น catalog |

## Frontmatter มาตรฐาน (ทุก topic file)
```yaml
---
name: <slug-kebab-case>
description: <1 บรรทัด ช่วยตัดสินใจ recall — บอกว่า "อ่านเมื่อ...">
metadata:
  type: overview | decision | reference | log | convention
  status: active | archived
  scope: <ชื่อฟีเจอร์/โดเมน หรือ global>
  updated: YYYY-MM-DD
---
```
- เชื่อม memory ที่เกี่ยวกันใน body ด้วย `[[name]]`
- `description` สำคัญสุด — recall ไม่ใช่ semantic อัตโนมัติ เลือกเปิดจาก description ใน index
- ⚠️ เก็บ **สถานะ/ความคืบหน้าใน body เสมอ** ไม่ใช่ frontmatter (hook อาจ normalize frontmatter ทิ้ง field)

## Lifecycle

### เพิ่ม memory ใหม่
1. เขียน topic file ในโฟลเดอร์ที่ตรงประเภท พร้อม frontmatter ครบ
2. เพิ่ม pointer 1 บรรทัดใน `MEMORY.md` section ที่ตรง: `- [Title](path) — description สั้น`
3. ถ้าเป็นการตัดสินใจสำคัญ → สร้าง ADR ใน `decisions/` ด้วย

### คุมขนาด index
- ถ้า `MEMORY.md` ใกล้ ~150 บรรทัด → archive ของที่ไม่ active ออก หรือยุบ pointer ที่ซ้ำ

### Archive (ย้ายเข้า library)
1. `git mv` ไฟล์ → `_archive/`
2. แก้ frontmatter `status: archived`
3. ลบ pointer ออกจาก `MEMORY.md`
4. เพิ่ม 1 แถวใน `_archive/INDEX.md`: ชื่อไฟล์ · เหตุผล · วันที่

### Promote กลับ
1. `git mv` ไฟล์ออกจาก `_archive/` กลับโฟลเดอร์เดิม
2. แก้ frontmatter `status: active` + คืน pointer ใน `MEMORY.md` + ลบแถวใน `_archive/INDEX.md`

### เกณฑ์ตัดสิน archive
- ไม่ถูกอ้างอิง/แตะนานหลายเดือน **หรือ** ถูกแทนที่/ลบจริง
- ADR ที่ถูก supersede → ไม่ลบ แต่ archive + ชี้ ADR ใหม่ที่แทน

## ย้ายเครื่อง / เปลี่ยน path
`autoMemoryDirectory` ใน `.claude/settings.json` ต้องเป็น absolute หรือขึ้นต้น `~/` —
ถ้าย้ายตำแหน่งโปรเจค/เปลี่ยน username ให้แก้ค่านี้จุดเดียว (ต้อง trust settings ก่อนถึงมีผล)
