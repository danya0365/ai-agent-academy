import Link from "next/link";
import { getAdminEnrollments } from "@/lib/queries";
import {
  formatBaht,
  formatDateTime,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/format";
import { EnrollmentReview } from "@/components/enrollment-review";
import type { EnrollmentStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

const FILTERS: { key: EnrollmentStatus | "all"; label: string }[] = [
  { key: "slip_uploaded", label: "รอตรวจสอบ" },
  { key: "confirmed", label: "ยืนยันแล้ว" },
  { key: "rejected", label: "ปฏิเสธ" },
  { key: "pending_payment", label: "รอชำระเงิน" },
  { key: "all", label: "ทั้งหมด" },
];

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
      <h1 className="mb-4 text-2xl font-bold text-slate-900">ตรวจสอบการสมัคร</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/enrollments?status=${f.key}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              active === f.key
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          ไม่มีรายการในสถานะนี้
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map(({ enrollment, course, session, customer }) => (
            <div
              key={enrollment.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{course.title}</p>
                  <p className="text-sm text-slate-500">
                    {customer.name} · {customer.email}
                  </p>
                  {session && (
                    <p className="text-sm text-slate-500">
                      รอบ: {formatDateTime(session.startAt)}
                    </p>
                  )}
                  <p className="text-sm text-slate-500">
                    ยอด: {formatBaht(enrollment.amount)}
                    {enrollment.slipUploadedAt && (
                      <> · ส่งสลิป {formatDateTime(enrollment.slipUploadedAt)}</>
                    )}
                  </p>
                  {enrollment.rejectReason && (
                    <p className="text-sm text-red-600">
                      เหตุผลที่ปฏิเสธ: {enrollment.rejectReason}
                    </p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[enrollment.status]}`}
                >
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
                    className="h-32 rounded-lg border border-slate-200 object-cover"
                  />
                </a>
              )}

              <EnrollmentReview
                enrollmentId={enrollment.id}
                status={enrollment.status}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
