"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, User, AlertCircle, ArrowLeft, Sparkles } from "lucide-react";
import type { Service } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatPrice, formatSlotDate } from "@/lib/utils";
import { generateSlotsForService, getSlotsByDate } from "@/lib/data-helpers";

export default function BookPage() {
  const params = useParams<{ serviceId: string }>();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/book?serviceId=${params.serviceId}`);
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
  }, [params.serviceId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Service not found</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <Button asChild className="mt-6">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const slots = generateSlotsForService(params.serviceId, 7);
  const byDate = getSlotsByDate(slots);
  const dates = Object.keys(byDate).sort();
  const totalAvailable = slots.filter((s) => s.available).length;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="text-2xl">{service.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {service.description}
                  </CardDescription>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration} min
                    </span>
                    {service.masterName && (
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {service.masterName}
                      </span>
                    )}
                    <span>{service.provider}</span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {service.price > 0 ? formatPrice(service.price) : "Free"}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>
                  Pick a slot · {totalAvailable} available in next 7 days
                </span>
              </div>
              <div className="space-y-3">
                {dates.map((date) => {
                  const daySlots = byDate[date] ?? [];
                  const availableCount = daySlots.filter((s) => s.available).length;
                  return (
                    <div
                      key={date}
                      className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {formatSlotDate(date)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {availableCount > 0
                            ? `${availableCount} free`
                            : "fully booked"}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {daySlots.map((s) => (
                          <Link
                            key={s.id}
                            href={
                              s.available
                                ? `/book/${params.serviceId}/slot/${s.id}`
                                : "#"
                            }
                            aria-disabled={!s.available}
                            className={`rounded-md border px-2 py-2 text-center text-sm font-medium transition-all ${
                              s.available
                                ? "border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
                                : "pointer-events-none cursor-not-allowed border-zinc-100 bg-zinc-50 text-zinc-300 line-through dark:border-zinc-900 dark:bg-zinc-950/40 dark:text-zinc-700"
                            }`}
                          >
                            {s.time}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}
