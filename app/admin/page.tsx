"use client";

import { useEffect, useMemo, useState } from "react";
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
  AlertCircle,
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.status === 401 || res.status === 403) {
          window.location.href = "/admin/login?from=/admin";
          return;
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Failed to load dashboard (${res.status})`);
        }
        const json = (await res.json()) as DashboardData;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
          console.error(err);
        }
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

  if (error && !data) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
        <h2 className="mt-3 text-lg font-semibold text-red-900 dark:text-red-200">
          Failed to load dashboard
        </h2>
        <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setLoading(true);
              setError(null);
              fetch("/api/admin/dashboard")
                .then((r) => r.json())
                .then((d) => setData(d))
                .catch((e) => setError(e.message))
                .finally(() => setLoading(false));
            }}
          >
            Try again
          </Button>
          <Button asChild>
            <Link href="/admin/login">Log in</Link>
          </Button>
        </div>
      </div>
    );
  }

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
 * Enhanced interactive bar-chart displaying exact orders and revenue values.
 * Includes interactive tooltips, exact numbers above bars, active day stats,
 * and view mode toggling (Combined, Orders, Revenue).
 */
function WeeklyChart({
  series,
}: {
  series: DashboardData["weeklySeries"];
}) {
  const [viewMode, setViewMode] = useState<"all" | "orders" | "revenue">("all");
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayItem = useMemo(
    () => series.find((d) => d.date === todayStr) || series[series.length - 1],
    [series, todayStr]
  );
  const [hoveredDay, setHoveredDay] = useState<DashboardData["weeklySeries"][0] | null>(null);

  const activeDay = hoveredDay || todayItem || series[series.length - 1];

  const maxOrders = Math.max(1, ...series.map((d) => d.orders));
  const maxRevenue = Math.max(1, ...series.map((d) => d.revenue));

  const totalOrders = series.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = series.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="space-y-4">
      {/* Top Controls: Active day stats & view switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 pb-3 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground">
              {hoveredDay
                ? `${hoveredDay.label} (${hoveredDay.date.slice(5)})`
                : activeDay?.date === todayStr
                ? "Today (selected)"
                : "Weekly Total"}
            </span>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400">
                {hoveredDay ? hoveredDay.orders : totalOrders} orders
              </span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatPrice(hoveredDay ? hoveredDay.revenue : totalRevenue)}
              </span>
            </div>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 text-xs dark:border-zinc-800 dark:bg-zinc-900 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("all")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              viewMode === "all"
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Combined
          </button>
          <button
            type="button"
            onClick={() => setViewMode("orders")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              viewMode === "orders"
                ? "bg-white text-indigo-700 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Orders
          </button>
          <button
            type="button"
            onClick={() => setViewMode("revenue")}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              viewMode === "revenue"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-zinc-800 dark:text-emerald-400"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Revenue
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative pt-6">
        {/* Background grid guide lines */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 top-8 flex flex-col justify-between opacity-30 dark:opacity-20">
          <div className="border-b border-dashed border-zinc-400 dark:border-zinc-600" />
          <div className="border-b border-dashed border-zinc-400 dark:border-zinc-600" />
          <div className="border-b border-zinc-300 dark:border-zinc-700" />
        </div>

        <div className="relative flex h-48 items-end gap-2 sm:gap-4">
          {series.map((d) => {
            const ordersHeight = (d.orders / maxOrders) * 100;
            const revenueHeight = (d.revenue / maxRevenue) * 100;
            const isToday = d.date === todayStr;
            const isHovered = hoveredDay?.date === d.date;

            return (
              <div
                key={d.date}
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
                className="group relative flex flex-1 flex-col items-center cursor-pointer"
              >
                {/* Floating Tooltip */}
                <div
                  className={cn(
                    "pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-lg border border-zinc-200 bg-white/95 px-2.5 py-1 shadow-md backdrop-blur-sm transition-all duration-150 dark:border-zinc-800 dark:bg-zinc-900/95 text-center text-xs",
                    isHovered
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  )}
                >
                  <div className="font-semibold text-foreground">
                    {d.label} • {d.date.slice(5)}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 font-medium">
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {d.orders} {d.orders === 1 ? "order" : "orders"}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {formatPrice(d.revenue)}
                    </span>
                  </div>
                </div>

                {/* Bars Area */}
                <div className="relative flex h-36 w-full items-end justify-center gap-1 sm:gap-1.5 pb-1">
                  {/* Orders bar */}
                  {(viewMode === "all" || viewMode === "orders") && (
                    <div className="flex flex-col items-center justify-end h-full">
                      {/* Exact value label above bar */}
                      <span
                        className={cn(
                          "mb-1 text-[10px] font-semibold tabular-nums transition-opacity",
                          viewMode === "orders" || isHovered || isToday
                            ? "opacity-100 text-indigo-700 dark:text-indigo-300"
                            : "opacity-0 sm:group-hover:opacity-100 text-muted-foreground"
                        )}
                      >
                        {d.orders}
                      </span>
                      <div
                        className={cn(
                          "rounded-t-md transition-all duration-300",
                          viewMode === "orders" ? "w-6 sm:w-8" : "w-3 sm:w-4",
                          isToday
                            ? "bg-indigo-600 dark:bg-indigo-500 shadow-sm shadow-indigo-500/20"
                            : "bg-indigo-300 hover:bg-indigo-400 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                        )}
                        style={{ height: `${Math.max(ordersHeight, 4)}%` }}
                      />
                    </div>
                  )}

                  {/* Revenue bar */}
                  {(viewMode === "all" || viewMode === "revenue") && (
                    <div className="flex flex-col items-center justify-end h-full">
                      {/* Exact value label above bar */}
                      <span
                        className={cn(
                          "mb-1 text-[10px] font-semibold tabular-nums transition-opacity",
                          viewMode === "revenue"
                            ? "opacity-100 text-emerald-700 dark:text-emerald-300"
                            : isHovered
                            ? "opacity-100 text-emerald-600 dark:text-emerald-400"
                            : "opacity-0 sm:group-hover:opacity-100 text-muted-foreground"
                        )}
                      >
                        {d.revenue >= 1000
                          ? `${(d.revenue / 1000).toFixed(1)}k`
                          : d.revenue > 0
                          ? d.revenue
                          : "0"}
                      </span>
                      <div
                        className={cn(
                          "rounded-t-md transition-all duration-300",
                          viewMode === "revenue" ? "w-6 sm:w-8" : "w-3 sm:w-4",
                          isToday
                            ? "bg-emerald-600 dark:bg-emerald-500 shadow-sm shadow-emerald-500/20"
                            : "bg-emerald-300 hover:bg-emerald-400 dark:bg-emerald-700 dark:hover:bg-emerald-600"
                        )}
                        style={{ height: `${Math.max(revenueHeight, 4)}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Day label */}
                <div
                  className={cn(
                    "mt-2 text-xs transition-colors",
                    isToday
                      ? "font-bold text-indigo-600 dark:text-indigo-400"
                      : "font-medium text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {d.label}
                  {isToday && (
                    <span className="ml-0.5 inline-block h-1 w-1 rounded-full bg-indigo-600 align-super dark:bg-indigo-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & hints */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-zinc-100 pt-3 text-xs text-muted-foreground dark:border-zinc-800">
        <div className="flex items-center gap-4">
          {(viewMode === "all" || viewMode === "orders") && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" /> Orders count
            </span>
          )}
          {(viewMode === "all" || viewMode === "revenue") && (
            <span className="inline-flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Revenue (₴)
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          Hover or tap column for full details
        </span>
      </div>
    </div>
  );
}