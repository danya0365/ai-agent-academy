// AppShell — responsive shell (breakpoint เดียว: lg)
//   mobile (< lg) = slim top bar (แบรนด์) + เนื้อหาเต็มกว้าง + floating bottom tabbar (4 แท็บ + ปุ่มบัญชี/เพิ่มเติม)
//   desktop (≥ lg) = left sidebar (เมนูครบจัดกลุ่ม scroll ได้) + เนื้อหา cap ความกว้าง
// เรนเดอร์ทั้ง 2 nav ใน DOM แล้ว toggle ด้วย lg: class → SSR-safe (ไม่ใช้ matchMedia)
// nav.ts = source of truth เดียว
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogIn } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { AppVersion } from "@/components/app-version";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { AccountSheet } from "@/components/shell/account-sheet";
import { cn } from "@/lib/cn";
import {
  NAV_GROUPS,
  NAV_ITEMS,
  canSee,
  tabbarItems,
  type NavItem,
  type ShellUser,
} from "@/components/shell/nav";

const BrandMark = ({ size = "h-9 w-9" }: { size?: string }) => (
  <span
    className={cn(
      "flex items-center justify-center rounded-xl border-2 border-border bg-brand-500 text-on-brand",
      size,
    )}
  >
    AI
  </span>
);

export function AppShell({
  user,
  children,
}: {
  user: ShellUser | null;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const [sheetOpen, setSheetOpen] = useState(false);

  // ปุ่มบัญชี active เมื่ออยู่ปลายทางที่ผูกกับ "บัญชี"
  const accountActive =
    pathname.startsWith("/account") ||
    pathname.startsWith("/my-courses") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  return (
    <div className="lg:flex lg:min-h-screen">
      {/* Desktop-only left sidebar (ซ่อนบนมือถือ) */}
      <Sidebar user={user} pathname={pathname} />

      {/* Content column */}
      <div className="flex min-h-screen flex-1 flex-col lg:min-w-0">
        {/* Mobile slim top bar — โลโก้แบรนด์ (desktop โชว์แบรนด์ใน sidebar แล้ว) */}
        <header className="sticky top-0 z-20 flex items-center border-b-2 border-border bg-background/90 px-4 py-2.5 backdrop-blur lg:hidden">
          <Link href="/" className="flex items-center gap-2 text-base font-extrabold text-foreground">
            <BrandMark size="h-8 w-8" />
            AI Agent Academy
          </Link>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-4 pb-6 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
          {children}
        </main>

        {/* Mobile-only footer (desktop footer อยู่ท้าย sidebar) — pb-32 เผื่อ floating tabbar ทับ */}
        <footer className="px-4 pt-2 pb-32 text-center lg:hidden">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            <a href="/terms" className="font-bold text-brand-700 hover:underline">
              ข้อกำหนด
            </a>
            <a href="/privacy" className="font-bold text-brand-700 hover:underline">
              นโยบายความเป็นส่วนตัว
            </a>
          </div>
          <AppVersion className="mt-1 block" />
        </footer>
      </div>

      {/* Mobile floating bottom tabbar (< lg) */}
      <nav
        data-testid="tabbar"
        className="fixed left-1/2 z-30 flex h-17 w-[calc(100%-24px)] max-w-115 -translate-x-1/2 items-center justify-between gap-1 rounded-[26px] border-2 border-border bg-card px-2 shadow-lg lg:hidden bottom-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        {tabbarItems.map((item) => (
          <TabButton key={item.href} item={item} pathname={pathname} />
        ))}

        {/* ปุ่มบัญชี/เพิ่มเติม (รวม) */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-label={user ? "บัญชีและเมนูเพิ่มเติม" : "เข้าสู่ระบบและเมนู"}
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-1.5",
            accountActive ? "text-brand-600" : "text-muted",
          )}
        >
          <span
            className={cn(
              "grid h-9 w-9 place-items-center rounded-xl transition-colors",
              !user && accountActive && "bg-brand-500 text-on-brand",
            )}
          >
            {user ? (
              <Avatar
                name={user.name}
                image={user.image}
                size={28}
                className={cn(accountActive && "ring-2 ring-brand-500")}
              />
            ) : (
              <LogIn className="size-5" />
            )}
          </span>
          <span className="text-[0.62rem] font-semibold leading-none">
            {user ? "บัญชี" : "เข้าสู่ระบบ"}
          </span>
        </button>
      </nav>

      {/* Mobile account/more sheet */}
      <AccountSheet open={sheetOpen} onClose={() => setSheetOpen(false)} user={user} />
    </div>
  );
}

