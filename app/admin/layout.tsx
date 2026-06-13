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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="mr-2 font-bold text-slate-900">แผงแอดมิน</span>
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
      className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
