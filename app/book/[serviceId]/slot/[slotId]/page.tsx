"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import type { Service, ServiceSlot } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  formatPrice,
  formatSlotDate,
} from "@/lib/utils";
import { generateSlotsForService, getSlotsByDate, getRelatedServices } from "@/lib/data-helpers";

type Props = {
  params: { serviceId: string; slotId: string };
};

type ApiResponse = {
  slot: ServiceSlot;
  service: Pick<Service, "id" | "name" | "duration" | "price" | "provider" | "masterName">;
};

export default function SlotDetailPage({ params }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // All slots for this service (for the week picker).
  const allSlots = useMemo(
    () => generateSlotsForService(params.serviceId, 7),
    [params.serviceId]
  );
  const groupedSlots = useMemo(() => getSlotsByDate(allSlots), [allSlots]);
  const dates = useMemo(() => Object.keys(groupedSlots).sort(), [groupedSlots]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/book/${params.serviceId}/slot/${params.slotId}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as ApiResponse;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.serviceId, params.slotId]);

  // Default: the slot we navigated to is pre-selected, otherwise first available.
  useEffect(() => {
    if (!selectedSlotId && data) {
      setSelectedSlotId(data.slot.id);
    }
  }, [data, selectedSlotId]);

  const related = useMemo(() => {
    if (!data) return [];
    return getRelatedServices(
      {
        ...data.service,
        description: "",
        available: true,
        provider: data.service.provider,
      } as Service,
      3
    );
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Slot not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "This time slot may have expired."}
          </p>
          <Button asChild className="mt-6">
            <Link href={`/book/${params.serviceId}`}>
              <ArrowLeft className="h-4 w-4" />
              Pick another time
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { slot, service } = data;
  const activeSlotId = selectedSlotId ?? slot.id;
  const activeSlot = allSlots.find((s) => s.id === activeSlotId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeSlot) return;
    setFormError(null);

    if (form.customerName.trim().length < 2) {
      setFormError("Please enter your name (at least 2 characters).");
      return;
    }
    if (form.customerPhone.trim().length < 8) {
      setFormError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: params.serviceId,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          date: activeSlot.date,
          time: activeSlot.time,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Booking failed");
      }
      setConfirmed(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed && activeSlot) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-6 dark:from-emerald-950/30 dark:to-teal-950/30">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="max-w-md rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-800 dark:bg-zinc-950"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">You&apos;re booked!</h2>
          <p className="mt-2 text-muted-foreground">
            <span className="font-semibold">{service.name}</span> with{" "}
            {service.masterName ?? service.provider} on{" "}
            <span className="font-semibold">
              {formatSlotDate(activeSlot.date)} at {activeSlot.time}
            </span>
            .
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            We&apos;ll send a reminder before your appointment.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Done</Link>
          </Button>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/book/${params.serviceId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Service header card */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-3xl px-4 pt-6"
      >
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge className="mb-2 bg-white/20 text-white hover:bg-white/20">
                {service.provider}
              </Badge>
              <h1 className="text-2xl font-bold sm:text-3xl">{service.name}</h1>
              {service.masterName && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                  <User className="h-3.5 w-3.5" />
                  with {service.masterName}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/85">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration} min
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatSlotDate(slot.date)} · {slot.time}
                </span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs uppercase tracking-wider text-white/70">
                Price
              </p>
              <p className="text-3xl font-bold tabular-nums">
                {service.price > 0 ? formatPrice(service.price) : "Free"}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Week picker + booking form */}
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Available time slots (next 7 days)
          </h2>
          <div className="space-y-3">
            {dates.map((date) => {
              const daySlots = groupedSlots[date] ?? [];
              const availableCount = daySlots.filter((s) => s.available).length;
              return (
                <div
                  key={date}
                  className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      {formatSlotDate(date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {availableCount > 0
                        ? `${availableCount} free`
                        : "fully booked"}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {daySlots.map((s) => {
                      const active = s.id === activeSlotId;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          disabled={!s.available}
                          onClick={() => setSelectedSlotId(s.id)}
                          className={`rounded-md border px-2 py-2 text-sm font-medium transition-all ${
                            active
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : s.available
                              ? "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                              : "cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300 line-through dark:border-zinc-900 dark:bg-zinc-950/40 dark:text-zinc-700"
                          }`}
                        >
                          {s.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Your details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-medium">Name</label>
              <input
                required
                minLength={2}
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                placeholder="John Doe"
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Phone</label>
              <input
                required
                type="tel"
                value={form.customerPhone}
                onChange={(e) =>
                  setForm({ ...form, customerPhone: e.target.value })
                }
                placeholder="+380 ..."
                className="h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </div>

          {formError && (
            <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Selected:{" "}
              <span className="font-medium text-foreground">
                {activeSlot
                  ? `${formatSlotDate(activeSlot.date)} · ${activeSlot.time}`
                  : "—"}
              </span>
            </p>
            <Button type="submit" size="lg" disabled={submitting || !activeSlot}>
              {submitting ? "Booking..." : "Book this slot"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.form>

        {related.length > 0 && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Related services
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((s) => {
                // Pick the first available slot for the link.
                const sSlots = generateSlotsForService(s.id, 7);
                const firstAvailable = sSlots.find((x) => x.available);
                const targetSlotId = firstAvailable?.id ?? sSlots[0]?.id;
                return (
                  <Link
                    key={s.id}
                    href={`/book/${s.id}/slot/${targetSlotId}`}
                    className="group block rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {s.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {s.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {s.duration} min
                        </div>
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                        {s.price > 0 ? formatPrice(s.price) : "Free"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-xs text-muted-foreground dark:border-zinc-800">
        <p>Powered by Universal Service Template</p>
      </footer>
    </main>
  );
}