// ── Mobile tabbar item ──
function TabButton({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const on = item.match(pathname);
  return (
    <Link
      href={item.href}
      aria-current={on ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 py-1.5",
        on ? "text-brand-600" : "text-muted",
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-xl transition-colors",
          on && "bg-brand-500 text-on-brand",
        )}
      >
        <Icon className="size-5" />
      </span>
      <span className="text-[0.62rem] font-semibold leading-none">
        {item.short ?? item.label}
      </span>
    </Link>
  );
}

// ── Desktop sidebar (≥ lg) — เมนูเต็มจัดกลุ่ม scroll ได้ (nav.ts = source of truth) ──
function Sidebar({ user, pathname }: { user: ShellUser | null; pathname: string }) {
  return (
    <aside
      data-testid="sidebar"
      className="hidden w-72 shrink-0 flex-col border-r-2 border-border bg-background px-3 py-5 lg:sticky lg:top-0 lg:flex lg:h-screen lg:overflow-y-auto"
    >
      {/* Brand */}
      <Link
        href="/"
        className="mb-5 flex items-center gap-2 px-2 text-base font-extrabold text-foreground"
      >
        <BrandMark />
        AI Agent Academy
      </Link>

      {/* Auth / profile */}
      {user ? (
        <Link
          href="/account"
          className="mb-4 flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-3 py-2 transition-colors hover:bg-muted-surface"
        >
          <Avatar name={user.name} image={user.image} size={40} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-foreground">
              {user.name}
            </span>
            <span className="badge mt-0.5 bg-muted-surface text-muted">
              {user.role === "admin" ? "แอดมิน" : "ลูกค้า"}
            </span>
          </span>
        </Link>
      ) : (
        <div className="mb-4 flex flex-col gap-2 px-1">
          <Link href="/login" className="btn btn-secondary w-full text-sm">
            เข้าสู่ระบบ
          </Link>
          <Link href="/register" className="btn btn-primary w-full text-sm">
            สมัครสมาชิก
          </Link>
        </div>
      )}

      {/* Nav groups */}
      <nav className="flex flex-col gap-4">
        {NAV_GROUPS.map((g) => {
          const items = NAV_ITEMS.filter((i) => i.group === g.key && canSee(i, user));
          if (items.length === 0) return null;
          return (
            <div key={g.key} className="flex flex-col gap-0.5">
              <p className="px-3 pb-1 font-heading text-[0.68rem] font-bold tracking-wide text-muted uppercase">
                {g.title}
              </p>
              {items.map((item) => (
                <SidebarItem key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          );
        })}
      </nav>

      {/* Theme — compact (icon-only) กัน label ดัน sidebar เกิน w-72 → scroll-x */}
      <div className="mt-5 px-1">
        <ThemeSwitcher compact />
      </div>

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-2 px-3 pt-6">
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <a href="/terms" className="text-muted transition-colors hover:text-foreground hover:underline">
            ข้อกำหนด
          </a>
          <a href="/privacy" className="text-muted transition-colors hover:text-foreground hover:underline">
            นโยบายความเป็นส่วนตัว
          </a>
        </div>
        <AppVersion />
      </div>
    </aside>
  );
}

function SidebarItem({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const on = item.match(pathname);
  return (
    <Link
      href={item.href}
      aria-current={on ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
        on
          ? "bg-brand-500 text-on-brand"
          : "text-muted hover:bg-muted-surface hover:text-foreground",
      )}
    >
      <Icon className="size-5 shrink-0" />
      {item.label}
    </Link>
  );
}
