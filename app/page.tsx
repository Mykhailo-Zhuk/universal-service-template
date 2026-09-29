"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  QrCode,
  CalendarDays,
  CreditCard,
  Bot,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((m) => m.ThemeToggle),
  { ssr: false }
);

const features = [
  {
    icon: CalendarDays,
    title: "Онлайн-запис 24/7",
    description: "Клієнт сам обирає послугу та зручний час — без дзвінків і черг.",
    href: "/book/haircut-classic",
    color: "from-indigo-500 to-violet-500",
  },
  {
    icon: Sparkles,
    title: "Прайс і послуги",
    description: "Актуальні ціни та перелік послуг — адміністратор редагує сам.",
    href: "/menu/demo-restaurant",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: CreditCard,
    title: "Оплата онлайн",
    description: "LiqPay та MonoPay — передоплата або повна оплата послуги.",
    href: "/admin",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Bot,
    title: "Telegram-сповіщення",
    description: "Нова заявка — миттєве повідомлення адміністратору в Telegram.",
    href: "/admin",
    color: "from-sky-500 to-blue-500",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/20" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <Sparkles className="h-4 w-4" />
          </div>
          <span>Brado Brey</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm">
            <Link href="/admin">Admin</Link>
          </Button>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24 text-center sm:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
            <Sparkles className="h-3 w-3" />
            Next.js 14 · TypeScript · Tailwind · Zod
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-6xl">
            Запис онлайн.
            <br />
            <span className="gradient-text">Без дзвінків і черг.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Brado Brey — Барбершоп — онлайн-запис на послугу за 30 секунд, панель адміністратора та нагадування клієнтам у Telegram.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button asChild size="lg">
              <Link
                href="/menu/demo-restaurant"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Переглянути онлайн</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link
                href="/admin"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Панель адміністратора</span>
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
              >
                <Link
                  href={feature.href}
                  className="group block h-full rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
                >
                  <div
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} text-white`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all dark:text-indigo-400">
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-200 py-8 text-center text-sm text-muted-foreground dark:border-zinc-800">
        <div className="mx-auto max-w-6xl px-6">
          Brado Brey — Барбершоп · вул. Захисників Маріуполя 89, Київ{" "}
          <Link
            href="https://github.com/Mykhailo-Zhuk/universal-service-template"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View on GitHub
          </Link>
        </div>
      </footer>
    </main>
  );
}
