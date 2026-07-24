import "server-only";

/**
 * Logic ระบบจองคิว (คอร์ส type 'booking')
 *
 * แนวคิด: ไม่เก็บ slot ว่างลง DB — gen สดจาก "เวลาทำการ (bookingHours) − คิวที่จองแล้ว − อดีต"
 * ทุกครั้งที่ลูกค้าเปิดหน้าจอง แอดมินจึงตั้งเวลาทำการครั้งเดียว แล้วระบบวิ่งเองตลอด
 *
 * เวลาอิง Asia/Bangkok (UTC+7 คงที่ ไม่มี DST) → คำนวณด้วย offset ตรงๆ ได้ ไม่ต้องพึ่ง Intl
 */

// ── Config: ปรับเลขที่นี่จุดเดียว ─────────────────────────────
export const BOOKING_ADVANCE_DAYS = 14; // จองล่วงหน้าได้กี่วัน (นับรวมวันนี้)
export const BOOKING_LEAD_MINUTES = 60; // ห้ามจองภายในกี่นาทีข้างหน้า
export const BOOKING_LEAD_TOLERANCE_MS = 120_000; // tolerance 2 นาทีใน isValidSlot — กัน slot ถูก reject เพราะเวลาผ่านไประหว่าง render → submit
export const BKK_OFFSET_MIN = 420; // เวลาไทย = UTC+7

const MS_PER_MIN = 60_000;
const MIN_PER_DAY = 1440;
const MS_PER_DAY = MIN_PER_DAY * MS_PER_MIN;

export type HoursRow = { weekday: number; startMinute: number; endMinute: number };

export type Slot = {
  startEpoch: number; // ms
  endEpoch: number; // ms
  taken: boolean;
};

export type DaySlots = {
  dayEpoch: number; // เที่ยงคืนของวันนั้น (เวลาไทย) เป็น epoch ms
  slots: Slot[];
};

export type BusyRange = { startEpoch: number; endEpoch: number };

/** epoch ms ของ "เที่ยงคืนวันนั้น" ตามเวลาไทย */
function bkkMidnight(epoch: number): number {
  const shifted = epoch + BKK_OFFSET_MIN * MS_PER_MIN;
  const d = new Date(shifted);
  const msIntoDay =
    ((d.getUTCHours() * 60 + d.getUTCMinutes()) * 60 + d.getUTCSeconds()) * 1000 +
    d.getUTCMilliseconds();
  return epoch - msIntoDay;
}

/** weekday (0=อาทิตย์..6=เสาร์) ของวันที่ระบุด้วย epoch เที่ยงคืนไทย */
function bkkWeekday(midnightEpoch: number): number {
  return new Date(midnightEpoch + BKK_OFFSET_MIN * MS_PER_MIN).getUTCDay();
}

/**
 * gen slot ว่าง จัดกลุ่มตามวัน สำหรับหน้าจองฝั่งลูกค้า
 * - ไล่ slot ทีละ durationMin จาก startMinute ของแต่ละช่วงเวลาทำการ (slot ไม่ทับกัน)
 * - ตัด slot ที่เป็นอดีต / กระชั้นชิดกว่า lead time
 * - mark taken = ทับกับ busy range ใด ๆ (เผื่อ admin เลื่อนเวลาทำการจน grid ไม่ตรงเดิม)
 */
export function generateSlots(
  hours: HoursRow[],
  durationMin: number,
  busy: BusyRange[],
  now: number,
): DaySlots[] {
  if (!durationMin || durationMin <= 0 || hours.length === 0) return [];

  const earliest = now + BOOKING_LEAD_MINUTES * MS_PER_MIN;
  const today0 = bkkMidnight(now);
  const out: DaySlots[] = [];

  for (let i = 0; i < BOOKING_ADVANCE_DAYS; i++) {
    const day0 = today0 + i * MS_PER_DAY; // ไทยไม่มี DST → +1 วันคงที่
    const weekday = bkkWeekday(day0);
    const rows = hours.filter((h) => h.weekday === weekday);
    if (rows.length === 0) continue;

    const slots: Slot[] = [];
    for (const h of rows) {
      for (let m = h.startMinute; m + durationMin <= h.endMinute; m += durationMin) {
        const startEpoch = day0 + m * MS_PER_MIN;
        const endEpoch = startEpoch + durationMin * MS_PER_MIN;
        if (startEpoch < earliest) continue;
        const taken = busy.some((b) => b.startEpoch < endEpoch && b.endEpoch > startEpoch);
        slots.push({ startEpoch, endEpoch, taken });
      }
    }
    slots.sort((a, b) => a.startEpoch - b.startEpoch);
    if (slots.length > 0) out.push({ dayEpoch: day0, slots });
  }
  return out;
}

/**
 * ตรวจว่า startEpoch ที่ลูกค้าส่งมาเป็น slot ที่ถูกต้องจริง (server ไม่เชื่อ client)
 * - อยู่ในช่วงเวลาทำการของ weekday นั้น และจบไม่เกินเวลาปิด
 * - align กับ grid (นับจาก startMinute ของช่วงนั้น ทีละ durationMin) — กันจองเวลามั่ว เช่น 09:07
 * - ไม่เป็นอดีต/กระชั้นชิด และไม่เกินหน้าต่างจองล่วงหน้า
 */
export function isValidSlot(
  hours: HoursRow[],
  durationMin: number,
  startEpoch: number,
  now: number,
  toleranceMs = 0, // tolerance สำหรับ earliest bound — ป้องกัน reject ตอน submit หลัง render
): boolean {
  if (!durationMin || durationMin <= 0 || !Number.isFinite(startEpoch)) return false;

  const earliest = now + BOOKING_LEAD_MINUTES * MS_PER_MIN - toleranceMs;
  const maxEpoch = bkkMidnight(now) + BOOKING_ADVANCE_DAYS * MS_PER_DAY;
  if (startEpoch < earliest || startEpoch >= maxEpoch) return false;

  const day0 = bkkMidnight(startEpoch);
  const offsetMs = startEpoch - day0;
  // ต้องตรง "นาที" เป๊ะ — กัน startEpoch เพี้ยนระดับวินาที (เช่น 09:00:15) เล็ดลอด
  // แล้วสร้าง PK คนละตัวจน bypass การกันจองซ้อน (generateSlots สร้างเฉพาะค่าตรง grid อยู่แล้ว)
  if (offsetMs % MS_PER_MIN !== 0) return false;
  const minuteOfDay = offsetMs / MS_PER_MIN;
  const weekday = bkkWeekday(day0);
  const endMinute = minuteOfDay + durationMin;

  return hours.some(
    (h) =>
      h.weekday === weekday &&
      minuteOfDay >= h.startMinute &&
      endMinute <= h.endMinute &&
      (minuteOfDay - h.startMinute) % durationMin === 0,
  );
}

/** endEpoch ของ slot ที่เริ่ม startEpoch (ตาม duration ของคอร์ส) */
export function slotEndEpoch(startEpoch: number, durationMin: number): number {
  return startEpoch + durationMin * MS_PER_MIN;
}
