"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ShoppingBag,
  UtensilsCrossed,
  FolderTree,
  CalendarCheck2,
  QrCode,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Activity;
  // Exact-prefix matcher — used so /admin and /admin/orders both match.
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: Activity,
    match: (p) => p === "/admin" || p === "/admin/",
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: ShoppingBag,
    match: (p) => p.startsWith("/admin/orders"),
  },
  {
    href: "/admin/menu",
    label: "Menu",
    icon: UtensilsCrossed,
    match: (p) => p.startsWith("/admin/menu"),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: FolderTree,
    match: (p) => p.startsWith("/admin/categories"),
  },
  {
    href: "/admin/bookings",
    label: "Bookings",
    icon: CalendarCheck2,
    match: (p) => p.startsWith("/admin/bookings"),
  },
  {
    href: "/admin/tables",
    label: "Tables & QR",
    icon: QrCode,
    match: (p) => p.startsWith("/admin/tables"),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    match: (p) => p.startsWith("/admin/settings"),
  },
];

type SidebarContentProps = {
  onNavigate?: () => void;
  pathname: string;
};

function SidebarContent({ onNavigate, pathname }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-2 px-6 py-5 text-lg font-semibold"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <div>Admin Panel</div>
          <div className="text-xs font-normal text-muted-foreground">
            Universal Service
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-300"
                )}
              />
              <span>{item.label}</span>
              {active && (
                <motion.span
                  layoutId="admin-active-indicator"
                  className="absolute right-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-indigo-500"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 px-6 py-4 text-xs text-muted-foreground dark:border-zinc-800">
        <div className="font-medium">Demo data</div>
        <div className="mt-1">10 mock orders • 10 tables</div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:block">
      <SidebarContent pathname={usePathnameHook()} />
    </aside>
  );
}

/**
 * Hook wrapper so SidebarContent can be reused by the mobile drawer
 * (which needs the live pathname) without re-importing usePathname.
 */
function usePathnameHook() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return usePathname();
}

export function MobileNavToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 bg-white/90 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 lg:hidden"
      aria-label={open ? "Close menu" : "Open menu"}
    >
      {open ? <X className="h-5 w-5" /> : <span className="text-lg">☰</span>}
    </button>
  );
}

export function MobileNavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0.05, duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950 lg:hidden"
          >
            <SidebarContent onNavigate={onClose} pathname={pathname} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}