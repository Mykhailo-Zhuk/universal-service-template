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
import { useParams } from "next/navigation";
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
  Trash2,
  Users,
} from "lucide-react";
import type {
  MenuItem,
  Restaurant,
  ItemVariation,
  Order,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
import { MenuItemMeta } from "@/components/menu-item-meta";
import { cn, formatPrice } from "@/lib/utils";

type CartLine = {
  itemId: string;
  name: string;
  unitPrice: number;
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

export default function TableLandingPage() {
  const { restaurantId, tableId } = useParams<{
    restaurantId: string;
    tableId: string;
  }>();
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

  useEffect(() => {
    if (!restaurantId) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/menu/${restaurantId}`);
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
  }, [restaurantId]);

  const filteredItems = useMemo(() => {
    if (!restaurant || !activeCategory) return [];
    return restaurant.items.filter(
      (item) => item.category === activeCategory && item.available
    );
  }, [restaurant, activeCategory]);

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
          restaurantId,
          tableId,
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

  if (loading) {
    return (
      <CenterShell>
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-foreground" />
      </CenterShell>
    );
  }

  if (error || !restaurant) {
    return (
      <CenterShell>
        <div className="max-w-sm rounded-[20px] border border-border bg-card p-8">
          <AlertCircle className="mx-auto h-10 w-10 text-red-600 dark:text-red-400" />
          <h2 className="mt-4 text-xl font-medium tracking-[-0.02em]">
            Menu unavailable
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </CenterShell>
    );
  }

  const tableLabel = `Table #${tableId}`;

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
    <main className="min-h-screen bg-background pb-32 text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                aria-label="Back to home"
                className="inline-flex items-center gap-1.5 text-foreground hover:opacity-75"
              >
                <BrandMark size={18} />
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#a1ffcb] px-2.5 py-0.5 text-xs font-medium text-[#232323]">
                <Users className="h-3 w-3" />
                {tableLabel}
              </span>
              <h1 className="truncate text-base font-medium tracking-[-0.01em]">
                {restaurant.name}
              </h1>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {restaurant.address}
              </span>
              <span className="inline-flex items-center gap-1 font-mono">
                <Phone className="h-3 w-3" />
                {restaurant.phone}
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <nav
        aria-label="Menu categories"
        className="sticky top-[73px] z-10 border-b border-border bg-background"
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
                  className={cn(
                    "flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  )}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {filteredItems.length === 0 && (
              <div className="rounded-[20px] border border-dashed border-border-strong p-12 text-center text-sm text-muted-foreground">
                No items in this category.
              </div>
            )}
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                currency={restaurant.currency}
                onAdd={(variation, qty) => addToCart(item, variation, qty)}
                onAdded={() => {
                  setCartOpen(true);
                  setTimeout(() => setCartOpen(false), 600);
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      <AnimatePresence>
        {count > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 72, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 72, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background px-4 py-3 sm:px-6"
          >
            <div className="mx-auto flex max-w-3xl items-center">
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="flex flex-1 items-center justify-between gap-3 rounded-[12px] bg-primary px-4 py-3 text-left text-primary-foreground transition-opacity hover:opacity-92"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-[#a1ffcb] px-2 font-mono text-xs font-medium text-[#232323]">
                    {count}
                  </span>
                  <div>
                    <div className="text-sm font-medium">View cart</div>
                    <div className="text-xs opacity-75">{tableLabel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-mono text-sm font-medium tabular-nums">
                  <span>{formatPrice(total, restaurant.currency)}</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

function CenterShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>{children}</div>
    </main>
  );
}

function ItemCard({
  item,
  currency,
  onAdd,
  onAdded,
}: {
  item: MenuItem;
  currency: string;
  onAdd: (variation?: ItemVariation, qty?: number) => void;
  onAdded: () => void;
}) {
  const hasVariations = !!item.variations && item.variations.length > 0;
  const [selectedVariation, setSelectedVariation] = useState<
    ItemVariation | undefined
  >(hasVariations ? item.variations![0] : undefined);
  const displayPrice = item.price + (selectedVariation?.priceDelta ?? 0);

  return (
    <div className="rounded-[20px] border border-border bg-card p-5 transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-medium tracking-[-0.01em] text-foreground">
            {item.name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
          <MenuItemMeta item={item} className="mt-2.5" />
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-[16px] font-medium tabular-nums text-foreground">
            {formatPrice(displayPrice, currency)}
          </p>
        </div>
      </div>

      {hasVariations && (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.variations!.map((v) => {
            const active = selectedVariation?.id === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelectedVariation(v)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-foreground bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-border-strong hover:bg-surface"
                )}
              >
                {v.name}
                {v.priceDelta !== 0 && (
                  <span className="ml-1 font-mono opacity-75">
                    {v.priceDelta > 0 ? "+" : ""}
                    {formatPrice(v.priceDelta, currency)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex justify-end border-t border-border pt-3.5">
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
    </div>
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
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-40 bg-black/45"
            onClick={onClose}
          />
          <motion.aside
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-[24px] border-t border-border bg-background"
          >
            <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border-strong" />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-medium tracking-[-0.02em]">
                    Your order
                  </h2>
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
                  <ul className="mt-4 divide-y divide-border">
                    {lines.map(([key, line]) => (
                      <li
                        key={key}
                        className="flex items-center gap-3 py-3.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">
                            {line.name}
                          </div>
                          {line.variationName && (
                            <div className="text-xs text-muted-foreground">
                              {line.variationName}
                            </div>
                          )}
                          <div className="font-mono text-xs text-muted-foreground">
                            {formatPrice(line.unitPrice, currency)} ×{" "}
                            {line.quantity}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onDec(key)}
                            aria-label="Decrease quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-background text-foreground hover:bg-surface"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono text-sm font-medium tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onInc(key)}
                            aria-label="Increase quantity"
                            className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-border bg-background text-foreground hover:bg-surface"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemove(key)}
                            aria-label="Remove item"
                            className="ml-1 flex h-8 w-8 items-center justify-center rounded-[8px] text-muted-foreground hover:bg-surface hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="w-20 text-right font-mono text-sm font-medium tabular-nums">
                          {formatPrice(
                            line.unitPrice * line.quantity,
                            currency
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="text-sm text-muted-foreground">
                      Subtotal
                    </span>
                    <span className="font-mono text-xl font-medium tabular-nums">
                      {formatPrice(total, currency)}
                    </span>
                  </div>

                  <div className="mt-6 space-y-3.5">
                    <div>
                      <label
                        htmlFor="cart-customer-name"
                        className="mb-1.5 block text-xs font-medium text-foreground"
                      >
                        Your name
                      </label>
                      <Input
                        id="cart-customer-name"
                        placeholder="e.g. John Doe"
                        value={customerName}
                        onChange={(e) => onNameChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cart-customer-phone"
                        className="mb-1.5 block text-xs font-medium text-foreground"
                      >
                        Phone
                      </label>
                      <Input
                        id="cart-customer-phone"
                        type="tel"
                        placeholder="+380…"
                        value={customerPhone}
                        onChange={(e) => onPhoneChange(e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cart-order-notes"
                        className="mb-1.5 block text-xs font-medium text-foreground"
                      >
                        Notes for the kitchen (optional)
                      </label>
                      <Input
                        id="cart-order-notes"
                        placeholder="e.g. No onions, sauce on the side"
                        value={orderNotes}
                        onChange={(e) => onNotesChange(e.target.value)}
                      />
                    </div>
                  </div>

                  {submitError && (
                    <p className="mt-3 rounded-[10px] border border-red-300 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
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
                          Place order · {formatPrice(total, currency)}
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
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md rounded-[20px] border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#a1ffcb] text-[#232323]">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-normal tracking-[-0.025em]">
          Order placed
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The kitchen has received your order. It will be served to{" "}
          <span className="font-medium text-foreground">{tableLabel}</span>{" "}
          shortly.
        </p>

        <div className="mt-6 rounded-[14px] border border-border bg-surface p-4 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Order ID</span>
            <code className="font-mono text-foreground">
              {order.id.slice(0, 16)}
            </code>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Items</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {order.items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="font-mono text-lg font-medium tabular-nums text-foreground">
              {formatPrice(order.total, restaurantCurrency)}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onAgain} className="w-full">
            <Plus className="h-4 w-4" />
            Order again
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
