import { NextResponse } from "next/server";
import { DEMO_ORDERS } from "@/data/orders";
import { BOOKINGS_STORE } from "@/data/bookings";

/**
 * GET /api/admin/dashboard — aggregate stats for the admin landing page.
 *
 * Returns:
 *   - ordersToday, ordersYesterday, revenueToday, revenueYesterday
 *   - avgCheckToday
 *   - activeBookings  (status=confirmed OR pending, date >= today)
 *   - lastOrders      (5 newest)
 *   - popularItems    (top 5 by quantity sold across all paid orders)
 *   - weeklySeries    ({ date: 'YYYY-MM-DD', orders, revenue }[]) — 7 days
 */
export async function GET() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const isToday = (iso: string) => iso.startsWith(today);
  const isYesterday = (iso: string) => iso.startsWith(yesterday);

  const paidOrServed = (o: { paymentStatus: string }) =>
    o.paymentStatus === "paid";

  const ordersToday = DEMO_ORDERS.filter((o) => isToday(o.createdAt));
  const ordersYesterday = DEMO_ORDERS.filter((o) =>
    isYesterday(o.createdAt)
  );

  const revenueToday = ordersToday
    .filter(paidOrServed)
    .reduce((sum, o) => sum + o.total, 0);
  const revenueYesterday = ordersYesterday
    .filter(paidOrServed)
    .reduce((sum, o) => sum + o.total, 0);

  const paidToday = ordersToday.filter(paidOrServed).length;
  const avgCheckToday = paidToday > 0 ? Math.round(revenueToday / paidToday) : 0;

  const activeBookings = BOOKINGS_STORE.filter((b) => {
    if (b.status !== "confirmed" && b.status !== "pending") return false;
    return b.date >= today;
  }).length;

  const lastOrders = [...DEMO_ORDERS]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Top 5 popular items by quantity sold across all paid orders.
  const itemCounts = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();
  for (const order of DEMO_ORDERS) {
    if (!paidOrServed(order)) continue;
    for (const line of order.items) {
      const prev = itemCounts.get(line.itemId) ?? {
        name: line.name,
        quantity: 0,
        revenue: 0,
      };
      prev.quantity += line.quantity;
      prev.revenue += (line.price + (line.variationPriceDelta ?? 0)) * line.quantity;
      itemCounts.set(line.itemId, prev);
    }
  }
  const popularItems = Array.from(itemCounts.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Weekly series — last 7 days.
  const weeklySeries: Array<{
    date: string;
    label: string;
    orders: number;
    revenue: number;
  }> = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOrders = DEMO_ORDERS.filter((o) =>
      o.createdAt.startsWith(dateStr)
    );
    const dayRevenue = dayOrders
      .filter(paidOrServed)
      .reduce((sum, o) => sum + o.total, 0);
    weeklySeries.push({
      date: dateStr,
      label: d.toLocaleDateString("uk-UA", {
        weekday: "short",
      }),
      orders: dayOrders.length,
      revenue: dayRevenue,
    });
  }

  return NextResponse.json({
    ordersToday: ordersToday.length,
    ordersYesterday: ordersYesterday.length,
    revenueToday,
    revenueYesterday,
    avgCheckToday,
    activeBookings,
    lastOrders,
    popularItems,
    weeklySeries,
  });
}