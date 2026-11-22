"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  AlertCircle,
  Check,
  ChevronRight,
} from "lucide-react";
import type { Service, ServiceSlot } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { SlotDayCard } from "@/components/slot-day-grid";
import { formatPrice, formatSlotDate } from "@/lib/utils";
import {
  generateSlotsForService,
  getSlotsByDate,
  getRelatedServices,
} from "@/lib/data-helpers";

type ApiResponse = {
  slot: ServiceSlot;
  service: Pick<
    Service,
    "id" | "name" | "duration" | "price" | "provider" | "masterName"
  >;
};

export default function SlotDetailPage() {
  const { serviceId, slotId } = useParams<{
    serviceId: string;
    slotId: string;
  }>();
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

  const allSlots = useMemo(
    () => (serviceId ? generateSlotsForService(serviceId, 7) : []),
    [serviceId]
  );
  const groupedSlots = useMemo(() => getSlotsByDate(allSlots), [allSlots]);
  const dates = useMemo(() => Object.keys(groupedSlots).sort(), [groupedSlots]);

  useEffect(() => {
    if (!serviceId || !slotId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/book/${serviceId}/slot/${slotId}`);
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
  }, [serviceId, slotId]);

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-md rounded-[20px] border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-600 dark:text-red-400" />
          <h2 className="mt-4 text-xl font-medium tracking-[-0.02em]">
            Slot not found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "This time slot may have expired."}
          </p>
          <Button asChild className="mt-6">
            <Link href={`/book/${serviceId}`}>
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
          serviceId,
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
      <main className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md rounded-[20px] border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#a1ffcb] text-[#232323]">
            <Check className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-normal tracking-[-0.025em]">
            You&apos;re booked
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">{service.name}</span>{" "}
            with {service.masterName ?? service.provider} on{" "}
            <span className="font-medium text-foreground">
              {formatSlotDate(activeSlot.date)} at {activeSlot.time}
            </span>
            .
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            We&apos;ll send a reminder before your appointment.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/">Done</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 px-2.5">
            <Link href={`/book/${serviceId}`}>
              <ArrowLeft className="h-4 w-4" />
              All slots
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
        <div className="rounded-[20px] border border-border bg-[#232323] p-6 text-white sm:p-7 dark:bg-[#1e1e1e]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-[#a1ffcb] px-2.5 py-0.5 text-xs font-medium text-[#232323]">
                {service.provider}
              </span>
              <h1 className="mt-3.5 text-2xl font-normal tracking-[-0.025em] sm:text-3xl">
                {service.name}
              </h1>
              {service.masterName && (
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/75">
                  <User className="h-3.5 w-3.5" />
                  with {service.masterName}
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-white/80">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#a1ffcb]" />
                  {service.duration} min
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-[#a1ffcb]" />
                  {activeSlot
                    ? `${formatSlotDate(activeSlot.date)} · ${activeSlot.time}`
                    : `${formatSlotDate(slot.date)} · ${slot.time}`}
                </span>
              </div>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-xs text-white/65">Price</p>
              <p className="mt-0.5 font-mono text-3xl font-medium tabular-nums text-white">
                {service.price > 0 ? formatPrice(service.price) : "Free"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Available time slots (next 7 days)
          </h2>
          <div className="space-y-3">
            {dates.map((date) => (
              <SlotDayCard
                key={date}
                date={date}
                slots={groupedSlots[date] ?? []}
                columnsClass="grid-cols-3 gap-2 sm:grid-cols-5"
                renderSlot={(s) => {
                  const active = s.id === activeSlotId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSelectedSlotId(s.id)}
                      className={`rounded-[8px] border px-2 py-2.5 font-mono text-sm font-medium transition-colors ${
                        active
                          ? "border-foreground bg-primary text-primary-foreground"
                          : s.available
                          ? "border-border bg-background text-foreground hover:border-foreground hover:bg-surface"
                          : "cursor-not-allowed border-border bg-surface text-muted-foreground opacity-45 line-through"
                      }`}
                    >
                      {s.time}
                    </button>
                  );
                }}
              />
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-[20px] border border-border bg-card p-6"
        >
          <div>
            <h2 className="text-base font-medium tracking-[-0.01em] text-foreground">
              Your details
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              We use your phone number only to confirm this appointment.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="booking-name"
                className="block text-xs font-medium text-foreground"
              >
                Name
              </label>
              <Input
                id="booking-name"
                required
                minLength={2}
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="booking-phone"
                className="block text-xs font-medium text-foreground"
              >
                Phone
              </label>
              <Input
                id="booking-phone"
                required
                type="tel"
                value={form.customerPhone}
                onChange={(e) =>
                  setForm({ ...form, customerPhone: e.target.value })
                }
                placeholder="+380 ..."
              />
            </div>
          </div>

          {formError && (
            <div className="flex items-center gap-2 rounded-[10px] border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/35 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Selected:{" "}
              <span className="font-mono font-medium text-foreground">
                {activeSlot
                  ? `${formatSlotDate(activeSlot.date)} · ${activeSlot.time}`
                  : "—"}
              </span>
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={submitting || !activeSlot}
            >
              {submitting ? "Booking..." : "Book this slot"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>

        {related.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Related services
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((s) => {
                const sSlots = generateSlotsForService(s.id, 7);
                const firstAvailable = sSlots.find((x) => x.available);
                const targetSlotId = firstAvailable?.id ?? sSlots[0]?.id;
                return (
                  <Link
                    key={s.id}
                    href={`/book/${s.id}/slot/${targetSlotId}`}
                    className="group block rounded-[16px] border border-border bg-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-foreground">
                          {s.name}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {s.description}
                        </p>
                        <div className="mt-2.5 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {s.duration} min
                        </div>
                      </div>
                      <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-foreground">
                        {s.price > 0 ? formatPrice(s.price) : "Free"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <footer className="mt-8 border-t border-border py-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span className="inline-flex items-center gap-2">
            <BrandMark size={14} className="text-foreground" />
            Universal Service Template
          </span>
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
