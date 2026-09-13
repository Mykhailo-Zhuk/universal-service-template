"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, AlertCircle, ChevronRight } from "lucide-react";
import type { Restaurant } from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { formatPrice } from "@/lib/utils";

type Props = {
  params: { restaurantId: string };
};

export default function MenuPage({ params }: Props) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/menu/${params.restaurantId}`);
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
  }, [params.restaurantId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-xl font-semibold">Menu not found</h2>
          <p className="mt-2 text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const filteredItems = restaurant.items.filter(
    (item) => item.category === activeCategory
  );

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-20 glass border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold">{restaurant.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {restaurant.address}
              </span>
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {restaurant.phone}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          {restaurant.description}
        </motion.p>
      </section>

      <nav className="sticky top-[68px] z-10 border-y border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-3xl overflow-x-auto px-4">
          <div className="flex gap-1 py-2">
            {restaurant.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {activeCategory === cat.id && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute inset-0 rounded-full bg-indigo-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{cat.icon}</span>
                <span className="relative z-10">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
              >
                <Link
                  href={`/menu/${params.restaurantId}/item/${item.id}`}
                  className={`group flex items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700 ${
                    !item.available ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        {item.name}
                      </h3>
                      {!item.available && (
                        <Badge variant="warning">Unavailable</Badge>
                      )}
                      {item.weight && (
                        <Badge variant="secondary">{item.weight}</Badge>
                      )}
                      {item.calories !== undefined && (
                        <Badge variant="outline">
                          🔥 {item.calories} kcal
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.description}
                    </p>
                    {item.allergens && item.allergens.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Allergens: {item.allergens.join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
                      {formatPrice(item.price, restaurant.currency)}
                    </p>
                    <ChevronRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-zinc-700" />
                  </div>
                </Link>
              </motion.div>
            ))}
            {filteredItems.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                No items in this category.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-xs text-muted-foreground dark:border-zinc-800">
        <p>Powered by Universal Service Template</p>
      </footer>
    </main>
  );
}
