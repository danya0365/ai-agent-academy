import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { AdminNav } from "@/components/admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const links = [
    { href: "/admin", label: "ภาพรวม" },
    { href: "/admin/enrollments", label: "ตรวจสลิป" },
    { href: "/admin/courses", label: "จัดการคอร์ส" },
    { href: "/admin/booking-hours", label: "เวลาทำการ" },
    { href: "/admin/shopee", label: "Shopee" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b-2 border-border pb-3">
        <span className="mr-1 font-extrabold text-foreground">แผงแอดมิน</span>
        <AdminNav links={links} />
      </div>
      {children}
    </div>
  );
}
