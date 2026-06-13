import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { formatBaht, COURSE_TYPE_LABELS } from "@/lib/format";
import { PublishToggle } from "@/components/publish-toggle";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const list = await db.select().from(courses).orderBy(desc(courses.createdAt)).all();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">จัดการคอร์ส</h1>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + เพิ่มคอร์ส
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          ยังไม่มีคอร์ส
        </p>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{c.title}</p>
                  <PublishToggle courseId={c.id} isPublished={c.isPublished} />
                </div>
                <p className="text-sm text-slate-500">
                  {COURSE_TYPE_LABELS[c.type]} · {formatBaht(c.price)} · /{c.slug}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                {c.type === "scheduled" && (
                  <Link
                    href={`/admin/courses/${c.id}/sessions`}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                  >
                    จัดการรอบเรียน
                  </Link>
                )}
                <Link
                  href={`/admin/courses/${c.id}/edit`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  แก้ไข
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
