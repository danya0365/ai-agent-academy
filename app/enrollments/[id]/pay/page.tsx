import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getEnrollmentForUser } from "@/lib/queries";
import { generatePromptPayQR, getBankInfo } from "@/lib/promptpay";
import {
  formatBaht,
  formatBkkDateTime,
  STATUS_LABELS,
  STATUS_COLORS,
} from "@/lib/format";
import { SlipUploadForm } from "@/components/slip-upload-form";

export const dynamic = "force-dynamic";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser(`/enrollments/${id}/pay`);
  const row = await getEnrollmentForUser(id, user.id);
  if (!row) notFound();

  const { enrollment, course } = row;
  const courseTitle = course?.title ?? enrollment.courseTitle;
  const bank = getBankInfo();
  const qr = await generatePromptPayQR(enrollment.amount);
  const canUpload =
    enrollment.status === "pending_payment" || enrollment.status === "rejected";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href="/my-courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> กลับไปคอร์สของฉัน
      </Link>

      <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        ชำระเงิน
      </h1>

      <div className="card mt-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-extrabold text-foreground">{courseTitle}</p>
            {enrollment.bookedStartAt && (
              <p className="text-sm text-muted">
                เวลาที่จอง: {formatBkkDateTime(enrollment.bookedStartAt)}
              </p>
            )}
          </div>
          <span className={`badge ${STATUS_COLORS[enrollment.status]}`}>
            {STATUS_LABELS[enrollment.status]}
          </span>
        </div>
        <p className="mt-3 text-3xl font-black text-brand-700">{formatBaht(enrollment.amount)}</p>
      </div>

      {enrollment.status === "confirmed" && (
        <div className="card mt-4 flex items-start gap-2 bg-success-surface p-5 text-success">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <span className="font-medium">ยืนยันการชำระเงินเรียบร้อยแล้ว ขอบคุณที่สมัครเรียน!</span>
        </div>
      )}

      {enrollment.status === "slip_uploaded" && (
        <div className="card mt-4 flex items-start gap-2 p-5">
          <Clock className="mt-0.5 size-5 shrink-0 text-brand-700" />
          <span className="text-muted">ได้รับสลิปแล้ว กำลังรอแอดมินตรวจสอบ จะแจ้งผลให้ทราบเร็ว ๆ นี้</span>
        </div>
      )}

      {enrollment.status === "rejected" && enrollment.rejectReason && (
        <div className="card mt-4 bg-error-surface p-5 text-error">
          <p className="flex items-center gap-2 font-extrabold">
            <XCircle className="size-5" /> สลิปไม่ผ่านการตรวจสอบ
          </p>
          <p className="mt-1 text-sm">เหตุผล: {enrollment.rejectReason}</p>
          <p className="mt-1 text-sm">กรุณาแนบสลิปใหม่อีกครั้งด้านล่าง</p>
        </div>
      )}

      {canUpload && (
        <>
          <div className="card mt-6 p-5">
            <h2 className="mb-3 font-extrabold text-foreground">ช่องทางการชำระเงิน</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p className="text-muted">โอนเงินเข้าบัญชี</p>
                <p className="font-bold text-foreground">{bank.bankName}</p>
                <p className="font-mono text-lg text-foreground">{bank.accountNumber}</p>
                <p className="text-foreground">{bank.accountName}</p>
                <p className="pt-2 text-muted">ยอดที่ต้องโอน</p>
                <p className="text-lg font-black text-brand-700">{formatBaht(enrollment.amount)}</p>
              </div>
              {qr && (
                <div className="flex flex-col items-center">
                  <p className="mb-2 text-sm text-muted">สแกนจ่ายด้วยพร้อมเพย์</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qr}
                    alt="PromptPay QR"
                    className="w-44 rounded-xl border-2 border-border"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="card mt-6 p-5">
            <h2 className="mb-3 font-extrabold text-foreground">
              {enrollment.status === "rejected" ? "แนบสลิปใหม่" : "แนบสลิปการโอนเงิน"}
            </h2>
            <SlipUploadForm enrollmentId={enrollment.id} />
          </div>
        </>
      )}
    </div>
  );
}
