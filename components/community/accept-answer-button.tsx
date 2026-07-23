"use client";

import { useTransition } from "react";
import { CheckCircle2 } from "lucide-react";
import { acceptReply } from "@/actions/community";
import { cn } from "@/lib/cn";

/**
 * ปุ่ม "เลือกเป็นคำตอบที่ใช่" — เฉพาะเจ้าของคำถาม/แอดมิน (กดซ้ำ = ยกเลิก)
 * revalidatePath ใน action จะ re-render thread พร้อมจัดลำดับ accepted ขึ้นบนสุด
 */
export function AcceptAnswerButton({
  questionId,
  replyId,
  accepted,
}: {
  questionId: string;
  replyId: string;
  accepted: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      await acceptReply(questionId, replyId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={cn("btn text-sm", accepted ? "btn-primary" : "btn-secondary")}
      title={accepted ? "ยกเลิกคำตอบที่ใช่" : "เลือกเป็นคำตอบที่ใช่"}
    >
      <CheckCircle2 className="size-4" />
      {accepted ? "คำตอบที่ใช่" : "เลือกเป็นคำตอบที่ใช่"}
    </button>
  );
}
