import type { Tip, TipSection } from "@/lib/tips";

/**
 * Fallback renderer — เอาเนื้อหาจาก key ใน array (sections / content) มาแสดงตรง ๆ
 * ใช้เมื่อ slug นั้นไม่มี component เฉพาะใน components/tips/registry.tsx
 * โครงเดียวกับ components/legal.tsx (heading + ย่อหน้า + bullet)
 */
export function TipBody({ tip }: { tip: Tip }) {
  // มี sections → render แบบมีหัวข้อย่อย
  if (tip.sections && tip.sections.length > 0) {
    return (
      <div className="flex flex-col gap-6">
        {tip.sections.map((section, i) => (
          <TipSectionBlock key={i} section={section} />
        ))}
      </div>
    );
  }

  // ไม่มี sections แต่มี content → แสดง text ล้วน (คง line break)
  if (tip.content) {
    return (
      <div className="whitespace-pre-line leading-relaxed text-muted">
        {tip.content}
      </div>
    );
  }

  return null;
}

function TipSectionBlock({ section }: { section: TipSection }) {
  return (
    <section>
      {section.heading && (
        <h2 className="mb-2 text-lg font-bold text-foreground">
          {section.heading}
        </h2>
      )}
      <div className="flex flex-col gap-2 leading-relaxed text-muted">
        {section.body &&
          section.body
            .split("\n\n")
            .map((para, i) => <p key={i}>{para}</p>)}
        {section.bullets && section.bullets.length > 0 && (
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {section.bullets.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
