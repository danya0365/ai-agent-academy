import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// เช็ค cookie แบบ optimistic — การบังคับสิทธิ์จริงอยู่ใน requireUser/requireAdmin
const PROTECTED = ["/my-courses", "/enrollments", "/admin"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!isProtected) return NextResponse.next();

  const cookie = getSessionCookie(req);
  if (!cookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/my-courses/:path*", "/enrollments/:path*", "/admin/:path*"],
};
