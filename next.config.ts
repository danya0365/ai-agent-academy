import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// commit sha สำหรับแสดงคู่เลขเวอร์ชั่นใน footer (ระบุ build ย่อยได้โดยไม่ต้อง bump)
const getCommitSha = () => {
  try {
    return (
      process.env.VERCEL_GIT_COMMIT_SHA || // platform-provided บน Vercel/CI
      execSync("git rev-parse HEAD").toString().trim() // local build
    );
  } catch {
    return "";
  }
};

// security headers ทุก response — จงใจ conservative กับ CSP (แค่ frame-ancestors/
// object-src/base-uri) เพื่อไม่ให้ inline ThemeScript / next/font พัง การล็อก
// script-src เต็มรูปต้องทำ nonce pipeline (ค่อยทำทีหลัง report-only ก่อน)
// HSTS มีผลเฉพาะบน HTTPS (prod) — บน http dev ไม่มีผล ไม่เสียหาย
// แอปนี้ไม่ใช้ camera/mic/geolocation → ปิดทั้งหมด (slip upload ใช้ file input ไม่ต้องขอ camera)
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
  },
];

const nextConfig: NextConfig = {
  env: {
    // แหล่งเดียวของเลขเวอร์ชั่น = field "version" ใน package.json
    // (npm ตั้ง npm_package_version ให้เมื่อรันผ่าน `npm run build`)
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "0.1.0",
    NEXT_PUBLIC_COMMIT_SHA: getCommitSha(),
  },
  experimental: {
    // รูปสลิปอาจใหญ่กว่า 1MB ซึ่งเป็นค่า default ของ Server Actions
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
