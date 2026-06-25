import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db";

// health check สำหรับ uptime monitoring — เช็คว่าแอป + DB ใช้งานได้
export const dynamic = "force-dynamic";

export async function GET() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0";
  try {
    await db.run(sql`SELECT 1`);
    return NextResponse.json({ ok: true, db: "up", version });
  } catch {
    return NextResponse.json({ ok: false, db: "down", version }, { status: 503 });
  }
}
