import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getUserEnrollments } from "@/lib/queries";
import {
  formatBaht,
  formatBkkDateTime,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function MyCoursesPage() {
  const user = await requireUser("/my-courses");
  const rows = await getUserEnrollments(user.id);

  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          คอร์สของฉัน
        </h1>
        <div className="card-flat p-8 text-center">
          <p className="text-muted">คุณยังไม่ได้สมัครเรียนคอร์สใด</p>
          <Link
            href="/"
            className="mt-3 inline-flex items-center gap-1 font-bold text-brand-700 hover:gap-2"
          >
            ดูคอร์สทั้งหมด <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Group by course slug
  const byCourse = new Map<string, { title: string; enrollments: typeof rows }>();
  for (const r of rows) {
    const slug = r.enrollment.courseSlug;
    if (!byCourse.has(slug)) {
      byCourse.set(slug, { title: r.course?.title ?? r.enrollment.courseTitle, enrollments: [] });
    }
    byCourse.get(slug)!.enrollments.push(r);
  }

  const now = new Date();
  const courseEntries = Array.from(byCourse.entries()).sort((a, b) => {
    const aUpcoming = a[1].enrollments.some(
      (r) => r.enrollment.bookedStartAt && r.enrollment.bookedStartAt >= now && r.enrollment.status === "confirmed",
    );
    const bUpcoming = b[1].enrollments.some(
      (r) => r.enrollment.bookedStartAt && r.enrollment.bookedStartAt >= now && r.enrollment.status === "confirmed",
    );
    return Number(bUpcoming) - Number(aUpcoming);
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        คอร์สของฉัน
      </h1>

      <div className="space-y-4">
        {courseEntries.map(([slug, group]) => {
          const upcoming = group.enrollments.filter(
            (r) => r.enrollment.bookedStartAt && r.enrollment.bookedStartAt >= now && r.enrollment.status === "confirmed",
          );
          const pastCount = group.enrollments.filter(
            (r) => r.enrollment.status === "confirmed" && (!r.enrollment.bookedStartAt || r.enrollment.bookedStartAt < now),
          ).length;
          const pendingCount = group.enrollments.filter(
            (r) => r.enrollment.status === "pending_payment" || r.enrollment.status === "slip_uploaded",
          ).length;

          return (
            <div key={slug} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold text-foreground">{group.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted">
                    {upcoming.length > 0 && (
                      <span className="flex items-center gap-1 font-medium text-brand-700">
                        <CalendarDays className="size-3.5" /> นัดถัดไป{" "}
                        {formatBkkDateTime(upcoming[0].enrollment.bookedStartAt!)}
                      </span>
                    )}
                    <span>เรียนแล้ว {pastCount} ครั้ง</span>
                    {pendingCount > 0 && <span>รอดำเนินการ {pendingCount} รายการ</span>}
                  </div>
                </div>
                <Link
                  href={`/my-courses/${slug}`}
                  className="btn btn-secondary shrink-0 text-sm"
                >
                  ดูประวัติ
                </Link>
              </div>

              {/* Recent enrollments (max 3) */}
              <div className="mt-3 space-y-1.5">
                {group.enrollments.slice(0, 3).map(({ enrollment }) => {
                  const actionable =
                    enrollment.status === "pending_payment" || enrollment.status === "rejected";
                  return (
                    <div
                      key={enrollment.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-muted-surface px-3 py-2"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        {enrollment.bookedStartAt && (
                          <span className="text-foreground">
                            {formatBkkDateTime(enrollment.bookedStartAt)}
                          </span>
                        )}
                        <span className={`badge ${STATUS_COLORS[enrollment.status]}`}>
                          {STATUS_LABELS[enrollment.status]}
                        </span>
                      </div>
                      {actionable && (
                        <Link
                          href={`/enrollments/${enrollment.id}/pay`}
                          className="btn btn-primary text-xs"
                        >
                          {enrollment.status === "rejected" ? "แนบสลิปใหม่" : "ชำระเงิน"}
                        </Link>
                      )}
                    </div>
                  );
                })}
                {group.enrollments.length > 3 && (
                  <Link
                    href={`/my-courses/${slug}`}
                    className="block text-center text-xs font-bold text-brand-700 hover:underline"
                  >
                    ดูทั้งหมด {group.enrollments.length} รายการ
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
