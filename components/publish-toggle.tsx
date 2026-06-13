"use client";

import { useTransition } from "react";
import { togglePublish } from "@/actions/admin";

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
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        isPublished
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      } disabled:opacity-50`}
    >
      {isPublished ? "เผยแพร่อยู่" : "ซ่อนอยู่"}
    </button>
  );
}
