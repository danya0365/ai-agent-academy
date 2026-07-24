"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import type { TipSocial } from "@/lib/tips";
import { Modal } from "@/components/ui/modal";

/** แทนที่ {{LINK}} ด้วย URL เต็มตาม origin ที่เรียกใช้อยู่ */
function resolveLink(text: string, slug: string) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/tips/${slug}`;
  return text.replace(/\{\{LINK\}\}/g, link);
}

/**
 * ปุ่มเล็ก "แชร์ Social" — กดแล้วเด้ง Modal พร้อมข้อความ copy
 */
export function TipSocialCopy({
  social,
  slug,
}: {
  social: TipSocial;
  slug: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedPost, setCopiedPost] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);

  const copy = useCallback(
    async (text: string, setCopied: (v: boolean) => void) => {
      const resolved = resolveLink(text, slug);
      try {
        await navigator.clipboard.writeText(resolved);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // silent
      }
    },
    [slug],
  );

  const commentPreview = resolveLink(social.comment, slug);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted transition hover:border-brand-500 hover:text-brand-600"
      >
        <Share2 className="size-4" />
        แชร์ Social
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="แชร์เคล็ดลับนี้ไป Social"
      >
        <div className="flex flex-col gap-3">
          {/* ── โพสต์หลัก ── */}
          <CopyCard
            label="โพสต์หลัก (ไม่มีลิงก์)"
            hint="วางลงฟีด — ไม่มีลิงก์ ป้องกันลด reach"
            text={social.post}
            copied={copiedPost}
            onCopy={() => copy(social.post, setCopiedPost)}
          />

          {/* ── คอมเมนต์ ── */}
          <CopyCard
            label="คอมเมนต์ (มีลิงก์)"
            hint="วางใต้โพสต์ตัวเอง — ลิงก์มาเว็บเรา"
            text={commentPreview}
            copied={copiedComment}
            onCopy={() => copy(social.comment, setCopiedComment)}
          />
        </div>
      </Modal>
    </>
  );
}

/* ── card inside modal ── */

function CopyCard({
  label,
  hint,
  text,
  copied,
  onCopy,
}: {
  label: string;
  hint: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const charCount = text.length;

  return (
    <div className="rounded-xl border border-border bg-muted-surface p-4">
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

      {/* preview — always visible inside modal */}
      <div className="mt-3 whitespace-pre-wrap rounded-lg border border-border bg-card p-3 text-xs leading-relaxed text-muted">
        {text}
      </div>
    </div>
  );
}
