"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCourse, updateCourse } from "@/actions/admin";

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  type?: "scheduled" | "open";
  price?: number;
  isPublished?: boolean;
};

export function CourseForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = isEdit
        ? await updateCourse(initial!.id!, formData)
        : await createCourse(formData);
      if (!res.ok) {
        setError(res.error);
      } else {
        router.push("/admin/courses");
        router.refresh();
      }
    });
  }

  return (
    <form action={handleSubmit} className="card max-w-xl space-y-4 p-6">
      <Label text="ชื่อคอร์ส">
        <input name="title" defaultValue={initial?.title} required className="input" />
      </Label>

      {!isEdit && (
        <Label text="slug (URL) — เว้นว่างเพื่อสร้างอัตโนมัติ">
          <input name="slug" placeholder="เช่น ai-basics" className="input" />
        </Label>
      )}

      <Label text="รายละเอียด">
        <textarea name="description" defaultValue={initial?.description} rows={6} className="input" />
      </Label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Label text="ประเภท">
          <select name="type" defaultValue={initial?.type ?? "scheduled"} className="input">
            <option value="scheduled">มีรอบเรียน</option>
            <option value="open">เรียนได้ทันที (สมัครได้ตลอด)</option>
          </select>
        </Label>

        <Label text="ราคา (บาท)">
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={initial?.price ?? 0}
            required
            className="input"
          />
        </Label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={initial?.isPublished ?? false}
          className="size-4 accent-brand-500"
        />
        <span className="text-sm text-foreground">เผยแพร่ (แสดงในหน้าคอร์ส)</span>
      </label>

      {error && (
        <p className="rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างคอร์ส"}
      </button>
    </form>
  );
}

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-foreground">{text}</span>
      {children}
    </label>
  );
}
