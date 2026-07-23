import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/session";
import { Avatar } from "@/components/avatar";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { moreItems, canSee, type ShellUser } from "@/components/shell/nav";

export const metadata: Metadata = { title: "บัญชีของฉัน" };

export default async function AccountPage() {
  const u = await requireUser("/account");
  const user: ShellUser = {
    name: u.name,
    email: u.email,
    role: u.role ?? "customer",
    image: u.image ?? null,
  };
  const links = moreItems.filter((i) => canSee(i, user));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-extrabold text-foreground">บัญชีของฉัน</h1>

      {/* Profile card */}
      <div className="card mb-6 flex items-center gap-4 p-4">
        <Avatar name={user.name} image={user.image} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-foreground">{user.name}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <span className="badge mt-1 inline-flex bg-muted-surface text-muted">
            {user.role === "admin" ? "แอดมิน" : "ลูกค้า"}
          </span>
        </div>
      </div>

      {/* Quick links */}
      {links.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="card-flat lift flex items-center gap-3 p-4 font-semibold text-foreground"
              >
                <Icon className="size-6 shrink-0 text-brand-600" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Theme */}
      <div className="mb-6 flex items-center justify-between gap-2 rounded-xl border-2 border-border bg-card px-4 py-3">
        <span className="font-semibold text-muted">ธีมการแสดงผล</span>
        <ThemeSwitcher />
      </div>

      <SignOutButton />
    </div>
  );
}
