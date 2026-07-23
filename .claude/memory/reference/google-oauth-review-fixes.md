---
name: google-oauth-review-fixes
description: "3 จุดที่แก้เพื่อผ่าน Google OAuth review — brand name ใน H1, purpose text, domain verification (อ่านเมื่อแตะ OAuth / consent screen)"
metadata:
  type: reference
  status: active
  scope: auth
  updated: 2026-07-16
---

# Google OAuth review fixes (2026-07-16)

3 issues จาก Google review + วิธีแก้:

1. **App name mismatch** — OAuth consent screen ชื่อ "AI Agent Academy — สอนทุกอย่างเกี่ยวกับ AI" ไม่ตรงหน้าแรก (H1 เดิมมีแค่ "สอนทุกอย่างเกี่ยวกับ AI"). แก้: H1 ใน `app/page.tsx` เพิ่ม `<span>AI Agent Academy</span><br />สอนทุกอย่างเกี่ยวกับ AI`.

2. **Home page no purpose** — Google ดูไม่ออกว่าเว็บทำอะไร. แก้: subtitle นำด้วย "แพลตฟอร์มเรียน AI ออนไลน์", อัปเดต badge, เพิ่ม JSON-LD structured data ใน layout `<head>`.

3. **Domain not registered** — `ai-agent-academy.easy-ai.online` ยังไม่ verify ใน Google Search Console. แก้: เพิ่ม meta tag ใน layout head (ผู้ใช้ทำให้แล้ว).

**ยังต้องทำมือใน Google Cloud Console:**
- เปลี่ยนชื่อ OAuth consent screen เป็น "AI Agent Academy" เฉย ๆ
- verify domain ผ่าน DNS TXT record หรือ meta tag
