"use client";

import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import { createPost, createReply } from "@/actions/community";
import { POST_BODY_MAX } from "@/lib/community";
import { cn } from "@/lib/cn";

type TipOption = { slug: string; title: string };

/**
 * กล่องเขียนคำถาม (mode="post") หรือคำตอบ (mode="reply")
 * - counter สด + เปลี่ยนสีเมื่อใกล้เต็ม
 * - tip picker เฉพาะ mode="post" (แท็กคำถามให้ผูกกับเคล็ดลับ)
 */
export function PostComposer({
  mode,
  postId,
  tips = [],
  preselectedTip,
}: {
  mode: "post" | "reply";
  postId?: string;
  tips?: TipOption[];
  preselectedTip?: string | null;
}) {
  const [body, setBody] = useState("");
  const [tipSlug, setTipSlug] = useState(preselectedTip ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const len = body.length;
  const empty = body.trim().length === 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res =
        mode === "post"
          ? await createPost({ body, tipSlug: tipSlug || null })
          : await createReply(postId!, body);
      if (res.ok) setBody("");
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 sm:p-5">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={POST_BODY_MAX}
        rows={mode === "post" ? 4 : 3}
        placeholder={
          mode === "post"
            ? "ติดตรงไหน ถามได้เลย... อธิบายให้ละเอียดจะได้คำตอบที่ตรงกว่านะ"
            : "เขียนคำตอบ/แชร์ประสบการณ์..."
        }
        className="input resize-y"
      />

      {mode === "post" && tips.length > 0 && (
        <div className="mt-3">
          <label className="mb-1 block text-xs font-bold text-muted">
            แท็กเคล็ดลับที่เกี่ยวข้อง (ไม่บังคับ)
          </label>
          <select
            value={tipSlug}
            onChange={(e) => setTipSlug(e.target.value)}
            className="input"
          >
            <option value="">— ไม่ระบุ —</option>
            {tips.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-xs font-medium",
            len >= POST_BODY_MAX
              ? "text-error"
              : len >= POST_BODY_MAX * 0.9
                ? "text-warning"
                : "text-muted",
          )}
        >
          {len.toLocaleString("th-TH")}/{POST_BODY_MAX.toLocaleString("th-TH")}
        </span>
        <button
          type="submit"
          disabled={pending || empty}
          className="btn btn-primary text-sm"
        >
          <Send className="size-4" />
          {pending
            ? "กำลังโพสต์..."
            : mode === "post"
              ? "โพสต์คำถาม"
              : "ตอบคำถาม"}
        </button>
      </div>
    </form>
  );
}
