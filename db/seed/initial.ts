import { ensureUser } from "./helpers";
import { seedBookingHours } from "./starter";

/** initial seed: admin user + booking hours */
export async function seedInitial(): Promise<void> {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  const name = process.env.ADMIN_NAME || "ผู้ดูแลระบบ";

  await ensureUser({ email, password, name, role: "admin" });
  console.log(`✓ [initial] แอดมินพร้อมใช้งาน: ${email}`);

  await seedBookingHours();
}
