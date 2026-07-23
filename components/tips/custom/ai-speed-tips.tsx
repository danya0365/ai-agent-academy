import { Rocket, PenLine, Bookmark, ListChecks } from "lucide-react";
import type { Tip } from "@/lib/tips";

/**
 * Component เฉพาะของเคล็ดลับ "ai-speed-tips" — มีเอกลักษณ์เป็นการ์ดขั้นตอน
 * แบบ numbered step + ไอคอน (ต่างจาก fallback ที่เป็นหัวข้อย่อยธรรมดา)
 *
 * รับ prop { tip } เหมือนทุก custom renderer — จะใช้ field ไหนของ tip ก็ได้
 * ตัวอย่างนี้ออกแบบ layout เองทั้งหมด ไม่พึ่ง tip.sections
 */
const STEPS = [
  {
    icon: PenLine,
    title: "ให้ AI ร่างก่อน แล้วเราค่อยเกลา",
    desc: "อย่าเริ่มจากหน้าจอว่าง ให้ AI ร่างโครงก่อนเสมอ ไม่ว่าจะเป็นอีเมล โพสต์ หรือโค้ด แล้วเราใช้เวลาไปกับการ 'ตรวจและปรับ' ซึ่งเร็วกว่าการเขียนเองจากศูนย์มาก",
    cover: "bg-brand-500",
  },
  {
    icon: Bookmark,
    title: "ทำ prompt แม่แบบเก็บไว้",
    desc: "งานที่ทำซ้ำ ๆ ให้เก็บ prompt ที่ได้ผลไว้เป็นแม่แบบ ครั้งต่อไปแค่เปลี่ยนรายละเอียด ไม่ต้องคิดใหม่ทุกครั้ง",
    cover: "bg-accent-500",
  },
  {
    icon: ListChecks,
    title: "สั่งงานเป็นขั้นตอน",
    desc: "งานใหญ่ให้แตกเป็นขั้น ๆ แล้วให้ AI ทำทีละขั้น จะได้ผลลัพธ์แม่นกว่าการสั่งรวดเดียว",
    cover: "bg-brand-700",
  },
];

export function AiSpeedTips({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <Rocket className="mt-0.5 size-6 shrink-0 text-brand-700" />
        <p className="text-sm leading-relaxed text-foreground">
          {tip.summary} — ทำตาม 3 ขั้นนี้ทุกวัน แล้วจะรู้สึกว่างานที่เคยกินเวลาทั้งเช้า
          เหลือแค่ไม่กี่นาที
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={i} className="card flex gap-4 p-5">
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-border text-on-brand ${step.cover}`}
              >
                <Icon className="size-6" />
              </span>
              <div>
                <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
                  <span className="text-brand-700">{i + 1}.</span>
                  {step.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
