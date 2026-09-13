"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  TrendingUp,
  CalendarCheck2,
  Receipt,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, cn } from "@/lib/utils";
import {
  ORDER_STATUS_META,
  relativeTime,
  timeOfDay,
} from "@/lib/admin-helpers";
import type { Order } from "@/lib/schemas";

type DashboardData = {
  ordersToday: number;
  ordersYesterday: number;
  revenueToday: number;
  revenueYesterday: number;
  avgCheckToday: number;
  activeBookings: number;
  lastOrders: Order[];
  popularItems: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  weeklySeries: Array<{
    date: string;
    label: string;
    orders: number;
    revenue: number;
  }>;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (!res.ok) throw new Error("Failed to load dashboard");
        const json = (await res.json()) as DashboardData;
        if (!cancelled) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const stats: Array<{
    label: string;
    value: string;
    delta?: { value: number; suffix: string };
    icon: typeof ShoppingBag;
    href: string;
  }> = data
    ? [
        {
          label: "Orders today",
          value: data.ordersToday.toString(),
          delta:
            data.ordersYesterday > 0
              ? {
                  value:
                    ((data.ordersToday - data.ordersYesterday) /
                      data.ordersYesterday) *
                    100,
                  suffix: "%",
                }
              : undefined,
          icon: ShoppingBag,
          href: "/admin/orders",
        },
        {
          label: "Revenue today",
          value: formatPrice(data.revenueToday),
          delta:
            data.revenueYesterday > 0
              ? {
                  value:
                    ((data.revenueToday - data.revenueYesterday) /
                      data.revenueYesterday) *
                    100,
                  suffix: "%",
                }
              : undefined,
          icon: TrendingUp,
          href: "/admin/orders",
        },
        {
          label: "Active bookings",
          value: data.activeBookings.toString(),
          icon: CalendarCheck2,
          href: "/admin/bookings",
        },
        {
          label: "Avg check",
          value: formatPrice(data.avgCheckToday),
          icon: Receipt,
          href: "/admin/orders",
        },
      ]
    : [];

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Real-time overview of your service business. Auto-refreshes every
          15 seconds.
        </p>
      </header>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const deltaPositive =
            stat.delta && stat.delta.value >= 0;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
            >
              <Link href={stat.href}>
                <Card className="transition-all hover:border-indigo-300 hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-muted-foreground">
                          {stat.label}
                        </p>
                        <p className="mt-2 text-2xl font-bold tabular-nums">
                          {stat.value}
                        </p>
                        {stat.delta && (
                          <Badge
                            variant={deltaPositive ? "success" : "warning"}
                            className="mt-2"
                          >
                            {deltaPositive ? "▲" : "▼"}{" "}
                            {Math.abs(stat.delta.value).toFixed(0)}
                            {stat.delta.suffix}
                          </Badge>
                        )}
                      </div>
                      <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Weekly chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Orders this week</CardTitle>
            <CardDescription>
              Order count and revenue per day, last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart series={data.weeklySeries} />
          </CardContent>
        </Card>

        {/* Popular items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Popular items
            </CardTitle>
            <CardDescription>
              Top sellers across all paid orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.popularItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No paid orders yet.
              </p>
            ) : (
              <ol className="space-y-3">
                {data.popularItems.map((item, idx) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        idx === 0
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {item.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.quantity} sold • {formatPrice(item.revenue)}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Last orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Latest orders</CardTitle>
              <CardDescription>
                Five most recent orders across all tables.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/orders">
                See all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {data.lastOrders.map((order) => {
                const meta = ORDER_STATUS_META[order.status];
                return (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="flex items-center gap-3 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {order.tableLabel ?? `Table #${order.tableId}`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • {order.customerName}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {order.items.length} item
                        {order.items.length === 1 ? "" : "s"} •{" "}
                        {relativeTime(order.createdAt)} •{" "}
                        {timeOfDay(order.createdAt)}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                        meta.tone
                      )}
                    >
                      {meta.label}
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick links</CardTitle>
            <CardDescription>Jump to the most-used views.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/admin/orders">
                Orders dashboard
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/admin/menu">
                Manage menu
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/admin/bookings">
                Bookings
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/menu/demo-restaurant/table/5">
                Test QR flow (Table #5)
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Tiny SVG bar-chart, no external chart lib needed.
 * Scales bars relative to the maximum value in the series.
 */
function WeeklyChart({
  series,
}: {
  series: DashboardData["weeklySeries"];
}) {
  const maxOrders = Math.max(1, ...series.map((d) => d.orders));
  const maxRevenue = Math.max(1, ...series.map((d) => d.revenue));

  return (
    <div className="space-y-3">
      <div className="flex h-40 items-end gap-2 sm:gap-3">
        {series.map((d) => {
          const ordersHeight = (d.orders / maxOrders) * 100;
          const revenueHeight = (d.revenue / maxRevenue) * 100;
          const isToday =
            d.date === new Date().toISOString().slice(0, 10);
          return (
            <div
              key={d.date}
              className="group flex flex-1 flex-col items-center gap-1"
            >
              <div className="relative flex h-full items-end gap-1">
                <div
                  className={cn(
                    "w-3 rounded-t-md transition-all sm:w-4",
                    isToday
                      ? "bg-indigo-500"
                      : "bg-indigo-300 dark:bg-indigo-700"
                  )}
                  style={{ height: `${Math.max(ordersHeight, 2)}%` }}
                  title={`${d.orders} orders`}
                />
                <div
                  className={cn(
                    "w-3 rounded-t-md transition-all sm:w-4",
                    isToday
                      ? "bg-emerald-500"
                      : "bg-emerald-300 dark:bg-emerald-700"
                  )}
                  style={{ height: `${Math.max(revenueHeight, 2)}%` }}
                  title={`${d.revenue} UAH`}
                />
              </div>
              <div
                className={cn(
                  "text-xs",
                  isToday
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {d.label}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-indigo-500" /> Orders
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500" /> Revenue
        </span>
        <span className="ml-auto">Today highlighted</span>
      </div>
    </div>
  );
}