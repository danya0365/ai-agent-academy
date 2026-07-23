import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { MobileNav } from "@/components/mobile-nav";

export async function Navbar() {
  const session = await getSession();
  const user = session?.user ?? null;

  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-base font-extrabold text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-border bg-brand-500 text-on-brand">
            AI
          </span>
          <span className="hidden sm:inline">AI Agent Academy</span>
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:text-foreground"
          >
            คอร์สทั้งหมด
          </Link>
          <Link
            href="/tips"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:text-foreground"
          >
            รู้ก่อนใคร
          </Link>
          <Link
            href="/shop"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:text-foreground"
          >
            ของที่แนะนำ
          </Link>
          {user && (
            <Link
              href="/my-courses"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:text-foreground"
            >
              คอร์สของฉัน
            </Link>
          )}
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full px-3 py-1.5 text-sm font-bold text-brand-700 transition hover:text-brand-500"
            >
              แอดมิน
            </Link>
          )}

          <ThemeSwitcher />

          {user ? (
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-2 rounded-full border-2 border-border bg-card px-3 py-1"
                title={user.email}
              >
                <span className="text-sm font-bold text-foreground">{user.name}</span>
                <span className="badge bg-muted-surface text-muted">
                  {user.role === "admin" ? "แอดมิน" : "ลูกค้า"}
                </span>
              </span>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:text-foreground"
              >
                เข้าสู่ระบบ
              </Link>
              <Link href="/register" className="btn btn-primary text-sm">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>

        {/* mobile */}
        <div className="md:hidden">
          <MobileNav
            user={
              user
                ? {
                    name: user.name,
                    email: user.email,
                    role: user.role ?? "customer",
                  }
                : null
            }
          />
        </div>
      </nav>
    </header>
  );
}
