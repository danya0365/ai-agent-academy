"use client";

import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import type { TipSocial } from "@/lib/tips";

/**
 * 2 ปุ่ม copy ข้อความไป Social — แบ่งเป็น โพสต์หลัก (ไม่มีลิงก์) + คอมเมนต์ (มีลิงก์)
 * แสดง preview + copy button ในตัวเดียว ปิด/เปิด preview ได้
 */
export function TipSocialCopy({ social }: { social: TipSocial }) {
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [showCommentPreview, setShowCommentPreview] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);

  const copy = async (text: string, setCopied: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent
    }
  };

  return (
    <div className="card-flat bg-muted-surface p-4 sm:p-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
        แชร์เคล็ดลับนี้ไป Social
      </p>

      <div className="flex flex-col gap-3">
        {/* ── โพสต์หลัก ── */}
        <CopyCard
          label="โพสต์หลัก (ไม่มีลิงก์)"
          hint="วางลงฟีด — ไม่มีลิงก์ ป้องกันลด reach"
          text={social.post}
          copied={copiedPost}
          showPreview={showPostPreview}
          togglePreview={() => setShowPostPreview((v) => !v)}
          onCopy={() => copy(social.post, setCopiedPost)}
        />

        {/* ── คอมเมนต์ ── */}
        <CopyCard
          label="คอมเมนต์ (มีลิงก์)"
          hint="วางใต้โพสต์ตัวเอง — ลิงก์มาเว็บเรา"
          text={social.comment}
          copied={copiedComment}
          showPreview={showCommentPreview}
          togglePreview={() => setShowCommentPreview((v) => !v)}
          onCopy={() => copy(social.comment, setCopiedComment)}
        />
      </div>
    </div>
  );
}

/* ── card small ── */

function CopyCard({
  label,
  hint,
  text,
  copied,
  showPreview,
  togglePreview,
  onCopy,
}: {
  label: string;
  hint: string;
  text: string;
  copied: boolean;
  showPreview: boolean;
  togglePreview: () => void;
  onCopy: () => void;
}) {
  const charCount = text.length;

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs text-muted">{hint}</p>
          <span className="mt-0.5 inline-block text-[11px] text-muted">
            {charCount.toLocaleString()} ตัวอักษร
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className={`btn btn-sm shrink-0 gap-1.5 ${
            copied ? "btn-accent" : "btn-secondary"
          }`}
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> คัดลอกแล้ว
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> คัดลอก
            </>
          )}
        </button>
      </div>

      {/* toggle preview */}
      <button
        type="button"
        onClick={togglePreview}
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-foreground"
      >
        {showPreview ? (
          <>
            <ChevronUp className="size-3" /> ซ่อนตัวอย่าง
          </>
        ) : (
          <>
            <ChevronDown className="size-3" /> ดูตัวอย่าง
          </>
        )}
      </button>

      {/* preview */}
      {showPreview && (
        <div className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-muted-surface p-3 text-xs leading-relaxed text-muted">
          {text}
        </div>
      )}
    </div>
  );
}
