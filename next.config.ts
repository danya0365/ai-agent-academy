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
};

export default nextConfig;
