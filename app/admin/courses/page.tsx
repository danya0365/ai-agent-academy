import { getPublishedCourses } from "@/lib/courses";
import { formatBaht, formatDuration, COURSE_TYPE_LABELS, courseTypeBadge } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const list = getPublishedCourses();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">จัดการคอร์ส</h1>
      </div>

      {list.length === 0 ? (
        <p className="card-flat p-8 text-center text-muted">ยังไม่มีคอร์ส</p>
      ) : (
        <div className="space-y-3">
          {list.map((c) => (
            <div
              key={c.slug}
              className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-extrabold text-foreground">{c.title}</p>
                  <span className="badge bg-success-surface text-success">เผยแพร่</span>
                </div>
                <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                  <span className={`badge ${courseTypeBadge(c.type)}`}>
                    {COURSE_TYPE_LABELS[c.type]}
                  </span>
                  <span>ครั้งละ {formatDuration(c.sessionDurationMin)}</span>
                  · {formatBaht(c.price)} ·  {c.stacks.length} หัวข้อ · /{c.slug}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
