import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getUserEnrollments } from "@/lib/queries";
import {
  formatBaht,
  formatDateTime,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const user = await requireUser("/my-courses");
  const rows = await getUserEnrollments(user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">คอร์สของฉัน</h1>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-500">คุณยังไม่ได้สมัครเรียนคอร์สใด</p>
          <Link
            href="/"
            className="mt-3 inline-block font-medium text-indigo-600 hover:underline"
          >
            ดูคอร์สทั้งหมด →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map(({ enrollment, course, session }) => {
            const actionable =
              enrollment.status === "pending_payment" ||
              enrollment.status === "rejected";
            return (
              <div
                key={enrollment.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{course.title}</p>
                  {session && (
                    <p className="text-sm text-slate-500">
                      รอบเรียน: {formatDateTime(session.startAt)}
                    </p>
                  )}
                  <p className="text-sm text-slate-500">{formatBaht(enrollment.amount)}</p>
                  {enrollment.status === "rejected" && enrollment.rejectReason && (
                    <p className="mt-1 text-sm text-red-600">
                      เหตุผล: {enrollment.rejectReason}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[enrollment.status]}`}
                  >
                    {STATUS_LABELS[enrollment.status]}
                  </span>
                  {actionable && (
                    <Link
                      href={`/enrollments/${enrollment.id}/pay`}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
                    >
                      {enrollment.status === "rejected" ? "แนบสลิปใหม่" : "ชำระเงิน"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
