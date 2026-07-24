import { Wallet, Clock, BadgeCheck, BarChart3, type LucideIcon } from "lucide-react";
import type { courses } from "@/db/schema";
import { formatBaht, formatDuration } from "@/lib/format";
import type { ResolvedCourseContent } from "@/lib/course-content";

type Course = typeof courses.$inferSelect;

const TYPE_FACT = {
  self_paced: "เรียนได้ทันทีหลังสมัคร",
  live: "จองเวลาเรียนเองได้",
} as const;

/** แถบข้อเท็จจริงย่อของคอร์ส — ราคา / รูปแบบ / ความยาว / ระดับ */
export function CourseMeta({
  course,
  content,
}: {
  course: Course;
  content: ResolvedCourseContent;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Fact icon={Wallet}>{formatBaht(course.price)}</Fact>
      <Fact icon={BadgeCheck}>{TYPE_FACT[course.type]}</Fact>
      {course.type === "live" && course.sessionDurationMin && (
        <Fact icon={Clock}>ครั้งละ {formatDuration(course.sessionDurationMin)}</Fact>
      )}
      {content.level && <Fact icon={BarChart3}>ระดับ {content.level}</Fact>}
    </div>
  );
}

function Fact({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="card-flat inline-flex items-center gap-2 px-3 py-2 text-sm font-bold text-foreground">
      <Icon className="size-4 shrink-0 text-alt-600" />
      {children}
    </span>
  );
}
