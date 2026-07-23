import type { ComponentType } from "react";
import type { Tip } from "@/lib/tips";
import { AiSpeedTips } from "@/components/tips/custom/ai-speed-tips";
import { ClaudeCodeTokenSurvival } from "@/components/tips/custom/claude-code-token-survival";

/**
 * ทะเบียน component เฉพาะของแต่ละเคล็ดลับ (custom renderer)
 *
 * - key = slug ของเคล็ดลับ (ตรงกับ lib/tips.ts)
 * - value = component ที่รับ prop { tip } แล้ว render เนื้อหาแบบมีเอกลักษณ์ของตัวเอง
 *
 * slug ไหนไม่มีในนี้ → หน้า detail จะ fallback ไปใช้ <TipBody /> อัตโนมัติ
 * เพิ่มเคล็ดลับที่มีดีไซน์เฉพาะ: สร้างไฟล์ใน components/tips/custom/<slug>.tsx
 * แล้วลงทะเบียนที่นี่ — ไม่ต้องแก้ data ใน lib/tips.ts
 */
export const TIP_COMPONENTS: Record<string, ComponentType<{ tip: Tip }>> = {
  "ai-speed-tips": AiSpeedTips,
  "claude-code-token-survival": ClaudeCodeTokenSurvival,
};
