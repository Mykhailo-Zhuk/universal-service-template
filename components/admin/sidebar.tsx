"use client";

import { useEffect } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Activity;
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
    <div className="flex h-full flex-col bg-background">
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex h-16 items-center gap-3 border-b border-border px-5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#232323] text-[#a1ffcb] dark:bg-[#a1ffcb] dark:text-[#232323]">
          <BrandMark size={18} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium tracking-[-0.01em] text-foreground">
            Admin desk
          </div>
          <div className="truncate text-xs text-muted-foreground">
            Universal Service
          </div>
        </div>
      </Link>

      <nav aria-label="Admin navigation" className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-surface text-foreground"
                  : "text-muted-foreground hover:bg-surface hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span>{item.label}</span>
              {active && (
                <motion.span
                  layoutId="admin-active-indicator"
                  className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#a1ffcb] ring-1 ring-[#232323]/25"
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
        <div className="font-medium text-foreground">Demo Restaurant</div>
        <div className="mt-0.5 font-mono text-[11px]">
          10 tables · live workspace
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
      <SidebarContent pathname={pathname} />
    </aside>
  );
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
      className="fixed left-4 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-[8px] border border-border bg-background text-foreground hover:bg-surface lg:hidden"
      aria-label={open ? "Close menu" : "Open menu"}
    >
      {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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

  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="fixed inset-0 z-30 bg-black/45 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 left-0 z-40 w-72 border-r border-border bg-background lg:hidden"
          >
            <SidebarContent onNavigate={onClose} pathname={pathname} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
