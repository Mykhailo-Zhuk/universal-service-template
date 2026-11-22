"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Clock, User, AlertCircle, ArrowLeft, Calendar } from "lucide-react";
import type { Service } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { SlotDayCard } from "@/components/slot-day-grid";
import { formatPrice } from "@/lib/utils";
import { generateSlotsForService, getSlotsByDate } from "@/lib/data-helpers";

export default function BookPage() {
  const { serviceId } = useParams<{ serviceId: string }>();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/book?serviceId=${serviceId}`);
        if (!res.ok) throw new Error("Service not found");
        const data = await res.json();
        if (!cancelled) setService(data.service);
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
  }, [serviceId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-sm rounded-[20px] border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-600 dark:text-red-400" />
          <h2 className="mt-4 text-xl font-medium tracking-[-0.02em]">
            Service not found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const slots = serviceId ? generateSlotsForService(serviceId, 7) : [];
  const byDate = getSlotsByDate(slots);
  const dates = Object.keys(byDate).sort();
  const totalAvailable = slots.filter((s) => s.available).length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="-ml-2 px-2.5">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Home
              </Link>
            </Button>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <span className="inline-flex items-center gap-2 text-sm font-medium">
              <BrandMark size={18} />
              Book appointment
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-[20px] border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Badge variant="mint">{service.provider}</Badge>
              <h1 className="mt-4 text-3xl font-normal tracking-[-0.03em] leading-[1.1] sm:text-[38px]">
                {service.name}
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                {service.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Clock className="h-3.5 w-3.5 text-foreground" />
                  {service.duration} min
                </span>
                {service.masterName && (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-foreground" />
                    {service.masterName}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0 sm:text-right">
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="mt-0.5 font-mono text-2xl font-medium tabular-nums text-foreground sm:text-3xl">
                {service.price > 0 ? formatPrice(service.price) : "Free"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="inline-flex items-center gap-2 text-base font-medium tracking-[-0.01em]">
              <Calendar className="h-4 w-4 text-foreground" />
              Pick a time slot
            </h2>
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-[#a1ffcb] ring-1 ring-[#232323]/20" />
              {totalAvailable} open in next 7 days
            </p>
          </div>

          <div className="space-y-3">
            {dates.map((date) => (
              <SlotDayCard
                key={date}
                date={date}
                slots={byDate[date] ?? []}
                renderSlot={(s) => (
                  <Link
                    key={s.id}
                    href={
                      s.available ? `/book/${serviceId}/slot/${s.id}` : "#"
                    }
                    aria-disabled={!s.available}
                    className={`rounded-[8px] border px-3 py-2.5 text-center font-mono text-sm font-medium transition-colors ${
                      s.available
                        ? "border-border bg-background text-foreground hover:border-foreground hover:bg-primary hover:text-primary-foreground"
                        : "pointer-events-none cursor-not-allowed border-border bg-surface text-muted-foreground opacity-45 line-through"
                    }`}
                  >
                    {s.time}
                  </Link>
                )}
              />
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-border py-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span className="inline-flex items-center gap-2">
            <BrandMark size={14} className="text-foreground" />
            Universal Service Template
          </span>
          <Link href="/admin/bookings" className="hover:text-foreground">
            Manage bookings
          </Link>
        </div>
      </footer>
    </main>
  );
}
