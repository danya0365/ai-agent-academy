"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveBookingHours } from "@/actions/admin";
import { WEEKDAY_TH } from "@/lib/format";
import { cn } from "@/lib/cn";

export type HoursInit = { weekday: number; startMinute: number; endMinute: number };

type DayCfg = { enabled: boolean; allDay: boolean; start: string; end: string };

const pad = (n: number) => String(n).padStart(2, "0");
const toHHMM = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

// เรียงวันแบบ จันทร์→อาทิตย์ (weekday index 1..6,0)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function buildInitial(rows: HoursInit[]): DayCfg[] {
  return Array.from({ length: 7 }, (_, wd) => {
    const r = rows.find((x) => x.weekday === wd); // v1: 1 ช่วง/วัน
    if (!r) return { enabled: false, allDay: false, start: "09:00", end: "17:00" };
    const allDay = r.startMinute === 0 && r.endMinute === 1440;
    return {
      enabled: true,
      allDay,
      start: toHHMM(r.startMinute),
      end: allDay ? "17:00" : toHHMM(r.endMinute),
    };
  });
}

export function BookingHoursManager({ initial }: { initial: HoursInit[] }) {
  const router = useRouter();
  const [days, setDays] = useState<DayCfg[]>(() => buildInitial(initial));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function patch(wd: number, p: Partial<DayCfg>) {
    setDays((prev) => prev.map((d, i) => (i === wd ? { ...d, ...p } : d)));
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    const fd = new FormData();
    days.forEach((d, wd) => {
      if (!d.enabled) return;
      fd.set(`d${wd}_enabled`, "on");
      fd.set(`d${wd}_start`, d.allDay ? "00:00" : d.start);
      fd.set(`d${wd}_end`, d.allDay ? "24:00" : d.end);
    });
    startTransition(async () => {
      const res = await saveBookingHours(fd);
      if (!res.ok) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}
      {saved && (
        <p className="rounded-xl border-2 border-border bg-success-surface px-3 py-2 text-sm text-success">
          บันทึกเวลาทำการแล้ว
        </p>
      )}

      <div className="space-y-2">
        {DAY_ORDER.map((wd) => {
          const d = days[wd];
          return (
            <div
              key={wd}
              className={cn(
                "card flex flex-col gap-3 p-3 sm:flex-row sm:items-center",
                !d.enabled && "opacity-70",
              )}
            >
              <label className="flex w-32 shrink-0 cursor-pointer items-center gap-2 font-bold text-foreground">
                <input
                  type="checkbox"
                  checked={d.enabled}
                  onChange={(e) => patch(wd, { enabled: e.target.checked })}
                  className="size-4 accent-brand-500"
                />
                {WEEKDAY_TH[wd]}
              </label>

              {d.enabled ? (
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={d.allDay}
                      onChange={(e) => patch(wd, { allDay: e.target.checked })}
                      className="size-4 accent-brand-500"
                    />
                    24 ชม.
                  </label>
                  {!d.allDay && (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={d.start}
                        onChange={(e) => patch(wd, { start: e.target.value })}
                        className="input w-32"
                      />
                      <span className="text-muted">–</span>
                      <input
                        type="time"
                        value={d.end}
                        onChange={(e) => patch(wd, { end: e.target.value })}
                        className="input w-32"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted">ปิด</span>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={handleSave} disabled={pending} className="btn btn-primary">
        {pending ? "กำลังบันทึก..." : "บันทึกเวลาทำการ"}
      </button>
    </div>
  );
}
