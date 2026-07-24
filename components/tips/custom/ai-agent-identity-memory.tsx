import {
  Bot,
  BrainCircuit,
  FileCode,
  HardDrive,
  Layers,
  Lightbulb,
  Info,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Settings2,
  Box,
  GitBranch,
  UserCircle,
  MessageSquare,
  Hammer,
  ArrowRight,
} from "lucide-react";
import type { Tip } from "@/lib/tips";

// ── Persona Examples ─────────────────────────────────────────────────────────
const PERSONA_STYLES = [
  {
    label: "Persona Table (EGA — Nova)",
    icon: UserCircle,
    code: `| มิติ            | ค่า                                                  |
| --------------- | ---------------------------------------------------- |
| ชื่อ            | **Nova**                                             |
| สรรพนาม         | เรียกผู้ใช้ว่า "พี่" · แทนตัวเองว่า "ผม"              |
| บุคลิก          | คู่หูตรงไปตรงมา — พูดตรง บอกข้อดีข้อเสียชัด           |
| ภาษา            | ไทยเป็นหลัก + ศัพท์เทคนิคอังกฤษ                      |
| บทบาท           | Lead Developer + Architect + Product Partner + Teacher |
| Proactive       | ลุยเสนอได้เลย มองไกลกว่างานตรงหน้า                    |`,
    note: "เหมาะกับโปรเจคที่ต้องการความชัดเจน มีกฎและขอบเขตแน่นอน",
  },
  {
    label: "Persona Narrative (Phoenix)",
    icon: MessageSquare,
    code: `# 🔥 Phoenix - ตัวตนของผม

## 👋 ผมคือใคร
ผมถูกเรียกใช้เมื่อ model อื่นๆ โดน limit...
พร้อมลุกขึ้นมาช่วยคุณทุกครั้ง! 💪🔥

## 🎭 บุคลิกภาพ
- เป็นกันเอง - พูดจาแบบเพื่อนสนิท
- ขี้เล่น - ชอบใส่อีโมจิ
- มั่นใจ - รู้ว่าตัวเองทำอะไรได้ดี

## 💬 สไตล์การสื่อสาร
- ใช้ภาษาไทยเป็นหลัก
- ใช้ technical terms เป็นภาษาอังกฤษ

## ⚖️ กฎเหล็ก
- ห้าม commit โดยไม่ได้รับคำสั่ง`,
    note: "เหมาะกับโปรเจคที่ต้องการความเป็นกันเอง มีตัวตนชัดเจน",
  },
];

// ── Memory Structure ─────────────────────────────────────────────────────────
const MEMORY_FOLDERS = [
  {
    name: "core/",
    desc: "ความรู้ถาวร — persona, conventions, project overview",
    emoji: "🧠",
  },
  {
    name: "decisions/",
    desc: "ADR — ทำไมถึงเลือกทางนี้ (ADR-0001, ADR-0002, ...)",
    emoji: "📐",
  },
  {
    name: "log/",
    desc: "Working log — progress ปัจจุบัน",
    emoji: "📝",
  },
  {
    name: "reference/",
    desc: "เอกสารอ้างอิง — docs, specs",
    emoji: "📚",
  },
  {
    name: "_archive/",
    desc: "เรื่องเก่า — ไม่ active แต่ยังเก็บไว้",
    emoji: "📦",
  },
];

// ── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  {
    icon: UserCircle,
    title: "สร้างตัวตน — AGENTS.md",
    desc: "เขียนว่า AI คนนี้เป็นใคร มีบุคลิกยังไง กฎอะไรบ้าง",
    bullets: [
      "กำหนดชื่อ AI (Nova, Phoenix, หรือชื่อที่ใช่)",
      "กำหนดสรรพนามเรียก user",
      "กำหนดบุคลิก ภาษา บทบาท",
      "กฎเหล็กของโปรเจค (เช่น ห้าม commit โดยไม่สั่ง)",
    ],
    fileHint: "AGENTS.md → root ของโปรเจค",
  },
  {
    icon: FileCode,
    title: "เชื่อมต่อ — CLAUDE.md",
    desc: "แค่บรรทัดเดียว: @AGENTS.md — AI จะโหลดตัวตนโดยอัตโนมัติ",
    codeBlock: `@AGENTS.md`,
    note: "แค่นี้ — ทุกครั้งที่เปิด session ใหม่ AI จะรู้ว่าตัวเองเป็นใครทันที",
  },
  {
    icon: HardDrive,
    title: "ตั้งค่า Memory — settings.json",
    desc: "เปิด autoMemoryDirectory ให้ AI จำ context ตลอดทุก session",
    codeBlock: `{
  "autoMemoryDirectory": "~/<project>/.claude/memory",
  "permissions": {
    "allow": [
      "Bash(npm install)",
      "Bash(npm run *)",
      "Bash(git status*)",
      "Bash(git add*)",
      "Bash(git commit*)"
    ]
  }
}`,
    path: ".claude/settings.json",
    note: "commit เข้า git → clone เครื่องใหม่ก็ใช้งานได้ (ต้อง accept workspace trust 1 ครั้ง)",
  },
  {
    icon: BookOpen,
    title: "สร้าง MEMORY.md — หัวใจของระบบ",
    desc: "index ที่โหลดทุก session — ใช้ชี้ไปยัง topic files ต่างๆ",
    fileHint: ".claude/memory/MEMORY.md",
    codeBlock: `- [Persona](core/persona.md) — ตัวตนของ AI
- [Project Overview](core/project-overview.md) — สถาปัตยกรรม
- [Conventions](core/conventions.md) — มาตรฐานโค้ด
- [ADR-0001](decisions/0001-monorepo.md) — ทำไมถึงเลือก monorepo
- [Progress](log/sprint-3.md) — sprint ปัจจุบัน`,
    note: "MEMORY.md <= 150 บรรทัด — ยิ่งสั้นยิ่งดี เปิดอ่าน topic files เฉพาะอันที่เกี่ยวข้อง (on-demand)",
  },
  {
    icon: Layers,
    title: "เก็บ Topic Files — core/ decisions/ reference/",
    desc: "แยกเป็นหมวด มี YAML frontmatter + เนื้อหา",
    codeBlock: `---
name: nova-persona
description: ตัวตนของ Nova — บุคลิก กฎ บทบาท
metadata:
  type: reference
  status: active
  scope: project
---

# Nova Persona

Nova คือผู้ช่วยประจำโปรเจคนี้...`,
    note: "ทุกไฟล์มี frontmatter — description สำคัญมาก เพราะ AI ใช้อ่านก่อนตัดสินใจเปิด",
  },
];

// ── Toolkit ──────────────────────────────────────────────────────────────────
const TOOLKIT_ITEMS = [
  {
    icon: Settings2,
    title: "Permissions Allowlist",
    desc: "settings.json → pre-approve npm/git/tsx — ไม่ต้องกด allow ทุกที",
  },
  {
    icon: MessageSquare,
    title: "Slash Commands",
    desc: "/new-adr, /archive-memory, /memory-status — สั่งงานเร็วขึ้น",
  },
  {
    icon: Hammer,
    title: "Hooks",
    desc: "PostToolUse auto-format + Stop commit reminder — ไม่ต้องเสียเวลาจำ",
  },
  {
    icon: Box,
    title: "Scoped Rules",
    desc: ".claude/rules/ — โหลดอัตโนมัติเมื่อแตะ path นั้นๆ",
  },
  {
    icon: GitBranch,
    title: "Commit เข้า Git",
    desc: "ทุกอย่างใน .claude/ commit เข้า repo → git clone = ทุกอย่างพร้อม",
  },
];

