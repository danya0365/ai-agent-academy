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
    <div className="rounded-2xl border-2 border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-foreground">{label}</p>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="btn btn-accent btn-sm shrink-0"
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
      <pre className="mt-4 overflow-x-auto rounded-2xl border-2 border-border bg-muted-surface p-4 text-xs leading-relaxed text-foreground">
        {prompt}
      </pre>
    </div>
  );
}
