"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCourse, updateCourse } from "@/actions/admin";
import type { CourseType } from "@/lib/course-types";

type Initial = {
  id?: string;
  title?: string;
  slug?: string;
  description?: string;
  type?: CourseType;
  price?: number;
  sessionDurationMin?: number | null;
  isPublished?: boolean;
};

const DURATION_OPTIONS = [30, 45, 60, 90, 120] as const;

export function CourseForm({ initial }: { initial?: Initial }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<CourseType>(initial?.type ?? "self_paced");
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
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as CourseType)}
            className="input"
          >
            <option value="self_paced">เรียนเอง (เอกสาร + วิดีโอ)</option>
            <option value="live">สอนสดตัวต่อตัว</option>
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

      {type === "live" && (
        <Label text="ความยาวต่อครั้ง">
          <select
            name="sessionDurationMin"
            defaultValue={initial?.sessionDurationMin ?? 60}
            className="input"
          >
            {DURATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} นาที
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-muted">
            ระบบจะหั่น slot ให้ลูกค้าจองตามความยาวนี้ · เวลาทำการตั้งที่หน้า “เวลาทำการ”
          </span>
        </Label>
      )}

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
