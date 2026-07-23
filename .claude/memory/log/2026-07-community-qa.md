---
name: 2026-07-community-qa
description: ระบบคอมมูนิตี้ถาม-ตอบ (Twitter/X-style) + Shopee affiliate 3 จุด — shipped 2026-07-23
metadata: 
  node_type: memory
  type: project
  originSessionId: f7358090-14a2-473e-9f86-7bd254279e10
  modified: 2026-07-23T10:09:01.282Z
---

# Community ถาม-ตอบ + Shopee affiliate (2026-07-23)

**ทำไม:** หน้า /tips ให้คนอ่านทำตาม แต่คนทำไม่ได้ไม่มีที่ถาม → สร้างคอมมูนิตี้ถาม-ตอบ
สไตล์ Twitter/X พร้อมแทรกสินค้า Shopee affiliate

## สิ่งที่ทำ
- **Schema** (`db/schema.ts`): `communityPosts` (self-ref, `parentId` null=คำถาม, `acceptedReplyId` set-null,
  denormalized `likeCount`/`replyCount`) + `communityPostLikes` (**composite PK `(userId, postId)`**)
- **Routes**: `/community` (feed + composer + sidebar), `/community/[id]` (thread + reply + accepted answer)
- **Actions** (`actions/community.ts`): createPost/createReply/toggleLike/acceptReply/deletePost/togglePin/loadMoreFeed
- **Queries** (`lib/queries.ts`): getCommunityFeedPage (keyset `(createdAt,id)`), getPostWithReplies, getQuestionsForTip
- **UI** (`components/community/*`): 12 ไฟล์ + `components/avatar.tsx` — neo-brutalist, semantic tokens
- **ผูก tip**: หน้า tip detail มี section "คำถามเกี่ยวกับ tip นี้" → `/community?tip=<slug>` (composer preselect)
- **Shopee 3 จุด** (subId): feed ทุก 5 โพสต์ `community-feed` · sidebar `community-sidebar` · ใต้ thread `community-<postId>`
- **Seed**: `db/seed/mock.ts` → 12 คำถาม + 8 คำตอบ (mock users, cascade cleanup ตอน reseed)

## จุดสำคัญ (ห้ามพลาด)
- **likes ใช้ composite PK ไม่ใช่ uniqueIndex** — จงใจ เพื่อให้ migration ไม่มี `CREATE UNIQUE INDEX`
  → ผ่าน guard, **deploy prod ได้เลยไม่ต้องตั้ง `ALLOW_DESTRUCTIVE_MIGRATION`** (migration `0002_adorable_stature`)
- `toggleLike` **จงใจไม่ revalidatePath** — กันทับ optimistic state (ทุกหน้า force-dynamic ตัวเลขสดตอน navigate)
- FK enforcement เปิดอยู่ (libsql `foreign_keys=1`) → cascade/set-null ทำงานจริง
- อ่านฟรีทุกคน โพสต์ต้อง login · ทุก ad ติดป้าย "ผู้สนับสนุน" (นโยบายไม่ล็อกเนื้อหา กัน AdSense ban)

## ค้าง / ถัดไป
- **commit + push แล้ว** (`ebb9516` บน main) · verify แล้ว: lint 0 error, tsc clean, ทุก route 200, keyset ไม่ overlap
- ยังไม่ได้เทส authenticated mutations ผ่าน browser จริง (post/reply/like/accept/delete/pin) — logic ตรวจแล้วแต่ต้องลองมือ
- future: report system, notification, follow/mention (ยังไม่ทำตาม MVP)

ดู [[2026-07-ru-kon-krai-monetization]] (Shopee auto-fetch) · [[project-overview]]
