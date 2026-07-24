import { createClient } from "@libsql/client";

const url = process.env.DATABASE_URL!;
const token = process.env.DATABASE_AUTH_TOKEN!;

const db = createClient({ url, authToken: token });

async function main() {
  await db.execute("PRAGMA foreign_keys = OFF");

  const toDrop = [
    "bookings",
    "enrollments",
    "community_post_likes",
    "community_posts",
    "session",
    "account",
    "rate_limit",
    "verification",
    "affiliate_clicks",
    "booking_hours",
    "user",
    "__drizzle_migrations",
  ];
  for (const t of toDrop) {
    await db.execute(`DROP TABLE IF EXISTS \`${t}\``).catch(() => {});
    console.log(`  DROP TABLE ${t}`);
  }

  console.log("✓ Dropped all — now run db/migrate.ts to rebuild + seed");
}

main().catch((e) => {
  console.error("Failed:", e);
  process.exit(1);
});
