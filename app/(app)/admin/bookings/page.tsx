"use client";

/**
 * Admin / Bookings (G-260)
 *
 * Lists bookings, lets the operator filter by date / status / service,
 * confirm or cancel a booking, and reschedule it (date+time).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusFilterPills } from "@/components/admin/status-filter-pills";
import { ModalDialog } from "@/components/admin/modal-dialog";
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
  date: string;
  time: string;
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
    tone: "bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-300",
  },
  confirmed: {
    label: "Confirmed",
    tone:
      "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-red-100 text-red-950 dark:bg-red-950/60 dark:text-red-300",
  },
  completed: {
    label: "Completed",
    tone:
      "bg-[#a1ffcb] text-[#173324] dark:bg-[#a1ffcb]/20 dark:text-[#a1ffcb]",
  },
  rescheduled: {
    label: "Rescheduled",
    tone: "bg-surface text-foreground border border-border",
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
  const [statusFilter, setStatusFilter] = useState<
    (typeof BOOKING_STATUSES)[number] | "all"
  >("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

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
      await fetchBookings();
      return true;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const confirmBooking = (b: Booking) =>
    updateBooking(b.id, { status: "confirmed" });
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
      const res = await fetch(`/api/admin/bookings/${resched.booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: resched.date,
          time: resched.time,
        }),
      });
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
          <h1 className="text-2xl font-normal tracking-[-0.03em] lg:text-3xl">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confirm, cancel, or reschedule incoming appointments. Refreshes
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
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

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
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-foreground bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-border-strong"
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
              className="h-9 rounded-[8px] border border-border-strong bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
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
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-surface text-left text-xs font-medium text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">When</th>
                    <th className="px-4 py-3.5 font-medium">Customer</th>
                    <th className="px-4 py-3.5 font-medium">Service</th>
                    <th className="px-4 py-3.5 font-medium">Master</th>
                    <th className="px-4 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((b) => {
                    const meta = STATUS_META[b.status];
                    const isBusy = busyId === b.id;
                    const isFinal =
                      b.status === "cancelled" || b.status === "completed";
                    return (
                      <tr
                        key={b.id}
                        className={cn(
                          "transition-colors hover:bg-surface",
                          isBusy && "opacity-60"
                        )}
                      >
                        <td className="px-5 py-3.5 align-top">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <CalendarCheck2 className="h-3.5 w-3.5 text-foreground" />
                            {formatBookingDate(b.date)}
                          </div>
                          <div className="mt-1 flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="tabular-nums">{b.time}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <div className="font-medium text-foreground">
                            {b.customerName}
                          </div>
                          <div className="mt-0.5 flex flex-col gap-0.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1 font-mono">
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
                        <td className="px-4 py-3.5 align-top">
                          <div className="font-medium text-foreground">
                            {b.service?.name ?? b.serviceId}
                          </div>
                          {b.service?.provider && (
                            <div className="text-xs text-muted-foreground">
                              {b.service.provider}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 align-top text-sm">
                          {b.service?.masterName ? (
                            <span className="inline-flex items-center gap-1 text-foreground">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {b.service.masterName}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 align-top">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                              meta.tone
                            )}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 align-top">
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
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
                                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
                        <p className="mt-2 font-medium text-foreground">
                          No bookings found
                        </p>
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

      {!loading && !error && bookings.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              "pending",
              "confirmed",
              "rescheduled",
              "completed",
              "cancelled",
            ] as const
          ).map((s) => (
            <Card key={s}>
              <CardHeader className="p-4">
                <CardDescription className="text-xs">
                  {STATUS_META[s].label}
                </CardDescription>
                <CardTitle className="font-mono text-2xl font-medium tabular-nums">
                  {counts[s]}
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <ModalDialog
        open={resched.open && !!resched.booking}
        onClose={closeReschedule}
        maxWidth="max-w-md"
      >
        {resched.booking && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-foreground" />
                Reschedule booking
              </CardTitle>
              <CardDescription>
                <span className="font-medium text-foreground">
                  {resched.booking.customerName}
                </span>{" "}
                — {resched.booking.service?.name ?? resched.booking.serviceId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    htmlFor="resched-date"
                    className="block text-xs font-medium text-foreground"
                  >
                    New date
                  </label>
                  <Input
                    id="resched-date"
                    type="date"
                    value={resched.date}
                    onChange={(e) =>
                      setResched((s) => ({ ...s, date: e.target.value }))
                    }
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="resched-time"
                    className="block text-xs font-medium text-foreground"
                  >
                    New time
                  </label>
                  <Input
                    id="resched-time"
                    type="time"
                    value={resched.time}
                    onChange={(e) =>
                      setResched((s) => ({ ...s, time: e.target.value }))
                    }
                    className="font-mono"
                  />
                </div>
              </div>
              {resched.err && (
                <div className="rounded-[10px] border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
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
                <Button onClick={submitReschedule} disabled={resched.busy}>
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
        )}
      </ModalDialog>
    </div>
  );
}
