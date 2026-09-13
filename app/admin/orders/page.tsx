"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Clock,
  Phone,
  Hash,
  Loader2,
  Volume2,
  VolumeX,
  ChevronDown,
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
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">(
    "all"
  );
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastSeenIdsRef = useRef<Set<string>>(new Set());

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load orders");
      const json = (await res.json()) as { orders: Order[] };
      const next = json.orders;
      setOrders(next);

      // Detect new orders → toast + (optional) beep.
      const seen = lastSeenIdsRef.current;
      const fresh = next.filter((o) => !seen.has(o.id));
      if (seen.size > 0 && fresh.length > 0) {
        setToasts((prev) => [
          ...prev,
          ...fresh.map((o) => ({
            id: o.id,
            text: `${o.tableLabel ?? `Table #${o.tableId}`} — ${
              o.customerName
            } • ${formatPrice(o.total)}`,
          })),
        ]);
        if (soundEnabled) playBeep();
      }
      next.forEach((o) => seen.add(o.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [soundEnabled]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5_000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Auto-dismiss toasts.
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

  const handleStatusChange = async (
    id: string,
    newStatus: OrderStatus
  ) => {
    // Optimistic update.
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
        // Rollback on failure.
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
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-muted-foreground">
            Live feed of all restaurant orders. Auto-refreshes every 5
            seconds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled((v) => !v)}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            {soundEnabled ? "Sound on" : "Sound off"}
          </Button>
        </div>
      </header>

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value;
          const count = counts[f.value];
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                active
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                  active
                    ? "bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-red-600">
            {error}
          </CardContent>
        </Card>
      )}

      {/* Orders grid */}
      {!loading && !error && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No orders yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              New orders from QR menu will appear here automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Toast notifications */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-auto flex items-center gap-3 rounded-lg border border-indigo-200 bg-white p-3 shadow-lg dark:border-indigo-800 dark:bg-zinc-950"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-semibold">New order</div>
                <div className="truncate text-muted-foreground">{t.text}</div>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        className={cn(
          "overflow-hidden",
          order.status === "new" &&
            "ring-2 ring-indigo-300 dark:ring-indigo-700"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hash className="h-4 w-4 text-muted-foreground" />
                {order.tableLabel ?? `Table #${order.tableId}`}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span className="font-mono tabular-nums">
                  {timeOfDay(order.createdAt)}
                </span>
                <span>•</span>
                <span>{relativeTime(order.createdAt)}</span>
              </CardDescription>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                meta.tone
              )}
            >
              {meta.label}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-4 pt-0">
          {/* Customer */}
          <div className="space-y-1 text-sm">
            <div className="font-medium">{order.customerName}</div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <a
                href={`tel:${order.customerPhone}`}
                className="hover:underline"
              >
                {order.customerPhone}
              </a>
            </div>
          </div>

          {/* Items */}
          <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-100 text-sm dark:divide-zinc-800 dark:border-zinc-800">
            {order.items.map((item, idx) => {
              const unit =
                item.price + (item.variationPriceDelta ?? 0);
              return (
                <li
                  key={`${item.itemId}-${idx}`}
                  className="flex items-start justify-between gap-2 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {item.quantity}× {item.name}
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
                  <div className="shrink-0 tabular-nums">
                    {formatPrice(unit * item.quantity)}
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Total + payment row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  paymentMeta.tone
                )}
              >
                {paymentMeta.label}
              </span>
              {paymentMethod && (
                <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs dark:border-zinc-700">
                  {paymentMethod.icon} {paymentMethod.label}
                </span>
              )}
            </div>
            <div className="text-base font-bold tabular-nums">
              {formatPrice(order.total)}
            </div>
          </div>

          {order.notes && order.status !== "new" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              📝 {order.notes}
            </div>
          )}

          {/* Actions */}
          {!isTerminal && (
            <div className="flex items-center gap-2">
              {next && (
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={onAdvance}
                >
                  {ORDER_STATUS_META[next].label}
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                </Button>
              )}
              {!isCancelled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
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

/**
 * Plays a short beep via the Web Audio API.
 * No external file needed; AudioContext is lazy-initialised to comply with
 * browser autoplay policies (must be created after a user gesture).
 */
function playBeep() {
  try {
    const Ctx =
      window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (err) {
    console.warn("[playBeep]", err);
  }
}