import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/sign-out-button";

export async function Navbar() {
  const session = await getSession();
  const user = session?.user;

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="text-xl">🤖</span>
          <span>AI Agent Academy</span>
        </Link>

        <div className="flex items-center gap-1 text-sm sm:gap-3">
          <Link href="/" className="px-2 py-1 text-slate-600 hover:text-slate-900">
            คอร์สทั้งหมด
          </Link>

          {user ? (
            <>
              <Link
                href="/my-courses"
                className="px-2 py-1 text-slate-600 hover:text-slate-900"
              >
                คอร์สของฉัน
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="px-2 py-1 font-medium text-indigo-600 hover:text-indigo-800"
                >
                  แอดมิน
                </Link>
              )}
              {/* ผู้ใช้ปัจจุบัน — ให้รู้ว่ากำลังล็อกอินเป็นใคร */}
              <span
                className="flex items-center gap-2 px-2 py-1"
                title={user.email}
              >
                <span className="hidden text-slate-400 sm:inline">{user.email}</span>
                <span className="font-medium text-slate-800">{user.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {user.role === "admin" ? "แอดมิน" : "ลูกค้า"}
                </span>
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-2 py-1 text-slate-600 hover:text-slate-900"
              >
                เข้าสู่ระบบ
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
