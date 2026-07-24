"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { requireUser } from "@/lib/session";

export async function saveNote(
  enrollmentId: string,
  note: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await requireUser();

  try {
    await db
      .update(enrollments)
      .set({ note })
      .where(and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, user.id)))
      .run();
    revalidatePath("/my-courses");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }
}
