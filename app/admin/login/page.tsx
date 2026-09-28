"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Lock,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) {
      setError("Please enter the admin secret key");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: secret.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Invalid admin secret key");
      }

      window.location.href = from;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  };

  const handleFillDemoSecret = () => {
    setSecret("misha-zhuk-admin-2026");
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
        <Button asChild variant="ghost" size="sm">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Public Site
          </Link>
        </Button>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="border-zinc-200 shadow-lg dark:border-zinc-800">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Lock className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold">Admin Access</CardTitle>
              <CardDescription>
                Enter your secret key to manage orders, bookings, and settings.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label
                    htmlFor="admin-secret"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Secret Key
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="admin-secret"
                      type={showSecret ? "text" : "password"}
                      value={secret}
                      onChange={(e) => setSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="pl-9 pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showSecret ? "Hide secret" : "Show secret"}
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-3 text-xs text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900/40">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Demo Secret:</span>
                    <button
                      type="button"
                      onClick={handleFillDemoSecret}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <Sparkles className="h-3 w-3" />
                      Fill default key
                    </button>
                  </div>
                  <code className="mt-1 block text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                    misha-zhuk-admin-2026
                  </code>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
