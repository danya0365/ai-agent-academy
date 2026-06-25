/**
 * เลขเวอร์ชั่นแอป — แหล่งเดียวคือ field "version" ใน package.json
 * ฝังเข้า build เป็น env ผ่าน next.config.ts (NEXT_PUBLIC_APP_VERSION / NEXT_PUBLIC_COMMIT_SHA)
 *
 * helper ธรรมดา (ไม่มี React hook ข้างใน) ใช้ได้ทั้งฝั่ง server และ client
 * อย่า destructure process.env — Next แทนค่าแบบ literal ตอน build เท่านั้น
 */
export function getAppVersion() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0";
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || "";
  const shortSha = commitSha.slice(0, 7);
  const displayVersion = shortSha ? `v${version} (${shortSha})` : `v${version}`;
  return { version, commitSha, shortSha, displayVersion };
}
