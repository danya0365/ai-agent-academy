/**
 * db:check — สแกน migration หา SQL ที่ไม่ปลอดภัยต่อ zero-downtime แบบ offline (ไม่ต้องมี DB)
 * รันหลัง `npm run db:generate` ก่อน commit เพื่อ feedback เร็ว
 *
 *   npm run db:check        # สแกน migration ใหม่สุด
 *   npm run db:check:all    # สแกนทุก migration
 *
 * ไม่มี DB จึงไม่รู้ว่า migration ไหน apply แล้ว → กติกา: migration "ตัวแรกสุด" (baseline/0000)
 * มักมี CREATE UNIQUE INDEX บนตารางว่างซึ่งปลอดภัย จึงพิมพ์เป็น INFO ไม่ fail;
 * migration อื่น ๆ ถ้าเจอของอันตราย = exit 1 (gate ได้ทั้ง local และ CI)
 */
import { readFileSync } from "node:fs";
import { scanMigration, formatViolations } from "./migration-guard";

const MIGRATIONS_FOLDER = process.env.MIGRATIONS_DIR ?? "./drizzle";
const scanAll = process.argv.includes("--all");

interface JournalEntry {
  when: number;
  tag: string;
}

function loadEntries(): JournalEntry[] {
  const journal = JSON.parse(
    readFileSync(`${MIGRATIONS_FOLDER}/meta/_journal.json`, "utf8"),
  );
  return [...(journal.entries as JournalEntry[])].sort((a, b) => a.when - b.when);
}

function statementsFor(tag: string): string[] {
  return readFileSync(`${MIGRATIONS_FOLDER}/${tag}.sql`, "utf8").split(
    "--> statement-breakpoint",
  );
}

function main(): number {
  const entries = loadEntries();
  if (entries.length === 0) {
    console.log("[db:check] ไม่พบ migration — รัน db:generate ก่อน");
    return 0;
  }

  const minWhen = entries[0].when; // ตัวแรกสุด = baseline
  const targets = scanAll ? entries : [entries[entries.length - 1]];
  let failed = false;

  for (const e of targets) {
    const violations = scanMigration(e.tag, statementsFor(e.tag));
    if (violations.length === 0) {
      console.log(`[db:check] ✅ ${e.tag} — ปลอดภัย (additive)`);
      continue;
    }
    if (e.when === minWhen) {
      console.log(
        `[db:check] ℹ️  ${e.tag} — baseline (initial schema) มี:\n${formatViolations(violations)}\n   (ปกติของ migration แรก — ไม่นับเป็น error)`,
      );
    } else {
      console.error(
        `[db:check] ❌ ${e.tag} — ไม่ปลอดภัยต่อ zero-downtime:\n${formatViolations(violations)}`,
      );
      failed = true;
    }
  }

  if (failed) {
    console.error(
      "\nดู MIGRATIONS.md — ทำเป็น expand/contract หลาย deploy หรือใช้ ALLOW_DESTRUCTIVE_MIGRATION=1 ตอน deploy",
    );
    return 1;
  }
  return 0;
}

process.exit(main());
