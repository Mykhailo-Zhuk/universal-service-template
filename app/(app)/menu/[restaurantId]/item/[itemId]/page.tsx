"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  Flame,
  Scale,
  ChefHat,
  ShoppingBag,
  AlertCircle,
  Check,
  ChevronRight,
} from "lucide-react";
import type { MenuItem } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import {
  formatAllergen,
  formatCalories,
  formatPrice,
} from "@/lib/utils";
import { getRelatedItems } from "@/lib/data-helpers";

type ApiResponse = {
  item: MenuItem;
  currency: string;
};

export default function ItemDetailPage() {
  const { restaurantId, itemId } = useParams<{
    restaurantId: string;
    itemId: string;
  }>();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    if (!restaurantId || !itemId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(
          `/api/menu/${restaurantId}/item/${itemId}`
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
  }, [restaurantId, itemId]);

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
            Item not found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error || "The dish you are looking for is no longer available."}
          </p>
          <Button asChild className="mt-6">
            <Link href={`/menu/${restaurantId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to menu
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { item, currency } = data;
  const categoryLabel = CATEGORY_LABELS[item.category] ?? item.category;

  if (orderPlaced) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md rounded-[20px] border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#a1ffcb] text-[#232323]">
            <Check className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-normal tracking-[-0.025em]">
            Added to your order
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{item.name}</span> ·{" "}
            <span className="font-mono tabular-nums text-foreground">
              {formatPrice(finalPrice, currency)}
            </span>
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href={`/menu/${restaurantId}`}>Back to menu</Link>
            </Button>
            <Button variant="outline" onClick={() => setOrderPlaced(false)}>
              Order another
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-2 px-4 sm:px-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2 px-2.5">
            <Link href={`/menu/${restaurantId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to menu
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="rounded-[20px] border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="mint">{categoryLabel}</Badge>
              {!item.available && (
                <Badge variant="warning">Currently unavailable</Badge>
              )}
            </div>
            <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
              {formatPrice(finalPrice, currency)}
            </p>
          </div>

          <h1 className="mt-5 text-balance text-3xl font-normal tracking-[-0.03em] leading-[1.1] sm:text-[42px]">
            {item.name}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-2.5 border-t border-border pt-5">
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
            <FactCell icon={ChefHat} label="Category" value={categoryLabel} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        {item.ingredients && item.ingredients.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Ingredients
            </h2>
            <div className="flex flex-wrap gap-2">
              {item.ingredients.map((ing) => (
                <Badge
                  key={ing}
                  variant="secondary"
                  className="px-3 py-1 text-sm font-normal"
                >
                  {ing}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.allergens && item.allergens.length > 0 && (
          <div className="rounded-[16px] border border-amber-300/80 bg-amber-50/70 p-5 dark:border-amber-800/60 dark:bg-amber-950/25">
            <div className="mb-2 flex items-center gap-2 text-amber-950 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <h2 className="text-sm font-medium">Contains allergens</h2>
            </div>
            <p className="mb-3 text-xs leading-relaxed text-amber-950/80 dark:text-amber-200/80">
              Inform staff before ordering if you have allergies or dietary
              restrictions.
            </p>
            <div className="flex flex-wrap gap-2">
              {item.allergens.map((a) => (
                <Badge
                  key={a}
                  variant="warning"
                  className="px-3 py-1 text-xs"
                >
                  {formatAllergen(a)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.variations && item.variations.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              Choose variation
            </h2>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {item.variations.map((v) => {
                const active =
                  (selectedVariation ?? item.variations![0].id) === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariation(v.id)}
                    className={`flex items-center justify-between gap-2 rounded-[12px] border px-4 py-3.5 text-left text-sm transition-colors ${
                      active
                        ? "border-foreground bg-surface text-foreground"
                        : "border-border bg-card text-foreground hover:border-border-strong"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 font-medium">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          active
                            ? "bg-[#a1ffcb] ring-1 ring-[#232323]/30"
                            : "bg-border-strong"
                        }`}
                      />
                      {v.name}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
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
          </div>
        )}

        <div className="sticky bottom-4 z-10 flex items-center justify-between gap-4 rounded-[16px] border border-border-strong bg-background p-4 sm:bottom-6">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-mono text-2xl font-medium tabular-nums text-foreground">
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
        </div>

        {related.length > 0 && (
          <div className="pt-2">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              You may also like
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/menu/${restaurantId}/item/${r.id}`}
                  className="group block rounded-[16px] border border-border bg-card p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-medium text-foreground">
                        {r.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {r.description}
                      </p>
                      {!r.available && (
                        <Badge variant="warning" className="mt-2">
                          Unavailable
                        </Badge>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <p className="font-mono text-sm font-medium tabular-nums text-foreground">
                        {formatPrice(r.price, currency)}
                      </p>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
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
          <Link href={`/menu/${restaurantId}`} className="hover:text-foreground">
            Full menu
          </Link>
        </div>
      </footer>
    </main>
  );
}

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
    <div className="rounded-[12px] border border-border bg-background px-3 py-3 text-left">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-foreground" />
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-1.5 font-mono text-sm font-medium text-foreground">
        {value}
      </p>
    </div>
  );
}
