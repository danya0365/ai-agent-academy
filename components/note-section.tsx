"use client";

import { useState } from "react";
import { StickyNote } from "lucide-react";
import { saveNote } from "@/actions/notes";
import type { Stack } from "@/lib/courses";

export function NoteSection({
  enrollmentId,
  initialNote,
  stacks,
}: {
  enrollmentId: string;
  initialNote: string | null;
  stacks: Stack[];
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(initialNote ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const doSave = async () => {
    setSaving(true);
    const res = await saveNote(enrollmentId, note);
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const addSuggestion = (title: string) => {
    const line = `✅ เรียนหัวข้อ: ${title}`;
    setNote((prev) => (prev ? prev + "\n" + line : line));
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted transition hover:text-foreground"
      >
        <StickyNote className="size-3.5" />
        {open ? "ปิดบันทึก" : note ? "ดูโน๊ต" : "เพิ่มโน๊ต"}
      </button>

      {open && (
        <div className="mt-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={doSave}
            rows={3}
            placeholder="จดบันทึกสิ่งที่กำลังจะเรียนหรือเรียนไปแล้ว"
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {stacks.map((s) => (
              <button
                key={s.title}
                type="button"
                onClick={() => addSuggestion(s.title)}
                className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs text-muted transition hover:border-brand-400 hover:text-brand-700"
              >
                + {s.title}
              </button>
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="h-4 text-xs text-muted">
              {saving ? "กำลังบันทึก..." : saved ? "บันทึกแล้ว" : ""}
            </span>
            <button
              type="button"
              onClick={doSave}
              disabled={saving}
              className="rounded bg-brand-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
