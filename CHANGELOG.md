# Changelog

บันทึกการเปลี่ยนแปลงสำคัญทั้งหมดของโปรเจคนี้

รูปแบบอิงตาม [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
และใช้ [Semantic Versioning](https://semver.org/spec/v2.0.0.html)

> `1.0.0` = รุ่น production แรกที่พร้อมใช้งานจริง · ช่วงก่อนหน้าคือ `0.x` (ยังปรับ breaking ได้)
> ดูกฎการขยับเลขเวอร์ชั่นที่ [VERSIONING.md](./VERSIONING.md)

## [Unreleased]

### Added

### Changed

### Fixed

## [1.0.0] - 2026-06-25

รุ่น production แรก

### Added
- ระบบธีม semantic (Bold / Ocean / Grape) สลับ runtime ได้ + dark mode ทุกธีม + theme switcher บน navbar
- รองรับ responsive ทั้งแอป + เมนูมือถือ (hamburger)
- ชิปแสดงผู้ใช้ที่ล็อกอินอยู่บน navbar
- หน้า quick-login สำหรับ dev (แสดงเฉพาะ non-production)
- ระบบตรวจสลิปอัตโนมัติ (EasySlip) + auto-approve/reject พร้อมเหตุผล
- แจ้งเตือนผ่าน LINE เมื่อมีสลิปใหม่
- เก็บสลิปบน Cloudflare R2 (fallback เป็น local disk ตอน dev)
- แสดงเลขเวอร์ชั่น + commit sha ที่ footer (อิง `package.json` แหล่งเดียว)
- migration safety guard กัน schema change ที่ไม่ zero-downtime (บล็อกตอน build) + `db:check` / `db:selftest` + คู่มือ [MIGRATIONS.md](./MIGRATIONS.md)

### Changed
- หน้าแรกแสดงสถิติจริง (จำนวนผู้เรียน/คอร์สจาก DB) แทนตัวเลขตัวอย่าง

[Unreleased]: https://github.com/danya0365/ai-agent-academy/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/danya0365/ai-agent-academy/releases/tag/v1.0.0
