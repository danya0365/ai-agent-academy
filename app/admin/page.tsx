import Link from "next/link";
import { sql, eq } from "drizzle-orm";
import { Clock, Wallet, BadgeCheck, Users, BookOpen, ArrowRight } from "lucide-react";
import { db } from "@/db";
import { enrollments } from "@/db/schema";
import { getPublishedCourses } from "@/lib/courses";
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

  const courseCount = getPublishedCourses().length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black tracking-tight text-foreground sm:text-3xl">ภาพรวม</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/enrollments" className="card lift bg-brand-50 p-5">
          <div className="flex items-center gap-2 text-brand-700">
            <Clock className="size-5" />
            <p className="text-sm font-bold">สลิปรอตรวจสอบ</p>
          </div>
          <p className="mt-2 text-3xl font-black text-brand-700">{pendingReview}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700">
            คลิกเพื่อตรวจสอบ <ArrowRight className="size-3.5" />
          </p>
        </Link>

        <Stat icon={Wallet} label="รายได้ที่ยืนยันแล้ว" value={formatBaht(revenue)} />
        <Stat icon={BadgeCheck} label="ยืนยันแล้วทั้งหมด" value={`${confirmedCount} รายการ`} />
        <Stat icon={Users} label="ผู้สมัครทั้งหมด" value={`${totalEnrollments} รายการ`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/courses" className="card lift p-5">
          <div className="flex items-center gap-2 text-muted">
            <BookOpen className="size-5" />
            <p className="text-sm font-medium">คอร์สทั้งหมด</p>
          </div>
          <p className="mt-2 text-2xl font-black text-foreground">{courseCount} คอร์ส</p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-700">
            จัดการคอร์ส <ArrowRight className="size-3.5" />
          </p>
        </Link>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="size-5" />
        <p className="text-sm font-medium">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}
