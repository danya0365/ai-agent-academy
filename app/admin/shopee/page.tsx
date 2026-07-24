import { db } from "@/db";
import { affiliateClicks } from "@/db/schema";
import { count, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ShopeeDashboard() {
  // ── ภาพรวม ──
  const totalRow = await db
    .select({ n: count() })
    .from(affiliateClicks)
    .get();
  const totalClicks = Number(totalRow?.n ?? 0);

  // คลิกวันนี้ (ตาม local time เขียนเป็น UTC+7)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRow = await db
    .select({ n: count() })
    .from(affiliateClicks)
    .where(sql`${affiliateClicks.clickedAt} >= ${Math.floor(todayStart.getTime() / 1000)}`)
    .get();
  const todayClicks = Number(todayRow?.n ?? 0);

  // ── สินค้าที่ถูกคลิกมากที่สุด ──
  const topProducts = await db
    .select({
      productId: affiliateClicks.productId,
      productTitle: affiliateClicks.productTitle,
      count: count(),
    })
    .from(affiliateClicks)
    .groupBy(affiliateClicks.productId)
    .orderBy(desc(count()))
    .limit(20)
    .all();

  // ── คลิกตามแหล่งที่มา (subId) ──
  const bySubId = await db
    .select({
      subId: affiliateClicks.subId,
      count: count(),
    })
    .from(affiliateClicks)
    .groupBy(affiliateClicks.subId)
    .orderBy(desc(count()))
    .all();

  // ── คลิกล่าสุด 50 ──
  const recent = await db
    .select()
    .from(affiliateClicks)
    .orderBy(desc(affiliateClicks.clickedAt))
    .limit(50)
    .all();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        สถิติ Shopee Affiliate
      </h1>

      {/* stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-medium text-muted">คลิกทั้งหมด</p>
          <p className="mt-1 text-3xl font-black text-foreground">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-muted">คลิกวันนี้</p>
          <p className="mt-1 text-3xl font-black text-foreground">{todayClicks.toLocaleString()}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-muted">สินค้าที่ถูกคลิก</p>
          <p className="mt-1 text-3xl font-black text-foreground">{topProducts.length}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ตาราง top products */}
        <div>
          <h2 className="mb-3 text-lg font-black text-foreground">สินค้าขายดี (คลิกมากที่สุด)</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border text-left text-xs font-medium text-muted">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">สินค้า</th>
                  <th className="px-3 py-2 text-right">คลิก</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.productId} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-sm text-muted">{i + 1}</td>
                    <td className="px-3 py-2 text-sm font-medium text-foreground">
                      {p.productTitle}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-foreground">
                      {p.count}
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-muted">
                      ยังไม่มีคลิก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* แหล่งที่มา (subId) */}
        <div>
          <h2 className="mb-3 text-lg font-black text-foreground">คลิกตามแหล่งที่มา</h2>
          <div className="card overflow-hidden p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border text-left text-xs font-medium text-muted">
                  <th className="px-3 py-2">แหล่งที่มา</th>
                  <th className="px-3 py-2 text-right">คลิก</th>
                  <th className="px-3 py-2 text-right">สัดส่วน</th>
                </tr>
              </thead>
              <tbody>
                {bySubId.map((row) => (
                  <tr key={row.subId ?? "__null__"} className="border-b border-border last:border-0">
                    <td className="px-3 py-2 text-sm font-medium text-foreground">
                      {row.subId ?? "(ไม่มี subId)"}
                    </td>
                    <td className="px-3 py-2 text-right text-sm font-bold text-foreground">
                      {row.count}
                    </td>
                    <td className="px-3 py-2 text-right text-sm text-muted">
                      {totalClicks > 0
                        ? `${((row.count / totalClicks) * 100).toFixed(1)}%`
                        : "-"}
                    </td>
                  </tr>
                ))}
                {bySubId.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3 py-6 text-center text-sm text-muted">
                      ยังไม่มีคลิก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* คลิกล่าสุด */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-black text-foreground">คลิกล่าสุด 50</h2>
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border text-left text-xs font-medium text-muted">
                <th className="px-3 py-2">เวลา</th>
                <th className="px-3 py-2">สินค้า</th>
                <th className="px-3 py-2">แหล่งที่มา</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="whitespace-nowrap px-3 py-2 text-sm text-muted">
                    {formatTime(c.clickedAt)}
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-foreground">
                    {c.productTitle}
                  </td>
                  <td className="px-3 py-2 text-sm text-muted">{c.subId ?? "-"}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-6 text-center text-sm text-muted">
                    ยังไม่มีคลิก
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function formatTime(ts: Date): string {
  const d = ts instanceof Date ? ts : new Date(ts);
  // 2024-01-15 14:30:22 (UTC+7 เสมอ — admin timezone)
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${mo}-${dd} ${h}:${m}:${s}`;
}
