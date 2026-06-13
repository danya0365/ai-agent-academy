import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { getSession } from "@/lib/session";
import { readSlip } from "@/lib/storage";

/**
 * เสิร์ฟไฟล์สลิป — เฉพาะแอดมิน หรือเจ้าของ enrollment ที่อ้างถึงสลิปนี้
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const session = await getSession();
  if (!session?.user) {
    return new NextResponse("ต้องเข้าสู่ระบบ", { status: 401 });
  }

  const { filename } = await params;
  const safe = path.basename(filename); // กัน path traversal

  // ต้องมี enrollment ที่ slipPath ตรงกับไฟล์นี้
  const enrollment = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.slipPath, safe))
    .get();

  if (!enrollment) {
    return new NextResponse("ไม่พบไฟล์", { status: 404 });
  }

  const isOwner = enrollment.userId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return new NextResponse("ไม่มีสิทธิ์เข้าถึง", { status: 403 });
  }

  try {
    const { buffer, contentType } = await readSlip(safe);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("ไม่พบไฟล์", { status: 404 });
  }
}
