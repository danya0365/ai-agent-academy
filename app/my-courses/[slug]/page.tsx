import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, XCircle, CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getUserCourseEnrollments } from "@/lib/queries";
import { getCourseBySlug } from "@/lib/courses";
import {
  formatBaht,
  formatBkkDateTime,
  formatBkkDay,
  formatDuration,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/format";
import { NoteSection } from "@/components/note-section";

export const dynamic = "force-dynamic";

export default async function MyCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser(`/my-courses/${slug}`);
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const { past, upcoming, pending, rejected } = await getUserCourseEnrollments(user.id, slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Header */}
      <Link
        href="/my-courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> กลับไปคอร์สของฉัน
      </Link>

      <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        {course.title}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {course.stacks.length} หัวข้อให้เลือกเรียน · ครั้งละ {formatDuration(course.sessionDurationMin)}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_240px]">
        {/* Timeline */}
        <div>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-foreground">
                <CalendarDays className="size-5 text-brand-700" /> นัดเรียนถัดไป
              </h2>
              <div className="space-y-3">
                {upcoming.map((e) => (
                  <div key={e.id} className="card border-l-4 border-l-brand-500 p-4">
                    <p className="font-extrabold text-foreground">
                      {formatBkkDateTime(e.bookedStartAt!)}
                    </p>
                    <p className="mt-1 text-sm text-muted">ถึง {formatBkkDateTime(e.bookedEndAt!)}</p>
                    <span className={`badge mt-2 ${STATUS_COLORS[e.status]}`}>
                      {STATUS_LABELS[e.status]}
                    </span>
                    <NoteSection
                      enrollmentId={e.id}
                      initialNote={e.note ?? null}
                      stacks={course.stacks}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {past.length === 0 && upcoming.length === 0 && pending.length === 0 && rejected.length === 0 && (
            <div className="card-flat p-8 text-center text-muted">
              ยังไม่มีประวัติการจองคอร์สนี้
            </div>
          )}

          {/* Past sessions */}
          {past.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-black text-foreground">
                เรียนไปแล้ว {past.length} ครั้ง
              </h2>
              <div className="space-y-3">
                {past.map((e) => (
                  <div key={e.id} className="card-flat p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-4 shrink-0 text-success" />
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {e.bookedStartAt ? formatBkkDateTime(e.bookedStartAt) : "(ไม่มีเวลา)"}
                          </p>
                          {e.bookedEndAt && (
                            <p className="text-xs text-muted">
                              ถึง {formatBkkDay(e.bookedEndAt)}{" "}
                              {e.bookedEndAt.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-muted">{formatBaht(e.amount)}</span>
                    </div>
                    <NoteSection
                      enrollmentId={e.id}
                      initialNote={e.note ?? null}
                      stacks={course.stacks}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pending payments */}
          {pending.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-foreground">
                <Clock className="size-5 text-warning" /> รอชำระเงิน
              </h2>
              <div className="space-y-2">
                {pending.map((e) => (
                  <div key={e.id} className="card-flat p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        {e.bookedStartAt && (
                          <p className="text-sm font-bold text-foreground">
                            {formatBkkDateTime(e.bookedStartAt)}
                          </p>
                        )}
                        <span className={`badge mt-1 ${STATUS_COLORS[e.status]}`}>
                          {STATUS_LABELS[e.status]}
                        </span>
                      </div>
                      <Link href={`/enrollments/${e.id}/pay`} className="btn btn-primary text-sm">
                        ชำระเงิน
                      </Link>
                    </div>
                    <NoteSection
                      enrollmentId={e.id}
                      initialNote={e.note ?? null}
                      stacks={course.stacks}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-black text-foreground">
                <XCircle className="size-5 text-error" /> สลิปไม่ผ่าน
              </h2>
              <div className="space-y-2">
                {rejected.map((e) => (
                  <div key={e.id} className="card-flat p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        {e.bookedStartAt && (
                          <p className="text-sm font-bold text-foreground">
                            {formatBkkDateTime(e.bookedStartAt)}
                          </p>
                        )}
                        {e.rejectReason && (
                          <p className="mt-0.5 text-xs text-error">เหตุผล: {e.rejectReason}</p>
                        )}
                      </div>
                      <Link href={`/enrollments/${e.id}/pay`} className="btn btn-secondary text-sm">
                        แนบสลิปใหม่
                      </Link>
                    </div>
                    <NoteSection
                      enrollmentId={e.id}
                      initialNote={e.note ?? null}
                      stacks={course.stacks}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar summary */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="card space-y-3 p-5">
            <h3 className="font-extrabold text-foreground">สรุป</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">เรียนแล้ว</span>
              <span className="font-bold text-foreground">{past.length} ครั้ง</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">รอชำระ</span>
              <span className="font-bold text-foreground">{pending.length} ครั้ง</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">นัดถัดไป</span>
              <span className="font-bold text-foreground">{upcoming.length} ครั้ง</span>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">รวมทั้งหมด</span>
              <span className="font-bold text-foreground">
                {past.length + upcoming.length + pending.length + rejected.length} ครั้ง
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
