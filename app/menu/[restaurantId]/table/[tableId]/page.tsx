"use client";

/**
 * QR-landing page for the table ordering flow (G-262).
 *
 * The URL `/menu/<restaurantId>/table/<tableId>` is what gets encoded into
 * the QR sticker printed for each physical table. Customers scan it, browse
 * the menu, build a cart, and submit — the page POSTs to /api/orders with
 * the tableId baked in, so the kitchen knows which table the food belongs to.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";
import type {
  MenuItem,
  Restaurant,
  ItemVariation,
  Order,
} from "@/lib/schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn, formatPrice } from "@/lib/utils";

type Props = {
  params: { restaurantId: string; tableId: string };
};

// ── Cart shape ──────────────────────────────────────────────────────────
type CartLine = {
  itemId: string;
  name: string;
  unitPrice: number; // base + variation delta
  quantity: number;
  variationId?: string;
  variationName?: string;
  notes?: string;
};

type CartState = Record<string, CartLine>;

function cartKey(itemId: string, variationId?: string): string {
  return variationId ? `${itemId}__${variationId}` : itemId;
}

function cartTotal(cart: CartState): number {
  return Object.values(cart).reduce(
    (sum, line) => sum + line.unitPrice * line.quantity,
    0
  );
}

function cartCount(cart: CartState): number {
  return Object.values(cart).reduce((sum, line) => sum + line.quantity, 0);
}

export default function TableLandingPage({ params }: Props) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartState>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Load restaurant + menu.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/menu/${params.restaurantId}`);
        if (!res.ok) throw new Error("Failed to load menu");
        const data: Restaurant = await res.json();
        if (cancelled) return;
        setRestaurant(data);
        if (data.categories?.length) setActiveCategory(data.categories[0].id);
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
  }, [params.restaurantId]);

  const filteredItems = useMemo(() => {
    if (!restaurant || !activeCategory) return [];
    return restaurant.items.filter(
      (item) => item.category === activeCategory && item.available
    );
  }, [restaurant, activeCategory]);

  // ── Cart mutations ────────────────────────────────────────────────────
  const addToCart = (
    item: MenuItem,
    variation?: ItemVariation,
    quantity = 1
  ) => {
    const unitPrice = item.price + (variation?.priceDelta ?? 0);
    const key = cartKey(item.id, variation?.id);
    setCart((prev) => {
      const existing = prev[key];
      if (existing) {
        return {
          ...prev,
          [key]: { ...existing, quantity: existing.quantity + quantity },
        };
      }
      return {
        ...prev,
        [key]: {
          itemId: item.id,
          name: item.name,
          unitPrice,
          quantity,
          variationId: variation?.id,
          variationName: variation?.name,
        },
      };
    });
  };

  const setLineQty = (key: string, qty: number) => {
    setCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { ...line, quantity: qty } };
    });
  };

  const removeLine = (key: string) => setLineQty(key, 0);

  const clearCart = () => setCart({});

  // ── Submit ────────────────────────────────────────────────────────────
  async function submitOrder() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const items = Object.values(cart).map((line) => ({
        itemId: line.itemId,
        quantity: line.quantity,
        variationId: line.variationId,
        notes: line.notes,
      }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: params.restaurantId,
          tableId: params.tableId,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: orderNotes.trim() || undefined,
          items,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Order failed");
      }
      setConfirmedOrder(json.order as Order);
      setCart({});
      setCartOpen(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  }

  function startNewOrder() {
    setConfirmedOrder(null);
    setCustomerName("");
    setCustomerPhone("");
    setOrderNotes("");
    setSubmitError(null);
  }

  // ── Render states ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <CenterShell>
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </CenterShell>
    );
  }

  if (error || !restaurant) {
    return (
      <CenterShell>
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold">Menu unavailable</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/">Back home</Link>
        </Button>
      </CenterShell>
    );
  }

  const tableLabel =
    // The label is purely cosmetic — we never trust the URL to match a real
    // tableId, the API is the source of truth.
    `Table #${params.tableId}`;

  // ── Success screen ────────────────────────────────────────────────────
  if (confirmedOrder) {
    return (
      <SuccessScreen
        order={confirmedOrder}
        tableLabel={tableLabel}
        onAgain={startNewOrder}
        restaurantCurrency={restaurant.currency}
      />
    );
  }

  const total = cartTotal(cart);
  const count = cartCount(cart);

  return (
    <main className="min-h-screen bg-zinc-50 pb-32 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Users className="h-3 w-3" />
                {tableLabel}
              </span>
            </div>
            <h1 className="mt-1 truncate text-lg font-semibold">
              {restaurant.name}
            </h1>
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

      {/* Category tabs */}
      <nav className="sticky top-[88px] z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-3xl overflow-x-auto px-4">
          <div className="flex gap-1 py-2">
            {restaurant.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  activeCategory === cat.id
                    ? "text-white"
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                )}
              >
                {activeCategory === cat.id && (
                  <motion.span
                    layoutId="qr-active-cat"
                    className="absolute inset-0 rounded-full bg-indigo-600"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10">{cat.icon}</span>
                <span className="relative z-10">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Menu list */}
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
            {filteredItems.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                No items in this category.
              </p>
            )}
            {filteredItems.map((item, idx) => (
              <ItemCard
                key={item.id}
                item={item}
                index={idx}
                currency={restaurant.currency}
                onAdd={(variation, qty) => addToCart(item, variation, qty)}
                onAdded={() => {
                  // Tiny "ping" — flash the cart button when an item is added.
                  setCartOpen(true);
                  setTimeout(() => setCartOpen(false), 600);
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Sticky cart bar */}
      <AnimatePresence>
        {count > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/95"
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="flex flex-1 items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <div className="relative">
                  <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                    {count}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">View cart</div>
                  <div className="text-xs text-muted-foreground">
                    {count} item{count === 1 ? "" : "s"} •{" "}
                    {formatPrice(total, restaurant.currency)}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart sheet */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        total={total}
        currency={restaurant.currency}
        onInc={(k) => setLineQty(k, (cart[k]?.quantity ?? 0) + 1)}
        onDec={(k) => setLineQty(k, (cart[k]?.quantity ?? 0) - 1)}
        onRemove={removeLine}
        onClear={clearCart}
        customerName={customerName}
        customerPhone={customerPhone}
        orderNotes={orderNotes}
        onNameChange={setCustomerName}
        onPhoneChange={setCustomerPhone}
        onNotesChange={setOrderNotes}
        onSubmit={submitOrder}
        submitting={submitting}
        submitError={submitError}
        tableLabel={tableLabel}
      />
    </main>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

function CenterShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 text-center dark:bg-zinc-950">
      <div>{children}</div>
    </main>
  );
}

function ItemCard({
  item,
  index,
  currency,
  onAdd,
  onAdded,
}: {
  item: MenuItem;
  index: number;
  currency: string;
  onAdd: (variation?: ItemVariation, qty?: number) => void;
  onAdded: () => void;
}) {
  const hasVariations = !!item.variations && item.variations.length > 0;
  const [selectedVariation, setSelectedVariation] = useState<
    ItemVariation | undefined
  >(hasVariations ? item.variations![0] : undefined);
  const displayPrice =
    item.price + (selectedVariation?.priceDelta ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{item.name}</h3>
            {item.weight && (
              <Badge variant="secondary">{item.weight}</Badge>
            )}
            {item.calories !== undefined && (
              <Badge variant="outline">🔥 {item.calories} kcal</Badge>
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
        <div className="shrink-0 text-right">
          <p className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
            {formatPrice(displayPrice, currency)}
          </p>
        </div>
      </div>

      {hasVariations && (
        <div className="mt-3 flex flex-wrap gap-2">
          {item.variations!.map((v) => {
            const active = selectedVariation?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariation(v)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300"
                    : "border-zinc-200 text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600"
                )}
              >
                {v.name}
                {v.priceDelta !== 0 && (
                  <span className="ml-1 opacity-70">
                    {v.priceDelta > 0 ? "+" : ""}
                    {formatPrice(v.priceDelta, currency)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            onAdd(selectedVariation, 1);
            onAdded();
          }}
        >
          <Plus className="h-4 w-4" />
          Add to order
        </Button>
      </div>
    </motion.div>
  );
}

function CartSheet({
  open,
  onClose,
  cart,
  total,
  currency,
  onInc,
  onDec,
  onRemove,
  onClear,
  customerName,
  customerPhone,
  orderNotes,
  onNameChange,
  onPhoneChange,
  onNotesChange,
  onSubmit,
  submitting,
  submitError,
  tableLabel,
}: {
  open: boolean;
  onClose: () => void;
  cart: CartState;
  total: number;
  currency: string;
  onInc: (key: string) => void;
  onDec: (key: string) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
  customerName: string;
  customerPhone: string;
  orderNotes: string;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
  tableLabel: string;
}) {
  const lines = Object.entries(cart);
  const canSubmit =
    lines.length > 0 &&
    customerName.trim().length >= 2 &&
    customerPhone.trim().length >= 8 &&
    !submitting;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", bounce: 0.05, duration: 0.35 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="mx-auto max-w-3xl px-4 py-5">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Your order</h2>
                  <p className="text-sm text-muted-foreground">
                    For {tableLabel}
                  </p>
                </div>
                {lines.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={onClear}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                  </Button>
                )}
              </div>

              {lines.length === 0 ? (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  Your cart is empty. Add items from the menu above.
                </p>
              ) : (
                <>
                  <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {lines.map(([key, line]) => (
                      <li
                        key={key}
                        className="flex items-center gap-3 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {line.name}
                          </div>
                          {line.variationName && (
                            <div className="text-xs text-muted-foreground">
                              {line.variationName}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {formatPrice(line.unitPrice, currency)} ×{" "}
                            {line.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onDec(key)}
                            aria-label="Decrease quantity"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onInc(key)}
                            aria-label="Increase quantity"
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(key)}
                            aria-label="Remove"
                            className="ml-1 text-zinc-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="w-20 text-right text-sm font-semibold tabular-nums">
                          {formatPrice(
                            line.unitPrice * line.quantity,
                            currency
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                    <span className="text-sm text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="text-xl font-bold tabular-nums">
                      {formatPrice(total, currency)}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Your name
                      </label>
                      <Input
                        placeholder="e.g. John Doe"
                        value={customerName}
                        onChange={(e) => onNameChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        placeholder="+380…"
                        value={customerPhone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Notes for the kitchen (optional)
                      </label>
                      <Input
                        placeholder="e.g. No onions, sauce on the side"
                        value={orderNotes}
                        onChange={(e) => onNotesChange(e.target.value)}
                      />
                    </div>
                  </div>

                  {submitError && (
                    <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300">
                      {submitError}
                    </p>
                  )}

                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={onClose}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Keep browsing
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={onSubmit}
                      disabled={!canSubmit}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-4 w-4" />
                          Place order • {formatPrice(total, currency)}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SuccessScreen({
  order,
  tableLabel,
  onAgain,
  restaurantCurrency,
}: {
  order: Order;
  tableLabel: string;
  onAgain: () => void;
  restaurantCurrency: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-zinc-950">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">Order placed!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The kitchen has received your order. It will be served to{" "}
          <span className="font-semibold">{tableLabel}</span> shortly.
        </p>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-left dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Order ID</span>
            <code className="text-xs">{order.id.slice(0, 16)}</code>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Items</span>
            <span className="text-sm font-medium">
              {order.items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-lg font-bold tabular-nums">
              {formatPrice(order.total, restaurantCurrency)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onAgain} className="w-full">
            <Sparkles className="h-4 w-4" />
            Order again
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </motion.div>
    </main>
  );
}