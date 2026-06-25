/**
 * ตรวจ env ตอน server เริ่มทำงาน (เรียกจาก instrumentation.ts register())
 *
 * - **hard-fail** (throw → server ไม่ขึ้น) เฉพาะ deploy จริงบน Vercel production
 *   (`VERCEL_ENV === "production"`) สำหรับ config ที่ผิดแล้วพังแน่ ๆ / ข้อมูลหาย
 *   → fail fast ดีกว่าเงียบ ๆ แล้วข้อมูลหายหรือ auth พัง
 * - **warn** (log เฉย ๆ) สำหรับเรื่องที่ควรรู้แต่ไม่ถึงกับพัง
 *
 * local dev / `next start` ในเครื่อง (ไม่มี VERCEL_ENV) จะไม่ throw — ใช้ค่า dev ได้ปกติ
 */
type Issue = { level: "error" | "warn"; msg: string };

export function validateEnv(): void {
  const isVercelProd = process.env.VERCEL_ENV === "production";
  const isProdRuntime = process.env.NODE_ENV === "production";
  if (!isVercelProd && !isProdRuntime) return; // dev — ไม่ต้องตรวจ

  const dbUrl = process.env.DATABASE_URL ?? "";
  const authUrl = process.env.BETTER_AUTH_URL ?? "";
  const issues: Issue[] = [];

  // ── critical (เฉพาะ Vercel production) ──
  if (isVercelProd) {
    if (!dbUrl) {
      issues.push({ level: "error", msg: "ไม่ได้ตั้ง DATABASE_URL — prod ต้องชี้ Turso (libsql://…)" });
    } else if (dbUrl.startsWith("file:")) {
      issues.push({
        level: "error",
        msg: `DATABASE_URL ชี้ไฟล์ local (${dbUrl}) บน prod — ข้อมูลจะหายตอน redeploy ต้องใช้ Turso (libsql://…)`,
      });
    }
    if (dbUrl.startsWith("libsql://") && !process.env.DATABASE_AUTH_TOKEN) {
      issues.push({ level: "error", msg: "ใช้ Turso remote แต่ไม่ได้ตั้ง DATABASE_AUTH_TOKEN" });
    }
    if (!process.env.BETTER_AUTH_SECRET) {
      issues.push({
        level: "error",
        msg: "ไม่ได้ตั้ง BETTER_AUTH_SECRET — auth จะไม่ปลอดภัย (สร้างด้วย openssl rand -hex 32)",
      });
    }
    if (!authUrl || authUrl.includes("localhost")) {
      issues.push({
        level: "error",
        msg: `BETTER_AUTH_URL ต้องเป็นโดเมน https จริง (ตอนนี้: "${authUrl || "ไม่ได้ตั้ง"}") — ไม่งั้น cookie ไม่ secure + origin check พลาด`,
      });
    } else if (authUrl.startsWith("http://")) {
      issues.push({ level: "warn", msg: `BETTER_AUTH_URL เป็น http:// (${authUrl}) — ควรเป็น https บน prod` });
    }
  }

  // ── warnings (production runtime ใด ๆ) ──
  const r2Set = [
    process.env.R2_ACCOUNT_ID,
    process.env.R2_ACCESS_KEY_ID,
    process.env.R2_SECRET_ACCESS_KEY,
    process.env.R2_BUCKET,
  ].filter(Boolean).length;
  if (r2Set === 0) {
    issues.push({ level: "warn", msg: "ไม่ได้ตั้ง R2 — สลิปจะเขียนลง disk ของ serverless (หายตอน redeploy)" });
  } else if (r2Set < 4) {
    issues.push({ level: "warn", msg: "R2_* ตั้งไม่ครบ 4 ตัว — การเก็บสลิปอาจผิดพลาด" });
  }
  if ((process.env.ADMIN_PASSWORD ?? "admin1234") === "admin1234") {
    issues.push({ level: "warn", msg: "ADMIN_PASSWORD ยังเป็นค่า default 'admin1234' — เปลี่ยนก่อน seed prod" });
  }
  if ((process.env.SLIP_VERIFY_PROVIDER ?? "").toLowerCase().trim() === "mock") {
    issues.push({ level: "warn", msg: "SLIP_VERIFY_PROVIDER=mock บน prod — สลิปจะถูก auto-approve แบบปลอม" });
  }

  for (const w of issues.filter((i) => i.level === "warn")) console.warn(`[env] ⚠️  ${w.msg}`);

  const errors = issues.filter((i) => i.level === "error");
  if (errors.length > 0) {
    throw new Error(
      "[env] ❌ ตั้งค่า production ไม่ครบ/ผิด:\n" +
        errors.map((e) => `  • ${e.msg}`).join("\n"),
    );
  }
  if (isVercelProd) console.log("[env] ✅ ตรวจ env production ผ่าน");
}
