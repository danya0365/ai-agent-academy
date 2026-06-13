import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** คืน session ปัจจุบัน (หรือ null ถ้าไม่ได้ล็อกอิน) */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** บังคับว่าต้องล็อกอิน — ถ้าไม่ใช่จะ redirect ไปหน้า login */
export async function requireUser(nextPath?: string) {
  const s = await getSession();
  if (!s?.user) {
    const q = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/login${q}`);
  }
  return s.user;
}

/** บังคับว่าต้องเป็นแอดมิน */
export async function requireAdmin() {
  const s = await getSession();
  if (!s?.user) redirect("/login?next=/admin");
  if (s.user.role !== "admin") redirect("/");
  return s.user;
}
