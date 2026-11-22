"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Phone,
  MapPin,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import type { Restaurant } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { MenuItemMeta } from "@/components/menu-item-meta";
import { formatPrice } from "@/lib/utils";

export default function MenuPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;
    async function load() {
      try {
        const res = await fetch(`/api/menu/${restaurantId}`);
        if (!res.ok) throw new Error("Failed to load menu");
        const data = await res.json();
        setRestaurant(data);
        if (data.categories?.length) {
          setActiveCategory(data.categories[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="max-w-sm rounded-[20px] border border-border bg-card p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-600 dark:text-red-400" />
          <h2 className="mt-4 text-xl font-medium tracking-[-0.02em]">
            Menu not found
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button asChild className="mt-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to main page
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const filteredItems = restaurant.items.filter(
    (item) => item.category === activeCategory
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="-ml-2 shrink-0 px-2.5"
            >
              <Link href="/" aria-label="Go back to main page">
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            <span className="h-4 w-px bg-border" aria-hidden="true" />
            <div className="flex min-w-0 items-center gap-2">
              <BrandMark size={18} className="text-foreground" />
              <span className="truncate text-sm font-medium">
                {restaurant.name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
              <Link href={`/menu/${restaurantId}/table/1`}>Table #1 QR</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-6 pt-8 sm:px-6 sm:pt-10">
        <div className="rounded-[20px] border border-border bg-surface p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
            <span className="h-2 w-2 rounded-full bg-[#a1ffcb] ring-1 ring-[#232323]/20" />
            Digital menu
          </div>
          <h1 className="mt-4 text-3xl font-normal tracking-[-0.03em] leading-[1.1] sm:text-[40px]">
            {restaurant.name}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {restaurant.description}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-4 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-foreground" />
              {restaurant.address}
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <Phone className="h-3.5 w-3.5 text-foreground" />
              {restaurant.phone}
            </span>
          </div>
        </div>
      </section>

      <nav
        aria-label="Menu categories"
        className="sticky top-16 z-10 border-y border-border bg-background"
      >
        <div className="mx-auto max-w-3xl overflow-x-auto px-4 sm:px-6">
          <div className="flex gap-1.5 py-2.5">
            {restaurant.categories.map((cat) => {
              const active = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/menu/${restaurantId}/item/${item.id}`}
                className={`group flex items-start justify-between gap-4 rounded-[20px] border border-border bg-card p-5 transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong ${
                  !item.available ? "opacity-60" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[17px] font-medium tracking-[-0.01em] text-foreground">
                      {item.name}
                    </h3>
                    {!item.available && (
                      <Badge variant="warning">Unavailable</Badge>
                    )}
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                  <MenuItemMeta item={item} />
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 pt-0.5">
                  <p className="font-mono text-[16px] font-medium tabular-nums text-foreground">
                    {formatPrice(item.price, restaurant.currency)}
                  </p>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
              </Link>
            ))}
            {filteredItems.length === 0 && (
              <div className="rounded-[20px] border border-dashed border-border-strong p-12 text-center text-sm text-muted-foreground">
                No items in this category.
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <footer className="mt-8 border-t border-border py-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 text-xs text-muted-foreground sm:px-6">
          <span className="inline-flex items-center gap-2">
            <BrandMark size={14} className="text-foreground" />
            Universal Service Template
          </span>
          <Link href="/admin" className="hover:text-foreground">
            Admin desk
          </Link>
        </div>
      </footer>
    </main>
  );
}
