"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertTriangle,
  Flame,
  Scale,
  ChefHat,
  ShoppingBag,
  AlertCircle,
  Check,
} from "lucide-react";
import type { MenuItem } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  formatAllergen,
  formatCalories,
  formatPrice,
} from "@/lib/utils";
import { getRelatedItems } from "@/lib/data-helpers";

type Props = {
  params: { restaurantId: string; itemId: string };
};

type ApiResponse = {
  item: MenuItem;
  currency: string;
};

export default function ItemDetailPage({ params }: Props) {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/menu/${params.restaurantId}/item/${params.itemId}`
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
  }, [params.restaurantId, params.itemId]);

  const finalPrice = useMemo(() => {
    if (!data) return 0;
    const { item } = data;
    if (!item.variations || item.variations.length === 0) return item.price;
    const v = item.variations.find((vv) => vv.id === selectedVariation);
    return item.price + (v?.priceDelta ?? 0);
  }, [data, selectedVariation]);

  const related = useMemo(() => {
    if (!data) return [];
    return getRelatedItems(data.item, 4);
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
          <h2 className="mt-4 text-xl font-semibold">Item not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "The dish you are looking for is no longer available."}
          </p>
          <Button asChild className="mt-6">
            <Link href={`/menu/${params.restaurantId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to menu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { item, currency } = data;
  const categoryEmoji = CATEGORY_ICONS[item.category] ?? "🍽️";

  if (orderPlaced) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-6 dark:from-emerald-950/30 dark:to-teal-950/30">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="max-w-md rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-xl dark:border-emerald-800 dark:bg-zinc-950"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold">Added to your order!</h2>
          <p className="mt-2 text-muted-foreground">
            <span className="font-semibold">{item.name}</span> ·{" "}
            {formatPrice(finalPrice, currency)}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={`/menu/${params.restaurantId}`}>
                Back to menu
              </Link>
            </Button>
            <Button variant="outline" onClick={() => setOrderPlaced(false)}>
              Order another
            </Button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Hero / cover */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.25),_transparent_60%)]" />
        <div className="relative mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
          <Button asChild variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Link href={`/menu/${params.restaurantId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to menu
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center justify-center px-4 pb-20 pt-6 text-center sm:pb-28 sm:pt-10">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", bounce: 0.4, delay: 0.1 }}
            className="mb-4 text-7xl drop-shadow-lg sm:text-8xl"
            aria-hidden
          >
            {categoryEmoji}
          </motion.div>
          <motion.h1
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-balance text-3xl font-bold sm:text-4xl"
          >
            {item.name}
          </motion.h1>
          <motion.p
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 max-w-xl text-balance text-white/85"
          >
            {item.description}
          </motion.p>
          {!item.available && (
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4"
            >
              <Badge variant="warning">Currently unavailable</Badge>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Quick facts */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pt-8 sm:pt-12">
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="grid grid-cols-3 gap-2 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          {item.weight && (
            <FactCell icon={Scale} label="Weight" value={item.weight} />
          )}
          {typeof item.calories === "number" && (
            <FactCell
              icon={Flame}
              label="Calories"
              value={formatCalories(item.calories)}
            />
          )}
          <FactCell
            icon={ChefHat}
            label="Category"
            value={CATEGORY_LABELS[item.category] ?? item.category}
          />
        </motion.div>
      </section>

      {/* Ingredients & Allergens */}
      <section className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        {item.ingredients && item.ingredients.length > 0 && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Ingredients
            </h2>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map((ing) => (
                <Badge key={ing} variant="secondary" className="px-3 py-1 text-sm">
                  {ing}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {item.allergens && item.allergens.length > 0 && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/20"
          >
            <div className="mb-3 flex items-center gap-2 text-amber-900 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              <h2 className="text-sm font-semibold uppercase tracking-wider">
                Contains allergens
              </h2>
            </div>
            <p className="mb-3 text-xs text-amber-900/80 dark:text-amber-300/80">
              ⚠️ Please inform staff if you have any allergies or dietary
              restrictions before ordering.
            </p>
            <div className="flex flex-wrap gap-2">
              {item.allergens.map((a) => (
                <Badge
                  key={a}
                  variant="warning"
                  className="px-3 py-1 text-sm"
                >
                  {formatAllergen(a)}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {item.variations && item.variations.length > 0 && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Choose variation
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {item.variations.map((v) => {
                const active =
                  (selectedVariation ?? item.variations![0].id) === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v.id)}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-all ${
                      active
                        ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/30"
                        : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700"
                    }`}
                  >
                    <span className="font-medium">{v.name}</span>
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {v.priceDelta === 0
                        ? "base price"
                        : v.priceDelta > 0
                        ? `+${formatPrice(v.priceDelta, currency)}`
                        : formatPrice(v.priceDelta, currency)}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Order panel */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="sticky bottom-4 z-10 mt-2 flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/90 p-3 shadow-lg backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/90 sm:bottom-6"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Total
            </p>
            <p className="text-2xl font-bold tabular-nums text-indigo-600 dark:text-indigo-400">
              {formatPrice(finalPrice, currency)}
            </p>
          </div>
          <Button
            size="lg"
            disabled={!item.available}
            onClick={() => setOrderPlaced(true)}
          >
            <ShoppingBag className="h-4 w-4" />
            {item.available ? "Order now" : "Unavailable"}
          </Button>
        </motion.div>

        {/* Related */}
        {related.length > 0 && (
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              You may also like
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={`/menu/${params.restaurantId}/item/${r.id}`}
                    className="group block rounded-xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xl" aria-hidden>
                            {CATEGORY_ICONS[r.category] ?? "🍽️"}
                          </span>
                          <h3 className="truncate font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                            {r.name}
                          </h3>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {r.description}
                        </p>
                        {!r.available && (
                          <Badge variant="warning" className="mt-2">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      <p className="shrink-0 text-sm font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                        {formatPrice(r.price, currency)}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
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

const CATEGORY_ICONS: Record<string, string> = {
  starters: "🥗",
  mains: "🍝",
  grill: "🥩",
  pizza: "🍕",
  desserts: "🍰",
  drinks: "🍷",
  cocktails: "🍸",
};

const CATEGORY_LABELS: Record<string, string> = {
  starters: "Starters",
  mains: "Main Course",
  grill: "Grill & BBQ",
  pizza: "Pizza",
  desserts: "Dessert",
  drinks: "Drink",
  cocktails: "Cocktail",
};

function FactCell({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-lg bg-zinc-50 px-2 py-2 text-center dark:bg-zinc-950/40">
      <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-xs font-semibold sm:text-sm">{value}</p>
    </div>
  );
}
