"use server";

import { asc, eq, like, or } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

export type TestUser = {
  name: string;
  email: string;
  role: string;
  password: string;
};

/** เปิดเฉพาะตอนไม่ใช่ production — กัน backdoor quick-login หลุดขึ้น prod */
function devLoginEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

/**
 * รายชื่อบัญชีทดสอบสำหรับ quick-login บนหน้า login (เฉพาะ dev)
 *
 * - คืน [] ทันทีถ้าเป็น production (gate หลักอยู่ฝั่ง server)
 * - list เฉพาะบัญชี seed ที่รู้รหัสผ่านแน่ ๆ (admin + ลูกค้า mock.*) เพราะ quick-login
 *   ใช้ signIn ฝั่ง client ที่ต้องมีรหัสผ่าน — บัญชีที่ผู้ใช้สมัครเองจะไม่ถูก list
 */
export async function getTestUsers(): Promise<TestUser[]> {
  if (!devLoginEnabled()) return [];

  const rows = await db
    .select({ name: user.name, email: user.email, role: user.role })
    .from(user)
    .where(or(eq(user.role, "admin"), like(user.email, "mock.%")))
    .orderBy(asc(user.role), asc(user.name)) // admin ก่อน (a < c) แล้วเรียงตามชื่อ
    .all();

  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";
  return rows.map((u) => ({
    ...u,
    password: u.role === "admin" ? adminPassword : "mock1234",
  }));
}
