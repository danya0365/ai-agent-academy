import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getCourseBySlug } from "@/lib/courses";
import { formatBaht, formatDuration } from "@/lib/format";
import { PromptCard } from "@/components/course/prompt-card";

export const dynamic = "force-dynamic";

const COVER_PROMPT = (c: { title: string; subtitle: string; level: string; highlights: string[] }) =>
  [
    `Professional course cover image for "${c.title}"`,
    `Subtitle: ${c.subtitle}`,
    `Level: ${c.level}`,
    c.highlights.length > 0 ? `Highlights: ${c.highlights.join(", ")}` : "",
    "Style: Modern tech education, vibrant but professional, clean composition, suitable for web hero section, 1200x630 px, no text overlay",
  ]
    .filter(Boolean)
    .join(". ");

const OG_PROMPT = (c: { title: string; subtitle: string }) =>
  [
    `Social media OG image for online course "${c.title}"`,
    `Tagline: ${c.subtitle}`,
    "Style: Bold gradient background, minimal design, readable when cropped square or wide, 1200x630 px, space left for text overlay, no text in image",
  ].join(". ");

const STACK_CARD_PROMPT = (courseTitle: string, stack: { title: string; desc: string }) =>
  [
    `Visual thumbnail for course "${courseTitle}" topic: ${stack.title}`,
    stack.desc,
    "Style: Flat illustration or 3D render, modern ed-tech aesthetic, 800x600 px, no text",
  ].join(". ");

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> กลับไปจัดการคอร์ส
      </Link>

      <h1 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        {course.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{course.subtitle}</p>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span className="badge bg-muted-surface text-muted">{course.level}</span>
        <span>{formatBaht(course.price)}</span>
        <span>· {formatDuration(course.sessionDurationMin)}</span>
        <span>· {course.stacks.length} หัวข้อ</span>
        <span>· /{course.slug}</span>
      </div>

      {/* AI Prompts Section */}
      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-foreground">
          <Sparkles className="size-5 text-brand-600" /> AI Image Prompts
        </h2>
        <p className="mb-4 text-sm text-muted">
          กดปุ่มเพื่อคัดลอก prompt สำหรับสร้างรูป แต่ละประเภท
        </p>

        <div className="space-y-4">
          {/* Cover image */}
          <PromptCard
            label="รูปหน้าปกคอร์ส (Hero / Card)"
            description="ใช้สำหรับหน้า course detail และ card แสดงคอร์ส"
            prompt={COVER_PROMPT(course)}
          />

          {/* OG image */}
          <PromptCard
            label="รูปแชร์โซเชียล (OG Image)"
            description="ใช้เวลาแชร์ลิงก์คอร์สบน Facebook / LINE / Twitter"
            prompt={OG_PROMPT(course)}
          />

          {/* Per-stack images */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-bold text-foreground transition hover:text-brand-700">
              รูปประกอบหัวข้อย่อย ({course.stacks.length} stacks)
            </summary>
            <div className="mt-3 space-y-3">
              {course.stacks.map((s, i) => (
                <PromptCard
                  key={i}
                  label={`รูปหัวข้อ: ${s.title}`}
                  description={s.desc}
                  prompt={STACK_CARD_PROMPT(course.title, s)}
                />
              ))}
            </div>
          </details>
        </div>
      </section>

      {/* Course Info Preview */}
      <section className="mt-12">
        <h2 className="mb-3 text-lg font-black text-foreground">รายละเอียดคอร์ส</h2>
        <div className="rounded border border-border bg-surface p-5">
          <div className="whitespace-pre-line text-sm leading-relaxed text-foreground">
            {course.description}
          </div>

          {course.highlights.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-bold text-foreground">ไฮไลท์</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
                {course.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          {course.outcomes.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-bold text-foreground">สิ่งที่ได้จากคอร์สนี้</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
                {course.outcomes.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
