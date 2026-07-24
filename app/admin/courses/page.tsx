import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { formatBaht } from "@/lib/format";
import { COURSE_TYPE_LABELS, courseTypeBadge } from "@/lib/course-types";
import { PublishToggle } from "@/components/publish-toggle";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const list = await db.select().from(courses).orderBy(desc(courses.createdAt)).all();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">จัดการคอร์ส</h1>
        <Link href="/admin/courses/new" className="btn btn-primary text-sm">
          <Plus className="size-4" /> เพิ่มคอร์ส
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="card-flat p-8 text-center text-muted">ยังไม่มีคอร์ส</p>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.id}
              className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-foreground">{c.title}</p>
                  <PublishToggle courseId={c.id} isPublished={c.isPublished} />
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <span className={`badge ${courseTypeBadge(c.type)}`}>
                    {COURSE_TYPE_LABELS[c.type]}
                  </span>
                  {c.type === "live" && c.sessionDurationMin && (
                    <span>ครั้งละ {c.sessionDurationMin} นาที</span>
                  )}
                  · {formatBaht(c.price)} · /{c.slug}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link href={`/admin/courses/${c.id}/edit`} className="btn btn-secondary text-sm">
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
