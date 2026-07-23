// AccountSheet — slide-up overlay สำหรับปุ่ม "บัญชี/เพิ่มเติม" บน mobile tabbar
//   authed: profile header (→ /account) + moreItems (คอร์สของฉัน/แอดมิน) + theme + ออกจากระบบ
//   guest: ปุ่มเข้าสู่ระบบ/สมัคร + theme
// คุม open/close จาก AppShell (parent) — ปิดเมื่อคลิก backdrop หรือกด link
"use client";

import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { cn } from "@/lib/cn";
import { moreItems, canSee, type ShellUser } from "@/components/shell/nav";

export function AccountSheet({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: () => void;
  user: ShellUser | null;
}) {
  const links = user ? moreItems.filter((i) => canSee(i, user)) : [];

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="ปิดเมนู"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-foreground/40 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t-2 border-border bg-background px-4 pt-3 shadow-2xl transition-transform duration-300 pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        {/* grab handle */}
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-surface" />

        {user ? (
          <Link
            href="/account"
            onClick={onClose}
            className="mb-3 flex items-center gap-3 rounded-2xl border-2 border-border bg-card px-3 py-3"
          >
            <Avatar name={user.name} image={user.image} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-foreground">
                {user.name}
              </span>
              <span className="block truncate text-xs text-muted">{user.email}</span>
            </span>
            <span className="badge bg-muted-surface text-muted">
              {user.role === "admin" ? "แอดมิน" : "ลูกค้า"}
            </span>
          </Link>
        ) : (
          <div className="mb-3 flex flex-col gap-2">
            <Link href="/login" onClick={onClose} className="btn btn-primary w-full">
              เข้าสู่ระบบ
            </Link>
            <Link href="/register" onClick={onClose} className="btn btn-secondary w-full">
              สมัครสมาชิก
            </Link>
          </div>
        )}

        {/* เมนูที่เหลือ (authed) */}
        {links.length > 0 && (
          <div className="mb-3 flex flex-col gap-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted-surface"
                >
                  <Icon className="size-5 shrink-0 text-muted" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* ธีม (ThemeSwitcher เป็นแบบ icon-only ตอน < lg) */}
        <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border-2 border-border bg-card px-3 py-2">
          <span className="text-sm font-semibold text-muted">ธีม</span>
          <ThemeSwitcher />
        </div>

        {/* ลิงก์นโยบาย + ออกจากระบบ */}
        <div className="flex items-center justify-between gap-3 border-t-2 border-border pt-3">
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            <a href="/terms" className="text-muted transition-colors hover:text-foreground hover:underline">
              ข้อกำหนด
            </a>
            <a href="/privacy" className="text-muted transition-colors hover:text-foreground hover:underline">
              นโยบายความเป็นส่วนตัว
            </a>
          </div>
          {user && <SignOutButton />}
        </div>
      </div>
    </div>
  );
}
