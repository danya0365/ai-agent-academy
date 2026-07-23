import { getBookingHours } from "@/lib/queries";
import {
  BookingHoursManager,
  type HoursInit,
} from "@/components/booking-hours-manager";
import { BOOKING_ADVANCE_DAYS, BOOKING_LEAD_MINUTES } from "@/lib/booking";

export const dynamic = "force-dynamic";

export default async function BookingHoursPage() {
  const hours = await getBookingHours();
  const initial: HoursInit[] = hours.map((h) => ({
    weekday: h.weekday,
    startMinute: h.startMinute,
    endMinute: h.endMinute,
  }));

  return (
    <div>
      <h1 className="mb-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        เวลาทำการ
      </h1>
      <p className="mb-6 text-muted">
        ตั้งเวลาเปิด-ปิดของ “ร้าน” — ระบบจะ gen slot ให้ลูกค้าจองเองตามนี้ (ใช้กับคอร์สประเภท
        “จองเวลาเอง” ทุกคอร์ส) ลูกค้าจองล่วงหน้าได้ {BOOKING_ADVANCE_DAYS} วัน และต้องจองก่อนเวลาเรียนอย่างน้อย{" "}
        {BOOKING_LEAD_MINUTES} นาที
      </p>
      <BookingHoursManager initial={initial} />
    </div>
  );
}
