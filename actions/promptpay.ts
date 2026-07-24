"use server";

import { generatePromptPayQR } from "@/lib/promptpay";

export async function getPromptPayQR(amount?: number): Promise<string | null> {
  return generatePromptPayQR(amount);
}
