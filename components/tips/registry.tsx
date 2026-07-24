import type { ComponentType } from "react";
import type { Tip } from "@/lib/tips";
import { AiSpeedTips } from "@/components/tips/custom/ai-speed-tips";
import { ClaudeCodeTokenSurvival } from "@/components/tips/custom/claude-code-token-survival";
import { ClaudeCodeQuotaStrategy } from "@/components/tips/custom/claude-code-quota-strategy";
import { ClaudeCodeEffortSecret } from "@/components/tips/custom/claude-code-effort-secret";
import { DesignSystemUiConsistency } from "@/components/tips/custom/design-system-ui-consistency";
import { AiAgentIdentityMemory } from "@/components/tips/custom/ai-agent-identity-memory";
import { PromptsThatWork } from "@/components/tips/custom/prompts-that-work";
import { AiSideIncome } from "@/components/tips/custom/ai-side-income";

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
  "claude-code-quota-strategy": ClaudeCodeQuotaStrategy,
  "claude-code-effort-secret": ClaudeCodeEffortSecret,
  "design-system-ui-consistency": DesignSystemUiConsistency,
  "ai-agent-identity-memory": AiAgentIdentityMemory,
  "prompts-that-work": PromptsThatWork,
  "ai-side-income": AiSideIncome,
};