export function AiAgentIdentityMemory({ tip }: { tip: Tip }) {
  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-5">
        <Bot className="mt-0.5 size-6 shrink-0 text-accent-500" />
        <p className="text-sm leading-relaxed text-foreground">{tip.summary}</p>
      </div>

      {/* Before/After */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Sparkles className="size-5 text-brand-700" />
          ก่อน vs หลังมี Identity+Memory
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="card-flat border-2 border-accent-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-accent-600">
              ❌ ไม่มี
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                เปิด session แต่ AI ไม่รู้จักโปรเจค
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                ต้องบอก tech stack ทุกครั้ง
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent-500" />
                AI ตอบไม่ตรง context
              </li>
            </ul>
          </div>
          <div className="card-flat border-2 border-brand-500/50 bg-muted-surface p-5">
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-brand-700">
              ✅ มี Identity + Memory
            </h3>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                AI รู้บทบาท รู้กฎ รู้โครงสร้างโปรเจค
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                จำ context ได้ตลอดทุก session
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                Clone เครื่องใหม่ → พร้อมทำงานทันที
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Step-by-step guide */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BrainCircuit className="size-5 text-brand-700" />
          ลงมือทำทีละขั้น
        </h2>

        <ol className="mt-4 flex flex-col gap-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li key={i} className="card flex gap-4 p-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-brand-500 text-on-brand">
                  <Icon className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
                    <span className="text-brand-700">{i + 1}.</span>
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {step.desc}
                  </p>

                  {step.fileHint && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-muted-surface px-3 py-2 font-mono text-xs font-semibold text-foreground">
                      <FileCode className="size-3.5 text-muted" />
                      {step.fileHint}
                    </div>
                  )}

                  {step.path && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border bg-muted-surface px-3 py-2 font-mono text-xs font-semibold text-foreground">
                      <Settings2 className="size-3.5 text-muted" />
                      {step.path}
                    </div>
                  )}

                  {step.bullets && (
                    <ul className="mt-3 flex flex-col gap-2">
                      {step.bullets.map((b, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
                        >
                          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-700" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {step.codeBlock && (
                    <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-card p-3 text-xs leading-relaxed">
                      <code>{step.codeBlock}</code>
                    </pre>
                  )}

                  {step.note && (
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-muted-surface p-3">
                      <Info className="mt-0.5 size-4 shrink-0 text-brand-700" />
                      <p className="text-xs leading-relaxed text-muted">
                        {step.note}
                      </p>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Persona Styles — 2 แบบ */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <UserCircle className="size-5 text-brand-700" />
          ตัวอย่าง Persona — เลือกแบบที่ใช่
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          {PERSONA_STYLES.map((style, i) => {
            const Icon = style.icon;
            return (
              <div key={i} className="card-flat overflow-hidden bg-muted-surface">
                <div className="flex items-center gap-3 bg-brand-500/10 px-5 py-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-on-brand">
                    <Icon className="size-4" />
                  </span>
                  <h3 className="text-sm font-extrabold text-foreground">
                    {style.label}
                  </h3>
                </div>
                <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
                  <code>{style.code}</code>
                </pre>
                <div className="flex items-start gap-2 border-t border-border px-5 py-3">
                  <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-brand-700" />
                  <p className="text-xs leading-relaxed text-muted">
                    {style.note}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Memory Folder Structure */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <BookOpen className="size-5 text-brand-700" />
          โครงสร้าง Memory System
        </h2>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {MEMORY_FOLDERS.map((f, i) => (
            <div key={i} className="card-flat bg-muted-surface p-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand-500/10 text-base">
                  {f.emoji}
                </span>
                <code className="text-sm font-bold text-foreground">{f.name}</code>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl border-2 border-accent-500 bg-muted-surface p-3">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent-500" />
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-bold text-foreground">จำไว้:</span>{" "}
            Topic file เปิดอ่านเมื่อ related—AI อ่าน description ใน MEMORY.md
            ถ้า match ถึงจะเปิด — เก็บได้เป็นร้อยโดยไม่เปลือง context
          </p>
        </div>
      </section>

      {/* Advanced Toolkit */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Box className="size-5 text-brand-700" />
          ขั้นสูง: Agent Toolkit (Optional)
        </h2>

        <p className="mt-2 text-sm leading-relaxed text-muted">
          เมื่อมี Identity + Memory แล้ว ต่อไปเพิ่มประสิทธิภาพด้วย:
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {TOOLKIT_ITEMS.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className="card-flat bg-muted-surface p-4">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-on-brand">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {t.title}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-card p-3">
          <ArrowRight className="size-4 shrink-0 text-brand-700" />
          <p className="text-xs leading-relaxed text-muted">
            ดูตัวอย่างเต็มๆ ได้จากโปรเจค{" "}
            <span className="font-semibold text-foreground">easy-game-arena</span>{" "}
            — มีครบทุกอย่าง: commands, hooks, rules, plans
          </p>
        </div>
      </section>

      {/* Prompt templates */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Lightbulb className="size-5 text-brand-700" />
          Prompt ตัวอย่าง — คัดลอกไปใช้ได้เลย
        </h2>

        <div className="mt-4 flex flex-col gap-4">
          {/* Prompt 1 */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-brand-500/10 px-5 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-on-brand">
                <Bot className="size-5" />
              </span>
              <h3 className="text-sm font-extrabold text-foreground">
                Prompt: ให้ Claude สร้าง AGENTS.md
              </h3>
            </div>
            <pre className="overflow-x-auto bg-card p-4 text-xs leading-relaxed">
              <code>{`สร้าง AGENTS.md สำหรับโปรเจคนี้ให้หน่อย

ผมอยากให้ AI มีตัวตนเป็น "นักสืบไซเบอร์" ชื่อ "Detective Byte"
ที่คอยช่วย debug และหา security issue

รายละเอียด:
- เรียกผมว่า "หัวหน้า"
- แทนตัวเองว่า "ผม"
- บุคลิก: สุภาพ ตรงไปตรงมา เน้นหลักฐาน
- ภาษา: ไทย + อังกฤษ (technical terms)
- กฎเหล็ก: ห้าม deploy โดยไม่ review ก่อน
- ชอบขึ้นต้นด้วย "🕵️"

เขียนเป็นรูปแบบ Markdown ให้สวยงามหน่อย`}</code>
            </pre>
          </div>

          {/* Prompt 2 */}
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border bg-brand-500/10 px-5 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-on-brand">
                <HardDrive className="size-5" />
              </span>
              <h3 className="text-sm font-extrabold text-foreground">
                Prompt: ตั้งค่า Memory System
              </h3>
            </div>
            <pre className="overflow-x-auto bg-card p-4 text-xs leading-relaxed">
              <code>{`ช่วยตั้งค่า Memory System สำหรับโปรเจคนี้

1. สร้าง .claude/settings.json โดยมี:
   - autoMemoryDirectory ชี้ไป .claude/memory
   - permissions allow: npm install, npm run *, git status/add/commit/diff/log

2. สร้าง MEMORY.md index ใน .claude/memory/
   - ชี้ไป core/project-overview.md (พื้นฐาน)
   - ชี้ไป core/conventions.md (standard)

3. สร้าง core/project-overview.md
   - อธิบายว่าโปรเจคนี้คืออะไร
   - tech stack
   - โครงสร้างไฟล์หลัก`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Key Takeaways */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <CheckCircle2 className="size-5 text-brand-700" />
          Key Takeaways
        </h2>

        <ul className="mt-3 flex flex-col gap-2">
          {[
            {
              title: "Identity + Memory = Foundation",
              desc: "AGENTS.md + autoMemoryDirectory = พื้นฐานที่ทำให้ AI ไม่ลืม — ใช้เวลาทั้งหมดไม่เกิน 5 นาที",
            },
            {
              title: "เริ่มน้อยๆ ก่อน",
              desc: "แค่ AGENTS.md + memory 1 ไฟล์ก็ดีกว่าไม่มี — ค่อยขยับไปมี commands, hooks, rules ทีหลัง",
            },
            {
              title: "Commit เข้า Git = Portable",
              desc: "ทุกอย่างใน .claude/ commit เข้า repo — clone เครื่องใหม่ accept workspace trust แค่นั้นก็พร้อมทำงาน",
            },
            {
              title: "มีตัวตน = AI ตอบตรง Context",
              desc: "รู้บทบาท รู้กฎ รู้โครงสร้าง — prompt สั้นลง ผลลัพธ์แม่นขึ้น เพราะ AI 'เข้าใจ' ว่ามันต้องทำอะไร",
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

      {/* สรุป */}
      <div className="card-flat flex items-start gap-3 bg-muted-surface p-4">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-brand-700" />
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-bold">5 นาทีสร้าง Identity + Memory</span>{" "}
          = ไม่ต้องอธิบายอะไรซ้ำอีก AI จะมีตัวตน รู้บทบาท จำ context ได้เอง
          clone เครื่องใหม่ก็พร้อม — ถ้ายังไม่เคยทำ ลองเริ่มตั้งแต่วันนี้ครับ! 🔥
        </p>
      </div>
    </div>
  );
}
