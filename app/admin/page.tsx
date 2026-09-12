"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Bot,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type LogEntry = {
  id: string;
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
};

const LOG_ICON = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertTriangle,
};

const LOG_COLOR = {
  info: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40",
  success:
    "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40",
  warning:
    "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40",
  error: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40",
};

const STATS = [
  {
    label: "Total Bookings",
    value: "127",
    change: "+12%",
    icon: CalendarDays,
    href: "/admin",
  },
  {
    label: "Revenue (month)",
    value: "₴48,200",
    change: "+8%",
    icon: CreditCard,
    href: "/admin",
  },
  {
    label: "Bot Messages",
    value: "342",
    change: "+24%",
    icon: Bot,
    href: "/admin",
  },
  {
    label: "Active Items",
    value: "23 / 24",
    change: "96%",
    icon: QrCode,
    href: "/menu/demo-restaurant",
  },
];

export default function AdminPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/bot/log");
        if (!res.ok) throw new Error("Failed to load logs");
        const data = await res.json();
        setLogs(data.logs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <Activity className="h-4 w-4" />
            </div>
            Admin Panel
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/">Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Real-time overview of your service business.
            </p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="mt-2 text-2xl font-bold tabular-nums">
                            {stat.value}
                          </p>
                          <Badge variant="success" className="mt-2">
                            {stat.change}
                          </Badge>
                        </div>
                        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest events from bookings, payments and the bot. Auto-refreshes every 10s.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logs.map((log) => {
                      const Icon = LOG_ICON[log.level];
                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 rounded-md border border-zinc-100 p-3 dark:border-zinc-800"
                        >
                          <div
                            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${LOG_COLOR[log.level]}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{log.message}</p>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0 text-xs">
                            {log.level}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Jump to any section.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/menu/demo-restaurant">
                    Demo QR Menu
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/book/haircut-classic">
                    Demo Booking Flow
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/api/menu/demo-restaurant">
                    Menu API JSON
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/api/bot/log">
                    Bot Log API
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
