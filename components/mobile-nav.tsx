"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

type NavUser = { name: string; email: string; role: string } | null;

export function MobileNav({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="เมนู"
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border bg-card text-foreground"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b-2 border-border bg-background">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
            {user && (
              <div
                className="flex items-center justify-between rounded-xl border-2 border-border bg-card px-3 py-2"
                title={user.email}
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-foreground">
                    {user.name}
                  </span>
                  <span className="block truncate text-xs text-muted">{user.email}</span>
                </span>
                <span className="badge bg-muted-surface text-muted">
                  {user.role === "admin" ? "แอดมิน" : "ลูกค้า"}
                </span>
              </div>
            )}

            <Link
              href="/"
              onClick={close}
              className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted-surface"
            >
              คอร์สทั้งหมด
            </Link>
            <Link
              href="/tips"
              onClick={close}
              className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted-surface"
            >
              รู้ก่อนใคร
            </Link>
            <Link
              href="/shop"
              onClick={close}
              className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted-surface"
            >
              ของที่แนะนำ
            </Link>
            {user && (
              <Link
                href="/my-courses"
                onClick={close}
                className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-muted-surface"
              >
                คอร์สของฉัน
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                onClick={close}
                className="rounded-xl px-3 py-2 text-sm font-bold text-brand-700 hover:bg-muted-surface"
              >
                แอดมิน
              </Link>
            )}

            <div className="flex items-center justify-between gap-3 border-t-2 border-border pt-3">
              <ThemeSwitcher />
              {user ? (
                <SignOutButton />
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" onClick={close} className="btn btn-secondary text-sm">
                    เข้าสู่ระบบ
                  </Link>
                  <Link href="/register" onClick={close} className="btn btn-primary text-sm">
                    สมัคร
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
