"use client";

/**
 * Admin / Bookings (G-260)
 *
 * Lists bookings, lets the operator filter by date / status / service,
 * confirm or cancel a booking, and reschedule it (date+time).
 *
 * Data is fetched from /api/admin/bookings. Polling every 15s keeps the
 * dashboard fresh without overwhelming the API.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarCheck2,
  Phone,
  Mail,
  Clock,
  User,
  Wrench,
  CheckCircle2,
  XCircle,
  CalendarClock,
  Loader2,
  Filter,
  RefreshCw,
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BOOKING_STATUSES } from "@/lib/booking-schemas";

type Service = {
  id: string;
  name: string;
  provider?: string;
  masterName?: string;
  duration?: number;
  price?: number;
};

type Booking = {
  id: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  status: (typeof BOOKING_STATUSES)[number];
  createdAt: string;
  updatedAt: string;
  service: Service | null;
};

type DateRange = "today" | "week" | "month" | "all";

const DATE_RANGES: Array<{ value: DateRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "all", label: "All" },
];

const STATUS_META: Record<
  (typeof BOOKING_STATUSES)[number],
  { label: string; tone: string }
> = {
  pending: {
    label: "Pending",
    tone: "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmed",
    tone:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-red-100 text-red-900 dark:bg-red-950/60 dark:text-red-300",
  },
  completed: {
    label: "Completed",
    tone:
      "bg-violet-100 text-violet-900 dark:bg-violet-950/60 dark:text-violet-300",
  },
  rescheduled: {
    label: "Rescheduled",
    tone: "bg-sky-100 text-sky-900 dark:bg-sky-950/60 dark:text-sky-300",
  },
};

const STATUS_FILTERS: Array<{
  value: (typeof BOOKING_STATUSES)[number] | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  ...BOOKING_STATUSES.map((s) => ({
    value: s,
    label: STATUS_META[s].label,
  })),
];

function dateInRange(d: string, range: DateRange): boolean {
  if (range === "all") return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${d}T00:00:00`);

  if (range === "today") {
    return target.getTime() === today.getTime();
  }
  if (range === "week") {
    const start = new Date(today);
    // Week starts Monday for ISO consistency.
    const dow = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dow);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return target >= start && target < end;
  }
  if (range === "month") {
    return (
      target.getFullYear() === today.getFullYear() &&
      target.getMonth() === today.getMonth()
    );
  }
  return true;
}

function formatBookingDate(d: string, locale = "uk-UA"): string {
  const date = new Date(`${d}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === tomorrow.getTime()) return "Tomorrow";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>("today");
  const [statusFilter, setStatusFilter] =
    useState<(typeof BOOKING_STATUSES)[number] | "all">("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  // Reschedule modal
  const [resched, setResched] = useState<{
    open: boolean;
    booking: Booking | null;
    date: string;
    time: string;
    busy: boolean;
    err: string | null;
  }>({
    open: false,
    booking: null,
    date: "",
    time: "",
    busy: false,
    err: null,
  });

  const services = useMemo(() => {
    const map = new Map<string, Service>();
    bookings.forEach((b) => {
      if (b.service) map.set(b.service.id, b.service);
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [bookings]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const json = (await res.json()) as { bookings: Booking[] };
      setBookings(json.bookings ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 15-second polling per spec.
  useEffect(() => {
    const id = setInterval(fetchBookings, 15_000);
    return () => clearInterval(id);
  }, [fetchBookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (!dateInRange(b.date, dateRange)) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (serviceFilter !== "all" && b.serviceId !== serviceFilter)
        return false;
      return true;
    });
  }, [bookings, dateRange, statusFilter, serviceFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    for (const s of BOOKING_STATUSES) {
      c[s] = bookings.filter((b) => b.status === s).length;
    }
    return c as Record<(typeof BOOKING_STATUSES)[number] | "all", number>;
  }, [bookings]);

  const updateBooking = async (
    id: string,
    payload: { status?: string; date?: string; time?: string }
  ) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json.error ?? "Update failed");
        return false;
      }
      // Refresh quietly.
      await fetchBookings();
      return true;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const confirmBooking = (b: Booking) => updateBooking(b.id, { status: "confirmed" });
  const cancelBooking = (b: Booking) => {
    if (!confirm(`Cancel booking for ${b.customerName}?`)) return;
    updateBooking(b.id, { status: "cancelled" });
  };
  const completeBooking = (b: Booking) =>
    updateBooking(b.id, { status: "completed" });

  const openReschedule = (b: Booking) =>
    setResched({
      open: true,
      booking: b,
      date: b.date,
      time: b.time,
      busy: false,
      err: null,
    });

  const closeReschedule = () =>
    setResched({
      open: false,
      booking: null,
      date: "",
      time: "",
      busy: false,
      err: null,
    });

  const submitReschedule = async () => {
    if (!resched.booking) return;
    if (!resched.date || !resched.time) {
      setResched((s) => ({ ...s, err: "Pick both date and time" }));
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(resched.date)) {
      setResched((s) => ({ ...s, err: "Invalid date" }));
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(resched.time)) {
      setResched((s) => ({ ...s, err: "Invalid time" }));
      return;
    }

    setResched((s) => ({ ...s, busy: true, err: null }));
    try {
      const res = await fetch(
        `/api/admin/bookings/${resched.booking.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: resched.date,
            time: resched.time,
          }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setResched((s) => ({
          ...s,
          busy: false,
          err: json.error ?? "Failed to reschedule",
        }));
        return;
      }
      await fetchBookings();
      closeReschedule();
    } catch (err) {
      setResched((s) => ({
        ...s,
        busy: false,
        err: err instanceof Error ? err.message : "Unknown error",
      }));
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Bookings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Confirm, cancel or reschedule incoming appointments. Auto-refreshes
            every 15 seconds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBookings}
            disabled={loading}
          >
            <RefreshCw
              className={cn("h-4 w-4", loading && "animate-spin")}
            />
            Refresh
          </Button>
        </div>
      </header>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Date:</span>
            {DATE_RANGES.map((r) => {
              const active = dateRange === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setDateRange(r.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                  )}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Service:</span>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="all">All services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Status pills */}
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

      {/* Loading / error states */}
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

      {/* Bookings table */}
      {!loading && !error && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wider text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Master</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filtered.map((b) => {
                    const meta = STATUS_META[b.status];
                    const isBusy = busyId === b.id;
                    const isFinal =
                      b.status === "cancelled" || b.status === "completed";
                    return (
                      <tr
                        key={b.id}
                        className={cn(
                          "hover:bg-zinc-50 dark:hover:bg-zinc-900/40",
                          isBusy && "opacity-60"
                        )}
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-1.5 font-medium">
                            <CalendarCheck2 className="h-3.5 w-3.5 text-indigo-500" />
                            {formatBookingDate(b.date)}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="font-mono tabular-nums">
                              {b.time}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium">{b.customerName}</div>
                          <div className="mt-0.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <a
                                href={`tel:${b.customerPhone}`}
                                className="hover:underline"
                              >
                                {b.customerPhone}
                              </a>
                            </span>
                            {b.customerEmail && (
                              <span className="inline-flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <a
                                  href={`mailto:${b.customerEmail}`}
                                  className="hover:underline"
                                >
                                  {b.customerEmail}
                                </a>
                              </span>
                            )}
                          </div>
                          {b.notes && (
                            <div className="mt-1 line-clamp-2 text-xs italic text-muted-foreground">
                              &ldquo;{b.notes}&rdquo;
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium">
                            {b.service?.name ?? b.serviceId}
                          </div>
                          {b.service?.provider && (
                            <div className="text-xs text-muted-foreground">
                              {b.service.provider}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top text-sm">
                          {b.service?.masterName ? (
                            <span className="inline-flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {b.service.masterName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-xs font-semibold",
                              meta.tone
                            )}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap items-center justify-end gap-1">
                            {b.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => confirmBooking(b)}
                                disabled={isBusy}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Confirm
                              </Button>
                            )}
                            {b.status === "confirmed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => completeBooking(b)}
                                disabled={isBusy}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Complete
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReschedule(b)}
                              disabled={isBusy || isFinal}
                            >
                              <CalendarClock className="h-3.5 w-3.5" />
                              Reschedule
                            </Button>
                            {!isFinal && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => cancelBooking(b)}
                                disabled={isBusy}
                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                      >
                        <CalendarCheck2 className="mx-auto h-8 w-8" />
                        <p className="mt-2 font-medium">No bookings found</p>
                        <p className="mt-1 text-xs">
                          {statusFilter !== "all" || serviceFilter !== "all"
                            ? "Try changing your filters."
                            : "New bookings will appear here automatically."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick stats footer */}
      {!loading && !error && bookings.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(["pending", "confirmed", "rescheduled", "completed", "cancelled"] as const).map(
            (s) => (
              <Card key={s}>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wider">
                    {STATUS_META[s].label}
                  </CardDescription>
                  <CardTitle className="text-2xl tabular-nums">
                    {counts[s]}
                  </CardTitle>
                </CardHeader>
              </Card>
            )
          )}
        </div>
      )}

      {/* Reschedule modal */}
      <AnimatePresence>
        {resched.open && resched.booking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
            onClick={closeReschedule}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarClock className="h-5 w-5 text-indigo-500" />
                    Reschedule booking
                  </CardTitle>
                  <CardDescription>
                    <span className="font-medium text-foreground">
                      {resched.booking.customerName}
                    </span>{" "}
                    — {resched.booking.service?.name ?? resched.booking.serviceId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">New date</label>
                      <Input
                        type="date"
                        value={resched.date}
                        onChange={(e) =>
                          setResched((s) => ({ ...s, date: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">New time</label>
                      <Input
                        type="time"
                        value={resched.time}
                        onChange={(e) =>
                          setResched((s) => ({ ...s, time: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                  {resched.err && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                      {resched.err}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={closeReschedule}
                      disabled={resched.busy}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={submitReschedule}
                      disabled={resched.busy}
                    >
                      {resched.busy ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quietly reference Badge so the tree-shaker doesn't drop the import. */}
      <span className="hidden" aria-hidden>
        <Badge variant="secondary" />
      </span>
    </div>
  );
}