import {
  Sparkles,
  Lightbulb,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Camera,
  Image as ImageIcon,
  Shirt,
  Megaphone,
  Target,
  BrainCircuit,
  Users,
  Palette,
  Zap,
  Wand2,
  DollarSign,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

// ── 4 เทคนิค ──────────────────────────────────────────────────────────────────
type Technique = {
  icon: typeof Camera;
  emoji: string;
  title: string;
  subtitle: string;
  tool: string;
  tools: string[];
  color: "brand" | "accent" | "brand-dark" | "accent-dark";
  before: string;
  after: string;
  prompt?: string;
  proTip: string;
};

const TECHNIQUES: Technique[] = [
  {
    icon: Camera,
    emoji: "📸",
    title: "รูปพื้นหลังขาว",
    subtitle: "สร้างจาก AI ตั้งแต่ต้น",
    tool: "Bing Image Creator",
    tools: ["Bing Image Creator", "Leonardo AI", "Ideogram"],
    color: "brand",
    before: "จ้างช่างภาพ 500-2,000 บาท / set",
    after: "พิมพ์ prompt → AI สร้างให้ ฟรี! ไม่กี่วิ",
    prompt:
      'prompt: "product photography of [สินค้า] on white background, studio lighting, soft shadows, high angle, 4k product shot, minimalist"',
    proTip:
      "คำ magic: 'product photography' + 'white background' + 'studio lighting' = ผลลัพธ์ตรงกว่า 10 เท่า",
  },
  {
    icon: ImageIcon,
    emoji: "🎨",
    title: "เปลี่ยนพื้นหลัง",
    subtitle: "ลบพื้นหลัง 3 วิ",
    tool: "remove.bg",
    tools: ["remove.bg", "Adobe Express BG", "Canva BG Remover"],
    color: "accent",
    before: "ต้องจัดสตูดิโอ ถ่ายบนพื้นสี / ฉาก",
    after: "ถ่ายด้วยมือถือ → อัพ → AI ลบ BG → เลือก BG ใหม่",
    prompt: "อัพรูป →เลือกพื้นหลัง: สีขาว / เกรเดียนต์ / BG ร้านค้า / ฤดูกาล",
    proTip:
      "ถ่ายรูปสินค้าบนพื้นสีเรียบ (ขาว/เทา) ก่อน — AI จะลบพื้นหลังได้เนียนกว่า ไม่เป็นรอย",
  },
  {
    icon: Shirt,
    emoji: "🕺",
    title: "Lifestyle Shot",
    subtitle: "ให้เห็นว่าสวมใส่แล้วเป็นไง",
    tool: "Clipdrop / Firefly",
    tools: ["Clipdrop", "Adobe Photoshop AI (Firefly)", "DALL-E 3"],
    color: "brand-dark",
    before: "จ้างนายแบบ + ช่างภาพ = 5,000+ บาท",
    after: "รูปคนจาก Unsplash + รูปสินค้า → AI รวมให้ ฟรี",
    prompt:
      '"a woman wearing [สินค้า] in a coffee shop, candid shot, natural light, lifestyle photography, authentic"',
    proTip:
      "Lifestyle shot เพิ่ม Conversion 30-50% เทียบกับรูปพื้นหลังขาวเฉยๆ — ลงทุนทำสัก 1-2 รูปคุ้มมาก",
  },
  {
    icon: Megaphone,
    emoji: "📢",
    title: "Banner + ปกไลฟ์",
    subtitle: "ครบชุดพร้อมโปรโมท",
    tool: "Canva AI",
    tools: ["Canva AI", "Adobe Firefly", "Microsoft Designer"],
    color: "accent-dark",
    before: "จ้างกราฟิก 800-3,000 บาท / แบนเนอร์",
    after: "เลือก template → AI generate → แก้ไขนิดหน่อย → ลงได้เลย",
    prompt:
      "Banner 1080×1080: รูปสินค้าชัด + ชื่อร้าน + ราคา + CTA 'สั่งซื้อเลย'",
    proTip:
      "มี Banner อย่างน้อย 3 แบบ: Facebook Post (1080×1080), Shopee (1600×600), IG Story (1080×1920)",
  },
];

// ── Before/After ───────────────────────────────────────────────────────────────
const COMPARISON = {
  before: [
    "จ้างช่างภาพ 500-2,000+ บาทต่อ set",
    "ต้องมีสตูดิโอ / ฉาก / ไฟ",
    "ถ่ายเองก็ไม่สวย ขายไม่ได้",
    "เปลี่ยนรูปแต่ละครั้งเสียเงินอีก",
  ],
  after: [
    "ใช้ AI สร้างรูป ฟรี! ไม่กี่วิ",
    "แค่มีมือถือ + internet ก็เริ่มได้",
    "รูปสวยระดับโปร สินค้าดูมีมูลค่า",
    "เปลี่ยนเมื่อไหร่ก็ได้ ไม่เสียเงิน",
  ],
};

// ── Tools Comparison ───────────────────────────────────────────────────────────
const TOOLS = [
  { name: "Bing Image Creator", free: true, best: "สร้างรูปจาก prompt", url: "bing.com/create" },
  { name: "Leonardo AI", free: true, best: "ปรับรายละเอียดรูปเยอะ", url: "leonardo.ai" },
  { name: "remove.bg", free: true, best: "ลบพื้นหลังอัตโนมัติ", url: "remove.bg" },
  { name: "Canva AI", free: true, best: "Banner + ปกไลฟ์", url: "canva.com" },
  { name: "Clipdrop", free: true, best: "รวมรูปคน + สินค้า", url: "clipdrop.co" },
  { name: "Adobe Firefly", free: true, best: "AI image generation", url: "firefly.adobe.com" },
];

export function AiProductPhotography({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <Camera className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* ก่อน vs หลัง */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sparkles className="size-5 text-brand-700" />
          จ้างช่างภาพ vs ใช้ AI
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card-flat border-2 border-accent-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-accent-600">
              ❌ จ้างช่างภาพ
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
              ✅ ใช้ AI
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

      {/* 4 เทคนิค */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BrainCircuit className="size-5 text-brand-700" />
          4 เทคนิคเปลี่ยนรูปขายของด้วย AI
        </h2>

        <div className="mt-4 flex flex-col gap-5">
          {TECHNIQUES.map((t, i) => {
            const Icon = t.icon;
            const isBrand = t.color === "brand";
            const isAccent = t.color === "accent";
            return (
              <div key={i} className="card overflow-hidden">
                {/* Header strip */}
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
                        ? "bg-brand-500"
                        : isAccent
                          ? "bg-accent-500"
                          : "bg-brand-700"
                    } text-xl leading-none text-on-brand`}
                  >
                    {t.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 text-base font-extrabold text-foreground">
                      <span
                        className={`flex size-6 items-center justify-center rounded-lg text-xs font-bold text-on-brand ${
                          isBrand
                            ? "bg-brand-700"
                            : isAccent
                              ? "bg-accent-700"
                              : "bg-brand-700"
                        }`}
                      >
                        {i + 1}
                      </span>
                      {t.title}
                    </h3>
                    <span className="text-xs text-muted">
                      {t.subtitle} — <span className="font-semibold text-foreground">{t.tool}</span>
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col gap-4 p-5">
                  {/* Tools tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {t.tools.map((tool, j) => (
                      <span key={j} className="badge bg-muted-surface text-muted">
                        <Zap className="size-3" />
                        {tool}
                      </span>
                    ))}
                  </div>

                  {/* Before/After */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border-2 border-accent-500/40 bg-muted-surface p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-600">
                        <XCircle className="size-3.5" />
                        ❌ แบบเดิม
                      </div>
                      <p className="mt-1 text-sm text-muted">{t.before}</p>
                    </div>
                    <div className="rounded-xl border-2 border-brand-500/40 bg-muted-surface p-3">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-700">
                        <CheckCircle2 className="size-3.5" />
                        ✅ แบบ AI
                      </div>
                      <p className="mt-1 text-sm text-foreground">{t.after}</p>
                    </div>
                  </div>

                  {/* Prompt */}
                  {t.prompt && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-foreground">
                        <Wand2 className="size-3.5 text-brand-700" />
                        Prompt ตัวอย่าง
                      </div>
                      <pre className="mt-1.5 overflow-x-auto rounded-xl border-2 border-brand-500/30 bg-muted-surface px-4 py-3 text-xs leading-relaxed text-foreground">
                        <code>{t.prompt}</code>
                      </pre>
                    </div>
                  )}

                  {/* Pro Tip */}
                  <div className="flex items-start gap-2 rounded-xl border border-border bg-card p-3">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
                    <p className="text-xs leading-relaxed text-muted">
                      <span className="font-bold text-foreground">Pro tip: </span>
                      {t.proTip}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tools comparison */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Palette className="size-5 text-brand-700" />
          AI Tools ฟรีที่แนะนำ
        </h2>

        <div className="card-flat mt-3 overflow-hidden bg-muted-surface">
          <div className="grid grid-cols-12 border-b border-border text-xs font-bold uppercase tracking-wider text-muted">
            <div className="col-span-4 px-4 py-3">Tool</div>
            <div className="col-span-3 px-4 py-3 text-center">ราคา</div>
            <div className="col-span-5 px-4 py-3">ใช้ทำ</div>
          </div>
          {TOOLS.map((tool, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 text-sm ${
                i % 2 === 0 ? "bg-card/50" : ""
              }`}
            >
              <div className="col-span-4 px-4 py-3 font-semibold text-foreground">
                {tool.name}
              </div>
              <div className="col-span-3 flex items-center justify-center px-4 py-3">
                {tool.free ? (
                  <span className="badge bg-brand-500/10 text-brand-700">ฟรี</span>
                ) : (
                  <span className="badge bg-accent-500/10 text-accent-700">เสียเงิน</span>
                )}
              </div>
              <div className="col-span-5 flex items-center px-4 py-3 text-muted">
                {tool.best}
              </div>
            </div>
          ))}
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
              title: "AI ทำรูปขายของได้ — ฟรี!",
              desc: "Bing Image Creator, remove.bg, Canva AI — ทั้งหมดใช้ฟรี ไม่ต้องจ้างช่างภาพ",
            },
            {
              title: "เริ่มจากพื้นหลังขาวก่อน",
              desc: "รูปพื้นหลังขาว = พื้นฐาน最重要 ลองใช้ remove.bg ลบ BG แล้วใส่สีขาว — ง่ายที่สุด",
            },
            {
              title: "Lifestyle Shot = ขายดีขึ้น",
              desc: "รูปมีคนใช้สินค้าเพิ่ม Conversion 30-50% — ทำสัก 1-2 รูปก็คุ้ม",
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
          <span className="font-bold">เริ่มวันนี้!</span>{" "}
          หยิบรูปสินค้าขึ้นมา 1 รูป → ลองใช้ remove.bg ลบพื้นหลัง → แล้วสร้างรูปพื้นหลังขาวด้วย Bing Image Creator
          แค่ 10 นาทีคุณก็มีรูปขายของสวยๆ โดยไม่ต้องจ้างใครแล้ว 🔥
        </p>
      </div>
    </div>
  );
}
