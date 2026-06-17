"use client";

import { useTransition } from "react";
import { togglePublish } from "@/actions/admin";
import { cn } from "@/lib/cn";

export function PublishToggle({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => togglePublish(courseId).then(() => {}))}
      disabled={pending}
      className={cn(
        "badge transition disabled:opacity-50",
        isPublished
          ? "bg-success-surface text-success"
          : "bg-muted-surface text-muted",
      )}
    >
      {isPublished ? "เผยแพร่อยู่" : "ซ่อนอยู่"}
    </button>
  );
}
