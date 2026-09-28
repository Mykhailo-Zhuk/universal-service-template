"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  MobileNavDrawer,
  MobileNavToggle,
} from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Don't show sidebar/header on the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      window.location.href = "/admin/login";
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <MobileNavToggle
        open={mobileNavOpen}
        onToggle={() => setMobileNavOpen((v) => !v)}
      />
      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 lg:px-6">
          <div className="hidden sm:block pl-14 lg:pl-0">
            <div className="text-sm font-medium text-muted-foreground">
              Universal Service
            </div>
            <div className="text-base font-semibold">Admin</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/">
                <ExternalLink className="h-3.5 w-3.5" />
                Public site
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              title="Sign out of admin"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}