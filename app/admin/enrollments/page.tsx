import Link from "next/link";
import { getAdminEnrollments } from "@/lib/queries";
import {
  formatBaht,
  formatBkkDateTime,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/format";
import { COURSE_TYPE_LABELS, courseTypeBadge } from "@/lib/course-types";
import { EnrollmentReview } from "@/components/enrollment-review";
import { cn } from "@/lib/cn";
import type { EnrollmentStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

const FILTERS: { key: EnrollmentStatus | "all"; label: string }[] = [
  { key: "slip_uploaded", label: "รอตรวจสอบ" },
  { key: "confirmed", label: "ยืนยันแล้ว" },
  { key: "rejected", label: "ปฏิเสธ" },
  { key: "pending_payment", label: "รอชำระเงิน" },
  { key: "all", label: "ทั้งหมด" },
];

const VERIFY: Record<string, { label: string; cls: string }> = {
  verified: { label: "ผ่าน", cls: "bg-success-surface text-success" },
  failed: { label: "ไม่ผ่าน", cls: "bg-error-surface text-error" },
  unconfigured: { label: "ยังไม่เปิดใช้", cls: "bg-muted-surface text-muted" },
  manual: { label: "ต้องตรวจมือ", cls: "bg-muted-surface text-muted" },
};

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = (status as EnrollmentStatus | "all") || "slip_uploaded";
  const rows = await getAdminEnrollments(
    active === "all" ? undefined : (active as EnrollmentStatus),
  );

  return (
    <div>
      <h1 className="mb-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        ตรวจสอบการสมัคร
      </h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/enrollments?status=${f.key}`}
            className={cn(
              "rounded-full border-2 border-border px-3 py-1.5 text-sm font-bold transition",
              active === f.key
                ? "bg-brand-500 text-on-brand"
                : "bg-card text-muted hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="card-flat p-8 text-center text-muted">ไม่มีรายการในสถานะนี้</p>
      ) : (
        <div className="space-y-3">
          {rows.map(({ enrollment, course, customer }) => {
            const courseTitle = course?.title ?? enrollment.courseTitle;
            const v = enrollment.slipVerifyStatus
              ? VERIFY[enrollment.slipVerifyStatus]
              : null;
            return (
              <div key={enrollment.id} className="card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-foreground">{courseTitle}</p>
                    <p className="text-sm text-muted">
                      {customer.name} · {customer.email}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className={`badge ${courseTypeBadge(course?.type ?? "live")}`}>
                        {COURSE_TYPE_LABELS[course?.type ?? "live"]}
                      </span>
                      {course?.type === "live" && enrollment.bookedStartAt ? (
                        <span>เวลาที่จอง: {formatBkkDateTime(enrollment.bookedStartAt)}</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted">
                      ยอด: {formatBaht(enrollment.amount)}
                      {enrollment.slipUploadedAt && (
                        <> · ส่งสลิป {formatBkkDateTime(enrollment.slipUploadedAt)}</>
                      )}
                    </p>
                    {enrollment.rejectReason && (
                      <p className="text-sm text-error">เหตุผลที่ปฏิเสธ: {enrollment.rejectReason}</p>
                    )}
                    {v && (
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                        <span className={`badge ${v.cls}`}>ตรวจอัตโนมัติ: {v.label}</span>
                        {enrollment.verifyNote && (
                          <span className="text-muted">{enrollment.verifyNote}</span>
                        )}
                      </p>
                    )}
                  </div>
                  <span className={`badge ${STATUS_COLORS[enrollment.status]}`}>
                    {STATUS_LABELS[enrollment.status]}
                  </span>
                </div>

                {enrollment.slipPath && (
                  <a
                    href={`/api/slips/${enrollment.slipPath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/slips/${enrollment.slipPath}`}
                      alt="สลิป"
                      className="h-32 rounded-xl border-2 border-border object-cover"
                    />
                  </a>
                )}

                <EnrollmentReview enrollmentId={enrollment.id} status={enrollment.status} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
