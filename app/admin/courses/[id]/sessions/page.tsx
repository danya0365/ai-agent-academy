import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, courseSessions } from "@/db/schema";
import { getReservedSeatsBySession } from "@/lib/queries";
import { SessionManager, type SessionRow } from "@/components/session-manager";

export const dynamic = "force-dynamic";

/** แปลง Date → "YYYY-MM-DDTHH:mm" ตามเวลาท้องถิ่นของเซิร์ฟเวอร์ */
function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default async function SessionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await db.select().from(courses).where(eq(courses.id, id)).get();
  if (!course) notFound();

  const sessions = await db
    .select()
    .from(courseSessions)
    .where(eq(courseSessions.courseId, id))
    .orderBy(courseSessions.startAt)
    .all();

  const reserved = await getReservedSeatsBySession(sessions.map((s) => s.id));

  const rows: SessionRow[] = sessions.map((s) => ({
    id: s.id,
    startAt: s.startAt.getTime(),
    startAtLocal: toLocalInput(s.startAt),
    endAtLocal: toLocalInput(s.endAt),
    capacity: s.capacity,
    location: s.location,
    isOpen: s.isOpen,
    reserved: reserved.get(s.id) ?? 0,
  }));

  return (
    <div>
      <Link href="/admin/courses" className="text-sm text-indigo-600 hover:underline">
        ← กลับ
      </Link>
      <h1 className="mb-1 mt-3 text-2xl font-bold text-slate-900">จัดการรอบเรียน</h1>
      <p className="mb-6 text-slate-500">{course.title}</p>
      <SessionManager courseId={id} sessions={rows} />
    </div>
  );
}
