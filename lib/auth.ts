import { db, schema } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
      rateLimit: schema.rateLimit,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // เฟส 1 ไม่ส่งอีเมลยืนยัน
    requireEmailVerification: false,
    minPasswordLength: 8, // ↑ จาก default 8 (เทียบ easy-stamp ที่ 10)
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    },
  },
  // จำกัด origin สำหรับ CSRF/origin check ให้เหลือโดเมนจริง
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3000"],
  // rate limit กัน brute-force — เปิดบน production (default ของ better-auth ก็เปิดบน prod)
  // built-in special rules: /sign-in, /sign-up, /change-password = 3 ครั้ง/10 วิ;
  // request-password-reset/forget-password = 3 ครั้ง/60 วิ
  // storage "database" = ใช้ตาราง rate_limit ร่วมกันได้ข้าม serverless instance บน Vercel
  // (memory ใช้ร่วมกันไม่ได้) — ตาราง rateLimit อยู่ใน db/schema.ts
  rateLimit: {
    enabled: process.env.NODE_ENV === "production",
    storage: "database",
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false, // ห้ามผู้สมัครตั้ง role เอง
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;
