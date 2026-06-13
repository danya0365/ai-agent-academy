import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getEnrollmentForUser } from "@/lib/queries";
import { generatePromptPayQR, getBankInfo } from "@/lib/promptpay";
import {
  formatBaht,
  formatDateTime,
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

  const { enrollment, course, session } = row;
  const bank = getBankInfo();
  const qr = await generatePromptPayQR(enrollment.amount);
  const canUpload =
    enrollment.status === "pending_payment" || enrollment.status === "rejected";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/my-courses" className="text-sm text-indigo-600 hover:underline">
        ← กลับไปคอร์สของฉัน
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-slate-900">ชำระเงิน</h1>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">{course.title}</p>
            {session && (
              <p className="text-sm text-slate-500">
                รอบเรียน: {formatDateTime(session.startAt)}
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[enrollment.status]}`}
          >
            {STATUS_LABELS[enrollment.status]}
          </span>
        </div>
        <p className="mt-3 text-2xl font-bold text-indigo-600">
          {formatBaht(enrollment.amount)}
        </p>
      </div>

      {enrollment.status === "confirmed" && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-5 text-green-800">
          ✅ ยืนยันการชำระเงินเรียบร้อยแล้ว ขอบคุณที่สมัครเรียน!
        </div>
      )}

      {enrollment.status === "slip_uploaded" && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800">
          ได้รับสลิปแล้ว กำลังรอแอดมินตรวจสอบ จะแจ้งผลให้ทราบเร็ว ๆ นี้
        </div>
      )}

      {enrollment.status === "rejected" && enrollment.rejectReason && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <p className="font-medium">สลิปไม่ผ่านการตรวจสอบ</p>
          <p className="mt-1 text-sm">เหตุผล: {enrollment.rejectReason}</p>
          <p className="mt-1 text-sm">กรุณาแนบสลิปใหม่อีกครั้งด้านล่าง</p>
        </div>
      )}

      {canUpload && (
        <>
          {/* ข้อมูลการโอนเงิน */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">ช่องทางการชำระเงิน</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-1 text-sm">
                <p className="text-slate-500">โอนเงินเข้าบัญชี</p>
                <p className="font-medium text-slate-900">{bank.bankName}</p>
                <p className="font-mono text-lg text-slate-900">{bank.accountNumber}</p>
                <p className="text-slate-700">{bank.accountName}</p>
                <p className="pt-2 text-slate-500">ยอดที่ต้องโอน</p>
                <p className="text-lg font-bold text-indigo-600">
                  {formatBaht(enrollment.amount)}
                </p>
              </div>
              {qr && (
                <div className="flex flex-col items-center">
                  <p className="mb-2 text-sm text-slate-500">สแกนจ่ายด้วยพร้อมเพย์</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt="PromptPay QR" className="w-44 rounded-lg border" />
                </div>
              )}
            </div>
          </div>

          {/* อัปโหลดสลิป */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-slate-900">
              {enrollment.status === "rejected" ? "แนบสลิปใหม่" : "แนบสลิปการโอนเงิน"}
            </h2>
            <SlipUploadForm enrollmentId={enrollment.id} />
          </div>
        </>
      )}
    </div>
  );
}
