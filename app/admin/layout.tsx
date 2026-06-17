import Link from "next/link";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b-2 border-border pb-3">
        <span className="mr-1 font-extrabold text-foreground">แผงแอดมิน</span>
        <AdminLink href="/admin">ภาพรวม</AdminLink>
        <AdminLink href="/admin/enrollments">ตรวจสลิป</AdminLink>
        <AdminLink href="/admin/courses">จัดการคอร์ส</AdminLink>
      </div>
      {children}
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-sm font-medium text-muted transition hover:bg-muted-surface hover:text-foreground"
    >
      {children}
    </Link>
  );
}
