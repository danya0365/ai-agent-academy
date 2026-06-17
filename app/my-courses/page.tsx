import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        คอร์สของฉัน
      </h1>

      {rows.length === 0 ? (
        <div className="card-flat p-8 text-center">
          <p className="text-muted">คุณยังไม่ได้สมัครเรียนคอร์สใด</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-1 font-bold text-brand-700 hover:gap-2"
          >
            ดูคอร์สทั้งหมด <ArrowRight className="size-4" />
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
                className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-extrabold text-foreground">{course.title}</p>
                  {session && (
                    <p className="text-sm text-muted">
                      รอบเรียน: {formatDateTime(session.startAt)}
                    </p>
                  )}
                  <p className="text-sm text-muted">{formatBaht(enrollment.amount)}</p>
                  {enrollment.status === "rejected" && enrollment.rejectReason && (
                    <p className="mt-1 text-sm text-error">เหตุผล: {enrollment.rejectReason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${STATUS_COLORS[enrollment.status]}`}>
                    {STATUS_LABELS[enrollment.status]}
                  </span>
                  {actionable && (
                    <Link
                      href={`/enrollments/${enrollment.id}/pay`}
                      className="btn btn-primary text-sm"
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
