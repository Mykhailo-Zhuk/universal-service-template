"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Clock,
  Phone,
  Hash,
  Loader2,
  ChevronRight,
  Bell,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusFilterPills } from "@/components/admin/status-filter-pills";
import { cn, formatPrice } from "@/lib/utils";
import {
  ORDER_STATUS_META,
  ORDER_NEXT_STATUS,
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_META,
  relativeTime,
  timeOfDay,
} from "@/lib/admin-helpers";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/lib/schemas";
import { ORDER_STATUSES } from "@/lib/schemas";

const STATUS_FILTERS: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "served", label: "Served" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
];

type Toast = { id: string; text: string };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastSeenIdsRef = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load orders");
      const json = (await res.json()) as { orders: Order[] };
      const next = json.orders;
      setOrders(next);

      const seen = lastSeenIdsRef.current;
      const fresh = next.filter((o) => !seen.has(o.id));
      if (seen.size > 0 && fresh.length > 0) {
        setToasts((prev) => [
          ...prev,
          ...fresh.map((o) => ({
            id: o.id,
            text: `${o.tableLabel ?? `Table #${o.tableId}`} — ${
              o.customerName
            } · ${formatPrice(o.total)}`,
          })),
        ]);
      }
      next.forEach((o) => seen.add(o.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    if (toasts.length === 0) return;
    const t = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 4_000);
    return () => clearTimeout(t);
  }, [toasts]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of ORDER_STATUSES) {
      c[s] = orders.filter((o) => o.status === s).length;
    }
    return c as Record<OrderStatus | "all", number>;
  }, [orders]);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: newStatus,
              paymentStatus:
                newStatus === "paid"
                  ? "paid"
                  : newStatus === "cancelled"
                    ? "refunded"
                    : o.paymentStatus,
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    const patch: { status: OrderStatus; paymentStatus?: PaymentStatus } = {
      status: newStatus,
    };
    if (newStatus === "paid") patch.paymentStatus = "paid";
    if (newStatus === "cancelled") patch.paymentStatus = "refunded";

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        await fetchOrders();
        throw new Error("Failed to update order");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-normal tracking-[-0.03em] lg:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live feed of all restaurant orders. Refreshes every 5 seconds.
          </p>
        </div>
      </header>

      <StatusFilterPills
        options={STATUS_FILTERS}
        value={statusFilter}
        counts={counts}
        onChange={setStatusFilter}
      />

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-red-600 dark:text-red-400">
            {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={() => {
                  const next = ORDER_NEXT_STATUS[order.status];
                  if (next) handleStatusChange(order.id, next);
                }}
                onCancel={() => handleStatusChange(order.id, "cancelled")}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto h-9 w-9 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              New orders from the QR menu will appear here automatically.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="pointer-events-none fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-full sm:max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-center gap-3 rounded-[14px] border border-border-strong bg-background p-3.5"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a1ffcb] text-[#232323]">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-medium text-foreground">New order</div>
                <div className="truncate text-xs text-muted-foreground">
                  {t.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onAdvance,
  onCancel,
}: {
  order: Order;
  onAdvance: () => void;
  onCancel: () => void;
}) {
  const meta = ORDER_STATUS_META[order.status];
  const paymentMeta = PAYMENT_STATUS_META[order.paymentStatus];
  const paymentMethod = order.paymentMethod
    ? PAYMENT_METHOD_META[order.paymentMethod]
    : null;
  const next = ORDER_NEXT_STATUS[order.status];
  const isCancelled = order.status === "cancelled";
  const isTerminal = order.status === "paid" || isCancelled;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "overflow-hidden",
          order.status === "new" && "border-foreground"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base">
                {order.status === "new" ? (
                  <span className="h-2 w-2 rounded-full bg-[#a1ffcb] ring-1 ring-[#232323]/30" />
                ) : (
                  <Hash className="h-4 w-4 text-muted-foreground" />
                )}
                {order.tableLabel ?? `Table #${order.tableId}`}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1.5 font-mono text-xs">
                <Clock className="h-3 w-3" />
                <span className="tabular-nums">
                  {timeOfDay(order.createdAt)}
                </span>
                <span>·</span>
                <span className="font-sans">
                  {relativeTime(order.createdAt)}
                </span>
              </CardDescription>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
                meta.tone
              )}
            >
              {meta.label}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3.5 pb-5 pt-0">
          <div className="space-y-0.5 text-sm">
            <div className="font-medium text-foreground">
              {order.customerName}
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <a href={`tel:${order.customerPhone}`} className="hover:underline">
                {order.customerPhone}
              </a>
            </div>
          </div>

          <ul className="divide-y divide-border rounded-[12px] border border-border bg-surface text-sm">
            {order.items.map((item, idx) => {
              const unit = item.price + (item.variationPriceDelta ?? 0);
              return (
                <li
                  key={`${item.itemId}-${idx}`}
                  className="flex items-start justify-between gap-2 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">
                      <span className="font-mono">{item.quantity}×</span>{" "}
                      {item.name}
                    </div>
                    {item.variationName && (
                      <div className="text-xs text-muted-foreground">
                        {item.variationName}
                      </div>
                    )}
                    {item.notes && (
                      <div className="mt-0.5 text-xs italic text-muted-foreground">
                        &ldquo;{item.notes}&rdquo;
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 font-mono tabular-nums text-foreground">
                    {formatPrice(unit * item.quantity)}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  paymentMeta.tone
                )}
              >
                {paymentMeta.label}
              </span>
              {paymentMethod && (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                  {paymentMethod.label}
                </span>
              )}
            </div>
            <div className="font-mono text-base font-medium tabular-nums text-foreground">
              {formatPrice(order.total)}
            </div>
          </div>

          {order.notes && order.status !== "new" && (
            <div className="rounded-[10px] border border-amber-300/80 bg-amber-50/70 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <span className="font-medium">Note:</span> {order.notes}
            </div>
          )}

          {!isTerminal && (
            <div className="flex items-center gap-2 pt-1">
              {next && (
                <Button size="sm" className="flex-1" onClick={onAdvance}>
                  {ORDER_STATUS_META[next].label}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
              {!isCancelled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}

          {isCancelled && (
            <Badge variant="warning" className="w-full justify-center py-1">
              Order cancelled
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
