// UI สลับ template + dark — วางบน navbar
//  ใช้ utility ที่ผูกกับ token: bg-muted-surface, bg-brand-500, text-on-brand, text-muted, text-foreground
//  ปุ่ม active ใช้ text-on-brand (ไม่ใช่ text-white) เพื่อให้ dark mode อ่านออกทุกธีม
"use client";

import { Zap, Waves, Grape, Sun, Moon, type LucideIcon } from "lucide-react";
import { useThemeStore, type ThemeTemplate } from "@/lib/theme/theme-store";
import { cn } from "@/lib/cn";

const TEMPLATES: { value: ThemeTemplate; label: string; icon: LucideIcon }[] = [
  { value: "bold", label: "Bold", icon: Zap },
  { value: "ocean", label: "Ocean", icon: Waves },
  { value: "grape", label: "Grape", icon: Grape },
];

// compact = icon-only เสมอ (ตัด text label ทิ้ง) — ใช้ในที่แคบ เช่น desktop sidebar (w-72)
//   default = responsive เดิม (โชว์ label ตั้งแต่ lg ขึ้นไป)
export function ThemeSwitcher({ compact = false }: { compact?: boolean } = {}) {
  const template = useThemeStore((s) => s.template);
  const dark = useThemeStore((s) => s.dark);
  const setTemplate = useThemeStore((s) => s.setTemplate);
  const toggleDark = useThemeStore((s) => s.toggleDark);

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-muted-surface p-1",
        compact && "w-full", // เต็มความกว้าง parent เพื่อให้ปุ่มกระจาย flex-1 เท่าๆ กัน
      )}
    >
      {TEMPLATES.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => setTemplate(t.value)}
            title={t.label}
            aria-pressed={template === t.value}
            className={cn(
              "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-sm font-medium transition",
              compact && "flex-1", // แบ่งพื้นที่เท่าๆ กันตอน compact
              template === t.value
                ? "bg-brand-500 text-on-brand"
                : "text-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {!compact && <span className="ml-1 hidden lg:inline">{t.label}</span>}
          </button>
        );
      })}
      <button
        type="button"
        onClick={toggleDark}
        title={dark ? "โหมดสว่าง" : "โหมดมืด"}
        aria-pressed={dark}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-2.5 py-1 text-sm text-muted transition hover:text-foreground",
          compact && "flex-1",
        )}
      >
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </div>
  );
}
