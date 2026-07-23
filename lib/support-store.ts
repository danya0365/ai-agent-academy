// Zustand + persist — เก็บสถานะ "ให้กำลังใจ dev" ใน localStorage
// key "support-storage" — ไม่ล็อกเนื้อหา เป็นแค่ interaction อบอุ่นเพื่อการมีส่วนร่วม
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SupportState {
  encouraged: boolean;
  encourageCount: number;
  encourage: () => void;
}

export const useSupportStore = create<SupportState>()(
  persist(
    (set) => ({
      encouraged: false,
      encourageCount: 0,
      encourage: () =>
        set((s) => ({
          encouraged: true,
          encourageCount: s.encourageCount + 1,
        })),
    }),
    { name: "support-storage", version: 1 },
  ),
);
