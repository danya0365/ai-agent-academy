"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function PromptCard({
  label,
  description,
  prompt,
}: {
  label: string;
  description: string;
  prompt: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <p className="text-xs text-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> คัดลอกแล้ว
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> คัดลอก Prompt
            </>
          )}
        </button>
      </div>
      <pre className="mt-3 overflow-x-auto rounded bg-black/5 p-3 text-xs leading-relaxed text-foreground dark:bg-white/5">
        {prompt}
      </pre>
    </div>
  );
}
