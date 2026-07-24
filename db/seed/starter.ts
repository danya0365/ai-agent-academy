import { randomUUID } from "node:crypto";
import { db } from "../index";
import { bookingHours } from "../schema";

/** เวลาทำการเริ่มต้น: จ–ศ 09:00–17:00 */
export async function seedBookingHours(): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(bookingHours).run();
    const rows = [1, 2, 3, 4, 5].map((wd) => ({
      id: randomUUID(),
      weekday: wd,
      startMinute: 540, // 09:00
      endMinute: 1020,  // 17:00
    }));
    if (rows.length) await tx.insert(bookingHours).values(rows).run();
  });
  console.log(`✓ [starter] เวลาทำการ: จ–ศ 09:00–17:00`);
}
