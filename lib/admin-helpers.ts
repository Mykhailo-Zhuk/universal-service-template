/**
 * Centralised presentation helpers for the admin panel — status labels,
 * colours, and any formatting that more than one admin page needs.
 */

import type {
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
} from "@/lib/schemas";

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; tone: string; description: string }
> = {
  new: {
    label: "New",
    tone: "bg-[#232323] text-white dark:bg-white dark:text-[#232323]",
    description: "Just received, needs acceptance",
  },
  preparing: {
    label: "Preparing",
    tone:
      "bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-300",
    description: "Kitchen is working on it",
  },
  ready: {
    label: "Ready",
    tone:
      "bg-[#a1ffcb] text-[#173324] dark:bg-[#a1ffcb]/20 dark:text-[#a1ffcb]",
    description: "Ready to serve",
  },
  served: {
    label: "Served",
    tone:
      "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-300",
    description: "Delivered to table",
  },
  paid: {
    label: "Paid",
    tone:
      "bg-surface text-foreground border border-border",
    description: "Payment received",
  },
  cancelled: {
    label: "Cancelled",
    tone: "bg-red-100 text-red-950 dark:bg-red-950/60 dark:text-red-300",
    description: "Order was cancelled",
  },
};

export const ORDER_NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: "preparing",
  preparing: "ready",
  ready: "served",
  served: "paid",
  paid: null,
  cancelled: null,
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; tone: string }
> = {
  pending: {
    label: "Awaiting payment",
    tone: "bg-amber-100 text-amber-950 dark:bg-amber-950/60 dark:text-amber-300",
  },
  paid: {
    label: "Paid",
    tone: "bg-emerald-100 text-emerald-950 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  refunded: {
    label: "Refunded",
    tone: "bg-surface text-foreground border border-border",
  },
  failed: {
    label: "Payment failed",
    tone: "bg-red-100 text-red-950 dark:bg-red-950/60 dark:text-red-300",
  },
};

export const PAYMENT_METHOD_META: Record<
  PaymentMethod,
  { label: string; icon: string }
> = {
  cash: { label: "Cash", icon: "Cash" },
  card: { label: "Card on delivery", icon: "Card" },
  online: { label: "Online", icon: "Online" },
  liqpay: { label: "LiqPay", icon: "LiqPay" },
  monopay: { label: "MonoPay", icon: "MonoPay" },
};

/** Helper: short human format for "5 min ago" / "2 h ago" / "Yesterday". */
export function relativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86_400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 172_800) return "Yesterday";
  return date.toLocaleDateString("uk-UA", {
    month: "short",
    day: "numeric",
  });
}

export function timeOfDay(iso: string): string {
  return new Date(iso).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
