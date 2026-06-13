import "../../lib/env";
import { seedInitial } from "./initial";
import { seedStarter } from "./starter";
import { seedMock } from "./mock";
import { isRemoteDb } from "./helpers";

type Tier = "initial" | "starter" | "mock";
const VALID: Tier[] = ["initial", "starter", "mock"];

function parseTiers(argv: string[]): Tier[] {
  const args = argv.slice(2);
  if (args.length === 0) return ["initial", "starter"]; // default ปลอดภัยสำหรับ production
  if (args.includes("all")) return ["initial", "starter", "mock"];
  const tiers = args.filter((a): a is Tier => VALID.includes(a as Tier));
  if (tiers.length === 0) {
    throw new Error(`tier ไม่ถูกต้อง: ${args.join(", ")} (ใช้ได้: initial, starter, mock, all)`);
  }
  return tiers;
}

async function main() {
  const tiers = parseTiers(process.argv);

  // guard: mock ห้ามลง remote DB (Turso) เว้นแต่ตั้ง ALLOW_MOCK_SEED=1
  if (tiers.includes("mock") && isRemoteDb() && process.env.ALLOW_MOCK_SEED !== "1") {
    console.error(
      "\n⛔ ปฏิเสธการ seed mock ลงฐานข้อมูล remote (Turso)\n" +
        `   DATABASE_URL ปัจจุบันไม่ใช่ไฟล์ local (file:)\n\n` +
        "   mock เป็นข้อมูลปลอมสำหรับ dev เท่านั้น — ไม่ควรลง production\n" +
        "   ทางเลือก:\n" +
        "     • ใช้ DB local ตอน dev:  DATABASE_URL=file:./local.db npm run db:seed:all\n" +
        "     • หากตั้งใจจริง:          ALLOW_MOCK_SEED=1 npm run db:seed:mock\n",
    );
    process.exit(1);
  }

  console.log(`เริ่ม seed: ${tiers.join(" → ")}`);
  for (const t of tiers) {
    if (t === "initial") await seedInitial();
    else if (t === "starter") await seedStarter();
    else if (t === "mock") await seedMock();
  }
  console.log("เสร็จสิ้น ✅");
  process.exit(0);
}

main().catch((err) => {
  console.error("seed ล้มเหลว:", err);
  process.exit(1);
});
