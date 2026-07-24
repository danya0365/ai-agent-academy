import {
  Sparkles,
  Lightbulb,
  Info,
  CheckCircle2,
  XCircle,
  Wallet,
  PenLine,
  Smartphone,
  GraduationCap,
  ShieldAlert,
  Target,
  BrainCircuit,
  Users,
  MessageSquareText,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

// ── 3 ช่องทาง ─────────────────────────────────────────────────────────────────
type Channel = {
  icon: typeof PenLine;
  emoji: string;
  title: string;
  subtitle: string;
  tag: string;
  color: "brand" | "accent" | "brand-dark";
  desc: string;
  before: string;
  after: string;
  platforms: string[];
  tips: string[];
  proTip: string;
};

const CHANNELS: Channel[] = [
  {
    icon: PenLine,
    emoji: "✍️",
    title: "รับงานเขียน/แปล",
    subtitle: "รายได้ทางแรกที่เริ่มง่ายที่สุด",
    tag: "เริ่มได้วันนี้",
    color: "brand",
    desc: "ตลาด Content Marketing โตทุกปี — แคปชันโฆษณา บทความ SEO สคริปต์ TikTok หรือแปลเอกสาร มีแต่คนจ้าง",
    before: "รับได้วันละ 1-2 งาน เขียนเองทุกบรรทัด",
    after: "รับได้ 5-10 งานต่อวัน — ใช้ AI ร่าง เราเกลา",
    platforms: ["Fastwork", "Talontal", "ProFast", "Facebook Groups"],
    tips: [
      "สร้าง portfolio 5 งานก่อน — ให้ AI ช่วยเขียนตัวอย่าง",
      "ตั้งราคาต่ำกว่าตลาด 20% แรกเริ่ม สะสมรีวิว",
      "งาน AI ร่าง → เราเกลาภาษาให้เป็นธรรมชาติ → ส่ง",
    ],
    proTip: "โปรไฟล์สำคัญกว่าฝีมือในระยะแรก — ลงทุนทำรูปโปรไฟล์ + ตัวอย่างงานให้สวย AI ช่วยได้เยอะ",
  },
  {
    icon: Smartphone,
    emoji: "📱",
    title: "ทำคอนเทนต์ลงโซเชียล",
    subtitle: "Content = Asset ที่ขายได้เรื่อยๆ",
    tag: "สร้างทรัพย์สิน",
    color: "accent",
    desc: "คอนเทนต์ดีๆ ลงครั้งเดียว — แต่มันสร้างรายได้ซ้ำๆ ผ่านโฆษณา Affiliate หรือ Sponsorship",
    before: "คิดเนื้อหาไม่ออก เขียนช้า ทำคลิปไม่เป็น",
    after: "AI คิดหัวข้อให้ 50 ข้อใน 10 วิ → เขียนสคริปต์ → ถ่าย",
    platforms: ["YouTube", "TikTok", "Facebook Page", "Medium"],
    tips: [
      "เลือก 1 Platform ก่อน — อย่ากระจาย",
      "AI ช่วย brainstorm หัวข้อ + เขียนสคริปต์ + เขียนแคปชัน",
      "ลงสม่ำเสมอ 3-4 ครั้ง/สัปดาห์ — ค่อยขยาย",
    ],
    proTip: "หา Niche ที่คุณรู้จริง + มีคนอยากรู้ — เช่น AI สำหรับคนทำบัญชี, ChatGPT สำหรับคนขายของออนไลน์ — คู่แข่งน้อยกว่า",
  },
  {
    icon: GraduationCap,
    emoji: "🎓",
    title: "สอนสิ่งที่คุณรู้",
    subtitle: "Passive Income ที่แท้จริง",
    tag: "สอนครั้งเดียว ขายซ้ำได้",
    color: "brand-dark",
    desc: "ทุกคนมีความรู้ที่คนอื่นยอมจ่ายเงิน — ไม่ต้องเป็น Expert แค่รู้มากกว่าคนเริ่มต้นก็สอนได้",
    before: "สอนสดทีละคน ได้เงินทีละ 300 บาท",
    after: "อัดคอร์สครั้งเดียว — ขายได้เรื่อยๆ ผ่าน Platform",
    platforms: ["Skilllane", "Longdo Course", "YouTube", "Facebook Group"],
    tips: [
      "AI ช่วยออกแบบโครงสร้างคอร์ส + เขียนสไลด์ + ทำแบบฝึกหัด",
      "เริ่มจากคอร์สสั้น ฟรี หรือราคาถูก — สะสมรีวิว",
      "พอมีชื่อเสียง — ค่อยปล่อยคอร์สแพงหรือทำแบบตัวต่อตัว",
    ],
    proTip: "หัวข้อ 'AI สำหรับ X' ขายดีมากตอนนี้ — เช่น AI สำหรับครู, AI สำหรับช่างภาพ, AI สำหรับแม่บ้าน",
  },
];

// ── Before/After ───────────────────────────────────────────────────────────────
const COMPARISON = {
  before: [
    "ไม่รู้จะเริ่มช่องทางไหน",
    "กลัวต้องลงทุนก่อน",
    "ทำงานคนละ — ได้เงินวันละนิด",
    "ไม่รู้จะใช้ AI ช่วยตรงไหน",
  ],
  after: [
    "มี 3 ช่องทางชัดเจน เริ่มได้ทันที",
    "ใช้ทุน 0 — แค่คอมฯ + เน็ต",
    "AI ช่วยเร่งความเร็ว 5-10 เท่า",
    "รายได้หลายทาง — ลดความเสี่ยง",
  ],
};

// ── Warnings ───────────────────────────────────────────────────────────────────
const WARNINGS = [
  {
    title: "ตรวจทุกงานก่อนส่ง",
    desc: "AI ช่วยร่างได้ แต่ข้อมูลมั่ว เลขผิด หรือ Tone ไม่ตรง เกิดขึ้นได้ — ตรวจเสมอก่อนส่งลูกค้า",
  },
  {
    title: "อย่าสัญญาเกินจริง",
    desc: '"รวยใน 7 วัน" หรือ "การันตีรายได้ 50k" = ตัด credibility ทิ้ง บอกความจริงว่าต้องใช้เวลา',
  },
  {
    title: "ยิ่งใช้ AI = ยิ่งต้องใส่ใจคุณภาพ",
    desc: "ตลาดแข่งสูงขึ้นเรื่อยๆ — คนที่อยู่รอดคือคนที่ Quality ดี ไม่ใช่คนที่ Quantity เ� تط",
  },
  {
    title: "สร้างแบรนด์ตัวเอง",
    desc: "คนจ้างเพราะ 'คุณ' ไม่ใช่เพราะ AI — สร้างเอกลักษณ์ ความน่าเชื่อถือ และชื่อเสียง",
  },
];

export function AiSideIncome({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <Wallet className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* ก่อน vs หลัง */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sparkles className="size-5 text-brand-700" />
          ก่อน vs หลัง ใช้ AI หารายได้
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card-flat border-2 border-accent-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-accent-600">
              ❌ ก่อน
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              {COMPARISON.before.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card-flat border-2 border-brand-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-brand-700">
              ✅ หลัง
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              {COMPARISON.after.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 3 ช่องทาง */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BrainCircuit className="size-5 text-brand-700" />
          3 ช่องทางหารายได้เสริมด้วย AI
        </h2>

        <div className="mt-4 flex flex-col gap-5">
          {CHANNELS.map((ch, i) => {
            const Icon = ch.icon;
            const isBrand = ch.color === "brand";
            const isAccent = ch.color === "accent";
            return (
              <div key={i} className="card overflow-hidden">
                {/* Header */}
                <div
                  className={`flex items-center gap-3 px-5 py-4 ${
                    isBrand
                      ? "bg-brand-500/10"
                      : isAccent
                        ? "bg-accent-500/10"
                        : "bg-brand-700/10"
                  }`}
                >
                  <span
                    className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
                      isBrand
                        ? "bg-brand-500 text-on-brand"
                        : isAccent
                          ? "bg-accent-500 text-on-brand"
                          : "bg-brand-700 text-on-brand"
                    } text-xl leading-none`}
                  >
                    {ch.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-foreground">
                      {ch.title}
                      <span
                        className={`badge ${
                          isBrand
                            ? "bg-brand-500/10 text-brand-700"
                            : isAccent
                              ? "bg-accent-500/10 text-accent-800"
                              : "bg-brand-700/10 text-brand-700"
                        }`}
                      >
                        {ch.tag}
                      </span>
                    </h3>
                    <p className="text-xs text-muted">{ch.subtitle}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-4 p-5">
                  <p className="text-sm leading-relaxed text-muted">{ch.desc}</p>

                  {/* Before/After */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border-2 border-accent-500/40 bg-muted-surface p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-600">
                        <XCircle className="size-3.5" />
                        ❌ ก่อน
                      </div>
                      <p className="mt-1 text-sm text-muted">{ch.before}</p>
                    </div>
                    <div className="rounded-xl border-2 border-brand-500/40 bg-muted-surface p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
                        <CheckCircle2 className="size-3.5" />
                        ✅ หลัง
                      </div>
                      <p className="mt-1 text-sm text-foreground">{ch.after}</p>
                    </div>
                  </div>

                  {/* Platforms */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Users className="size-3.5 text-brand-700" />
                      แพลตฟอร์ม
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {ch.platforms.map((p, j) => (
                        <span
                          key={j}
                          className="badge bg-muted-surface text-muted"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                      <Target className="size-3.5 text-brand-700" />
                      วิธีเริ่ม
                    </div>
                    <ol className="mt-1.5 flex flex-col gap-1.5">
                      {ch.tips.map((t, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                        >
                          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-muted-surface text-[11px] font-bold text-muted">
                            {j + 1}
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Pro Tip */}
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
                    <p className="text-xs leading-relaxed text-muted">
                      <span className="font-bold text-foreground">Pro tip: </span>
                      {ch.proTip}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ⚠️ ข้อควรระวัง */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <ShieldAlert className="size-5 text-accent-500" />
          ⚠️ ข้อควรระวัง — AI ช่วยได้ แต่ความน่าเชื่อถือคือของคุณ
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {WARNINGS.map((w, i) => (
            <div key={i} className="card-flat bg-muted-surface p-4">
              <p className="text-sm font-bold text-foreground">{w.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{w.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-accent-500 bg-muted-surface p-3">
          <Info className="mt-0.5 size-4 shrink-0 text-accent-500" />
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-bold text-foreground">กฎเหล็ก: </span>
            ตรวจทุกงานก่อนส่ง เหมือนไม่มี AI อยู่ — แล้วคุณจะแตกต่างจากคนอื่น
          </p>
        </div>
      </section>

      {/* Key Takeaways */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Target className="size-5 text-brand-700" />
          Key Takeaways
        </h2>

        <ul className="mt-3 flex flex-col gap-2">
          {[
            {
              title: "เริ่มจาก 1 ช่องทางก่อน",
              desc: "เลือกช่องทางที่ถนัดที่สุด — รับเขียน / ทำคอนเทนต์ / สอน — แล้วค่อยขยาย",
            },
            {
              title: "AI = เครื่องเร่งความเร็ว",
              desc: "ใช้ AI ร่าง/คิด/วางแผน แต่ 'คุณ' ต้องตรวจและเกลา — Quality สำคัญกว่า Quantity",
            },
            {
              title: "สร้างชื่อก่อนสร้างรายได้",
              desc: "โปรไฟล์ + รีวิว + ความน่าเชื่อถือ = สิ่งที่ทำให้คนจ้าง คุณ — ลงทุนกับสิ่งเหล่านี้",
            },
          ].map((k, i) => (
            <li key={i} className="card-flat flex gap-3 bg-muted-surface p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-extrabold text-on-brand">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{k.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">
                  {k.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">เริ่มตั้งแต่วันนี้</span>{" "}
          — เลือก 1 ช่องทาง ลงทุน 0 บาท มีแค่คอมฯ กับเน็ตก็เริ่มได้
          AI ช่วยให้คุณเร็วขึ้น 5 เท่า แต่ความน่าเชื่อถือคือสิ่งที่ทำให้คุณแตกต่าง 🔥
        </p>
      </div>
    </div>
  );
}
