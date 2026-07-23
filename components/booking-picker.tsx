"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { CalendarDays, ChevronDown, Check } from "lucide-react";
import { bookSlot } from "@/actions/enrollments";
import { formatBkkDay, formatBkkTime, formatDuration } from "@/lib/format";
import { cn } from "@/lib/cn";

type Slot = { startEpoch: number; endEpoch: number; taken: boolean };
type DaySlots = { dayEpoch: number; slots: Slot[] };

const freeCount = (d: DaySlots) => d.slots.filter((s) => !s.taken).length;

export function BookingPicker({
  courseId,
  durationMin,
  days,
}: {
  courseId: string;
  durationMin: number;
  days: DaySlots[];
}) {
  const [dayIdx, setDayIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null); // startEpoch
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (days.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="mb-2 font-extrabold text-foreground">จองเวลาเรียน</h3>
        <p className="text-sm text-muted">
          ยังไม่มีเวลาว่างให้จองในตอนนี้ กรุณากลับมาใหม่ภายหลัง
        </p>
      </div>
    );
  }

  const day = days[Math.min(dayIdx, days.length - 1)];

  function handleBook() {
    if (selected == null) return;
    setError(null);
    startTransition(async () => {
      const res = await bookSlot(courseId, selected);
      // สำเร็จ = redirect (ไม่ return) · ถ้ากลับมาแสดงว่ามี error
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <div className="card p-5">
      <h3 className="mb-1 font-extrabold text-foreground">จองเวลาเรียน</h3>
      <p className="mb-4 text-sm text-muted">
        ครั้งละ {formatDuration(durationMin)} · เลือกวันและเวลาที่สะดวก
      </p>

      {/* เลือกวัน — dropdown (แทน scroll-x เดิม เพื่อให้ใช้บนมือถือง่าย) */}
      <DayDropdown
        days={days}
        dayIdx={dayIdx}
        onSelect={(i) => {
          setDayIdx(i);
          setSelected(null);
        }}
      />

      {/* เลือกเวลา */}
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {day.slots.map((s) => {
          const isSel = selected === s.startEpoch;
          return (
            <button
              key={s.startEpoch}
              disabled={s.taken}
              onClick={() => setSelected(s.startEpoch)}
              className={cn(
                "rounded-xl border-2 px-2 py-2 text-sm font-bold transition",
                s.taken
                  ? "cursor-not-allowed border-border bg-muted-surface text-muted line-through opacity-60"
                  : isSel
                    ? "border-brand-500 bg-brand-500 text-on-brand"
                    : "border-border text-foreground hover:bg-muted-surface",
              )}
            >
              {formatBkkTime(s.startEpoch)}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-xl border-2 border-border bg-error-surface px-3 py-2 text-sm text-error">
          {error}
        </p>
      )}

      <button
        onClick={handleBook}
        disabled={pending || selected == null}
        className="btn btn-primary mt-4 w-full"
      >
        {pending ? "กำลังดำเนินการ..." : "จองแล้วชำระเงิน"}
      </button>
    </div>
  );
}

/** ปุ่มเลือกวัน + custom dropdown (คลิกนอก/Esc เพื่อปิด) */
function DayDropdown({
  days,
  dayIdx,
  onSelect,
}: {
  days: DaySlots[];
  dayIdx: number;
  onSelect: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = days[Math.min(dayIdx, days.length - 1)];
  const currentFree = freeCount(current);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-xl border-2 border-border bg-card px-4 py-3 text-left font-bold text-foreground transition hover:bg-muted-surface"
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarDays className="size-4 shrink-0 text-brand-700" />
          <span className="truncate">{formatBkkDay(current.dayEpoch)}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-medium text-muted">
            {currentFree > 0 ? `ว่าง ${currentFree} ช่วง` : "เต็ม"}
          </span>
          <ChevronDown
            className={cn("size-5 text-muted transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="card absolute inset-x-0 top-full z-20 mt-2 max-h-64 overflow-y-auto p-1.5"
        >
          {days.map((d, i) => {
            const free = freeCount(d);
            const active = i === dayIdx;
            return (
              <li key={d.dayEpoch}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onSelect(i);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition",
                    active
                      ? "bg-brand-500 text-on-brand"
                      : "text-foreground hover:bg-muted-surface",
                  )}
                >
                  <span className="truncate">{formatBkkDay(d.dayEpoch)}</span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className={cn("text-xs font-medium", !active && "text-muted", active && "opacity-80")}>
                      {free > 0 ? `ว่าง ${free}` : "เต็ม"}
                    </span>
                    {active && <Check className="size-4" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
