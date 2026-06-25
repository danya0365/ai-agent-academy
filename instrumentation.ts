// รันครั้งเดียวตอน server instance เริ่มทำงาน (Next.js instrumentation hook)
// ใช้ตรวจ env production ให้ fail fast ถ้าตั้งค่าผิด — ดู lib/validate-env.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/lib/validate-env");
    validateEnv();
  }
}
