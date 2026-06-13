import Link from "next/link";
import { sql, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, enrollments } from "@/db/schema";
import { formatBaht } from "@/lib/format";

export const dynamic = "force-dynamic";

async function count(where?: ReturnType<typeof eq>) {
  const q = db.select({ n: sql<number>`count(*)` }).from(enrollments);
  const row = where ? await q.where(where).get() : await q.get();
  return Number(row?.n ?? 0);
}

export default async function AdminDashboard() {
  const pendingReview = await count(eq(enrollments.status, "slip_uploaded"));
  const totalEnrollments = await count();
  const confirmedCount = await count(eq(enrollments.status, "confirmed"));

  const revenueRow = await db
    .select({ total: sql<number>`coalesce(sum(${enrollments.amount}), 0)` })
    .from(enrollments)
    .where(eq(enrollments.status, "confirmed"))
    .get();
  const revenue = Number(revenueRow?.total ?? 0);

  const courseRow = await db.select({ n: sql<number>`count(*)` }).from(courses).get();
  const courseCount = Number(courseRow?.n ?? 0);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900">ภาพรวม</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/enrollments"
          className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 transition hover:border-blue-400"
        >
          <p className="text-sm text-blue-700">สลิปรอตรวจสอบ</p>
          <p className="mt-1 text-3xl font-bold text-blue-700">{pendingReview}</p>
          <p className="mt-1 text-xs text-blue-600">คลิกเพื่อตรวจสอบ →</p>
        </Link>

        <Stat label="รายได้ที่ยืนยันแล้ว" value={formatBaht(revenue)} />
        <Stat label="ยืนยันแล้วทั้งหมด" value={`${confirmedCount} รายการ`} />
        <Stat label="ผู้สมัครทั้งหมด" value={`${totalEnrollments} รายการ`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/courses"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300"
        >
          <p className="text-sm text-slate-500">คอร์สทั้งหมด</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{courseCount} คอร์ส</p>
          <p className="mt-1 text-xs text-indigo-600">จัดการคอร์ส →</p>
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
