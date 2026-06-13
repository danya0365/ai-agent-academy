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
    <form action={handleSubmit} className="max-w-xl space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">ชื่อคอร์ส</span>
        <input name="title" defaultValue={initial?.title} required className="input" />
      </label>

      {!isEdit && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            slug (URL) — เว้นว่างเพื่อสร้างอัตโนมัติ
          </span>
          <input name="slug" placeholder="เช่น ai-basics" className="input" />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">รายละเอียด</span>
        <textarea
          name="description"
          defaultValue={initial?.description}
          rows={6}
          className="input"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">ประเภท</span>
          <select name="type" defaultValue={initial?.type ?? "scheduled"} className="input">
            <option value="scheduled">มีรอบเรียน</option>
            <option value="open">เรียนได้ทันที (สมัครได้ตลอด)</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">ราคา (บาท)</span>
          <input
            name="price"
            type="number"
            min={0}
            defaultValue={initial?.price ?? 0}
            required
            className="input"
          />
        </label>
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isPublished"
          defaultChecked={initial?.isPublished ?? false}
          className="h-4 w-4"
        />
        <span className="text-sm text-slate-700">เผยแพร่ (แสดงในหน้าคอร์ส)</span>
      </label>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:bg-slate-300"
      >
        {pending ? "กำลังบันทึก..." : isEdit ? "บันทึกการแก้ไข" : "สร้างคอร์ส"}
      </button>
    </form>
  );
}
