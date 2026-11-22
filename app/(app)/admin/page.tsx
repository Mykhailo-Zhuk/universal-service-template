"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  CalendarCheck2,
  Receipt,
  ExternalLink,
  ChevronRight,
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
          throw new Error(
            body.error || `Failed to load dashboard (${res.status})`
          );
        }
        const json = (await res.json()) as DashboardData;
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard"
          );
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
      <div className="mx-auto max-w-lg rounded-[20px] border border-red-300 bg-red-50 p-6 text-center dark:border-red-900/60 dark:bg-red-950/25">
        <AlertCircle className="mx-auto h-10 w-10 text-red-600 dark:text-red-400" />
        <h2 className="mt-3 text-lg font-medium text-red-950 dark:text-red-200">
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
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-normal tracking-[-0.03em] lg:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live overview of orders, revenue, and bookings. Refreshes every 15
            seconds.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const deltaPositive = stat.delta && stat.delta.value >= 0;
          return (
            <Link key={stat.label} href={stat.href} className="block min-w-0">
              <Card className="transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-2 font-mono text-2xl font-medium tabular-nums text-foreground">
                        {stat.value}
                      </p>
                      {stat.delta && (
                        <Badge
                          variant={deltaPositive ? "mint" : "warning"}
                          className="mt-2.5 font-mono"
                        >
                          {deltaPositive ? "+" : "-"}
                          {Math.abs(stat.delta.value).toFixed(0)}
                          {stat.delta.suffix}
                        </Badge>
                      )}
                    </div>
                    <div className="shrink-0 rounded-[10px] border border-border bg-surface p-2.5 text-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 lg:col-span-2">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle>Orders this week</CardTitle>
            <CardDescription>
              Order count and revenue per day, last 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <WeeklyChart series={data.weeklySeries} />
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle>Popular items</CardTitle>
            <CardDescription>
              Top sellers across all paid orders.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
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
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-medium",
                        idx === 0
                          ? "bg-[#a1ffcb] text-[#232323]"
                          : "bg-surface text-foreground border border-border"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {item.name}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {item.quantity} sold · {formatPrice(item.revenue)}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="min-w-0 overflow-hidden lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-5 sm:p-6">
            <div className="min-w-0">
              <CardTitle>Latest orders</CardTitle>
              <CardDescription>
                Five most recent orders across all tables.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="shrink-0">
              <Link href="/admin/orders">
                See all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="divide-y divide-border">
              {data.lastOrders.map((order) => {
                const meta = ORDER_STATUS_META[order.status];
                return (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="-mx-2 flex items-center justify-between gap-2.5 rounded-[10px] px-2 py-3 transition-colors hover:bg-surface"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="shrink-0 font-medium text-foreground">
                          {order.tableLabel ?? `Table #${order.tableId}`}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          · {order.customerName}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {order.items.length} item
                        {order.items.length === 1 ? "" : "s"} ·{" "}
                        {relativeTime(order.createdAt)} ·{" "}
                        {timeOfDay(order.createdAt)}
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          meta.tone
                        )}
                      >
                        {meta.label}
                      </span>
                      <span className="shrink-0 font-mono text-sm font-medium tabular-nums text-foreground">
                        {formatPrice(order.total)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="p-5 sm:p-6">
            <CardTitle>Quick links</CardTitle>
            <CardDescription>Jump to the most-used views.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 p-5 pt-0 sm:p-6 sm:pt-0">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/admin/orders">
                <span className="truncate">Orders dashboard</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/admin/menu">
                <span className="truncate">Manage menu</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/admin/bookings">
                <span className="truncate">Bookings</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/menu/demo-restaurant/table/5">
                <span className="truncate">Test QR flow (Table #5)</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  const [hoveredDay, setHoveredDay] = useState<
    DashboardData["weeklySeries"][0] | null
  >(null);

  const activeDay = hoveredDay || todayItem || series[series.length - 1];

  const maxOrders = Math.max(1, ...series.map((d) => d.orders));
  const maxRevenue = Math.max(1, ...series.map((d) => d.revenue));

  const totalOrders = series.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = series.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {hoveredDay
              ? `${hoveredDay.label} (${hoveredDay.date.slice(5)})`
              : activeDay?.date === todayStr
              ? "Weekly total"
              : "Weekly total"}
          </span>
          <div className="mt-0.5 flex items-center gap-3 font-mono text-sm font-medium">
            <span className="text-foreground">
              {hoveredDay ? hoveredDay.orders : totalOrders} orders
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-emerald-700 dark:text-[#a1ffcb]">
              {formatPrice(hoveredDay ? hoveredDay.revenue : totalRevenue)}
            </span>
          </div>
        </div>

        <div className="inline-flex self-start rounded-[10px] border border-border bg-surface p-0.5 text-xs sm:self-auto">
          {(
            [
              { value: "all", label: "Combined" },
              { value: "orders", label: "Orders" },
              { value: "revenue", label: "Revenue" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setViewMode(tab.value)}
              className={cn(
                "rounded-[8px] px-3 py-1.5 font-medium transition-colors",
                viewMode === tab.value
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden pt-6">
        <div className="pointer-events-none absolute inset-x-0 bottom-6 top-8 flex flex-col justify-between">
          <div className="border-b border-dashed border-border" />
          <div className="border-b border-dashed border-border" />
          <div className="border-b border-border" />
        </div>

        <div className="relative flex h-48 items-end gap-1.5 sm:gap-4">
          {series.map((d, idx) => (
            <ChartDayColumn
              key={d.date}
              day={d}
              index={idx}
              total={series.length}
              maxOrders={maxOrders}
              maxRevenue={maxRevenue}
              viewMode={viewMode}
              isToday={d.date === todayStr}
              isHovered={hoveredDay?.date === d.date}
              onHover={setHoveredDay}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          {(viewMode === "all" || viewMode === "orders") && (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-foreground" />
              Orders count
            </span>
          )}
          {(viewMode === "all" || viewMode === "revenue") && (
            <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#a1ffcb] ring-1 ring-[#232323]/20" />
              Revenue (₴)
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">
          Hover or tap a column for details
        </span>
      </div>
    </div>
  );
}

type DayPoint = DashboardData["weeklySeries"][number];

function formatCompactRevenue(revenue: number): string {
  if (revenue >= 1000) return `${(revenue / 1000).toFixed(1)}k`;
  return revenue > 0 ? String(revenue) : "0";
}

function ChartDayColumn({
  day,
  index,
  total,
  maxOrders,
  maxRevenue,
  viewMode,
  isToday,
  isHovered,
  onHover,
}: {
  day: DayPoint;
  index: number;
  total: number;
  maxOrders: number;
  maxRevenue: number;
  viewMode: "all" | "orders" | "revenue";
  isToday: boolean;
  isHovered: boolean;
  onHover: (d: DayPoint | null) => void;
}) {
  const ordersHeight = Math.max((day.orders / maxOrders) * 100, 4);
  const revenueHeight = Math.max((day.revenue / maxRevenue) * 100, 4);
  const tooltipPos =
    index === 0
      ? "left-0"
      : index === total - 1
      ? "right-0"
      : "left-1/2 -translate-x-1/2";
  const barWidth = (mode: "orders" | "revenue") =>
    viewMode === mode ? "w-6 sm:w-8" : "w-3 sm:w-4";

  return (
    <div
      onMouseEnter={() => onHover(day)}
      onMouseLeave={() => onHover(null)}
      className="group relative flex flex-1 cursor-pointer flex-col items-center"
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-12 z-30 whitespace-nowrap rounded-[10px] border border-border-strong bg-background px-2.5 py-1.5 text-center text-xs transition-opacity duration-150",
          tooltipPos,
          isHovered ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="font-medium text-foreground">
          {day.label} · {day.date.slice(5)}
        </div>
        <div className="flex items-center justify-center gap-1.5 font-mono text-[11px]">
          <span className="text-foreground">
            {day.orders} {day.orders === 1 ? "order" : "orders"}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-emerald-700 dark:text-[#a1ffcb]">
            {formatPrice(day.revenue)}
          </span>
        </div>
      </div>

      <div className="relative flex h-36 w-full items-end justify-center gap-1 pb-1 sm:gap-1.5">
        {viewMode !== "revenue" && (
          <div className="flex h-full flex-col items-center justify-end">
            <span
              className={cn(
                "mb-1 font-mono text-[10px] font-medium tabular-nums transition-opacity",
                viewMode === "orders" || isHovered || isToday
                  ? "opacity-100 text-foreground"
                  : "opacity-0 text-muted-foreground sm:group-hover:opacity-100"
              )}
            >
              {day.orders}
            </span>
            <div
              className={cn(
                "rounded-t-[4px] transition-colors duration-150",
                barWidth("orders"),
                isToday
                  ? "bg-foreground"
                  : "bg-[#232323]/25 group-hover:bg-[#232323]/55 dark:bg-white/30 dark:group-hover:bg-white/60"
              )}
              style={{ height: `${ordersHeight}%` }}
            />
          </div>
        )}

        {viewMode !== "orders" && (
          <div className="flex h-full flex-col items-center justify-end">
            <span
              className={cn(
                "mb-1 font-mono text-[10px] font-medium tabular-nums transition-opacity",
                viewMode === "revenue" || isHovered
                  ? "opacity-100 text-emerald-700 dark:text-[#a1ffcb]"
                  : "opacity-0 text-muted-foreground sm:group-hover:opacity-100"
              )}
            >
              {formatCompactRevenue(day.revenue)}
            </span>
            <div
              className={cn(
                "rounded-t-[4px] transition-colors duration-150",
                barWidth("revenue"),
                isToday
                  ? "bg-[#16a34a] dark:bg-[#a1ffcb]"
                  : "bg-[#a1ffcb] ring-1 ring-[#232323]/15 group-hover:bg-[#7ef5b5] dark:bg-[#a1ffcb]/45 dark:ring-0 dark:group-hover:bg-[#a1ffcb]/80"
              )}
              style={{ height: `${revenueHeight}%` }}
            />
          </div>
        )}
      </div>

      <div
        className={cn(
          "mt-2 font-mono text-xs transition-colors",
          isToday
            ? "font-medium text-foreground"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {day.label}
        {isToday && (
          <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-[#a1ffcb] align-middle ring-1 ring-[#232323]/25" />
        )}
      </div>
    </div>
  );
}
