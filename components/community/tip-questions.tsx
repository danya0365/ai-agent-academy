import Link from "next/link";
import { MessagesSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import { getQuestionsForTip } from "@/lib/queries";
import { snippet } from "@/lib/community";

/**
 * section "คำถามเกี่ยวกับเคล็ดลับนี้" บนหน้า tip detail
 * โชว์ 3 คำถามล่าสุด + ปุ่มไปถามในคอมมูนิตี้ (composer จะ preselect tip นี้ให้)
 */
export async function TipQuestions({ slug }: { slug: string }) {
  const { count, questions } = await getQuestionsForTip(slug, 3);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-foreground">
          <MessagesSquare className="size-5 text-brand-500" />
          คำถามเกี่ยวกับเคล็ดลับนี้{count > 0 ? ` (${count})` : ""}
        </h2>
        <Link href={`/community?tip=${slug}`} className="btn btn-secondary text-sm">
          ถามเกี่ยวกับ tip นี้
        </Link>
      </div>

      {questions.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          ยังไม่มีคำถาม — ติดตรงไหนเกี่ยวกับเคล็ดลับนี้ ถามได้เลย เดี๋ยวมีคนช่วยตอบ 🙌
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {questions.map((q) => (
            <li key={q.id}>
              <Link href={`/community/${q.id}`} className="card-flat lift block p-4">
                <div className="flex items-center gap-2 text-sm text-muted">
                  <span className="font-bold text-foreground">{q.author.name}</span>
                  {q.hasAccepted && (
                    <span className="badge bg-success-surface text-success">
                      <CheckCircle2 className="size-3" />
                      มีคำตอบแล้ว
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-foreground">
                  {snippet(q.body, 140)}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span>{q.replyCount} คำตอบ</span>
                  <span>{q.likeCount} ถูกใจ</span>
                </div>
              </Link>
            </li>
          ))}
          {count > questions.length && (
            <li>
              <Link
                href={`/community?tip=${slug}`}
                className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 transition hover:gap-2"
              >
                ดูคำถามทั้งหมด {count} ข้อ
                <ArrowRight className="size-4" />
              </Link>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
