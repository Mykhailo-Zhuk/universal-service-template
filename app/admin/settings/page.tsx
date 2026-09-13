"use client";

/**
 * Admin / Settings (G-261)
 *
 * Lets the operator edit restaurant info, working hours, and integration
 * secrets. Sensitive values are received masked from the server (e.g.
 * "••••••••1234") and only re-sent if the user types a fresh value —
 * otherwise the API treats them as "no change".
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Loader2,
  Eye,
  EyeOff,
  Settings as SettingsIcon,
  Clock,
  Plug,
  Store,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  RotateCcw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { DAYS } from "@/data/settings";

// ---- Types ---------------------------------------------------------------

type DayKey = (typeof DAYS)[number]["key"];

type WorkingHoursEntry = {
  open: boolean;
  from: string;
  to: string;
};

type WorkingHours = Record<DayKey, WorkingHoursEntry>;

type SecretsConfigured = {
  telegramBotToken: boolean;
  liqPayPublicKey: boolean;
  liqPayPrivateKey: boolean;
  monoPayPublicKey: boolean;
  monoPayPrivateKey: boolean;
};

type Settings = {
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  workingHours: WorkingHours;
  telegramBotToken: string;
  liqPayPublicKey: string;
  liqPayPrivateKey: string;
  monoPayPublicKey: string;
  monoPayPrivateKey: string;
  secretsConfigured: SecretsConfigured;
};

const SECRET_FIELDS: Array<{
  key: keyof SecretsConfigured;
  label: string;
  desc: string;
  field: keyof Pick<
    Settings,
    | "telegramBotToken"
    | "liqPayPublicKey"
    | "liqPayPrivateKey"
    | "monoPayPublicKey"
    | "monoPayPrivateKey"
  >;
}> = [
  {
    key: "telegramBotToken",
    label: "Telegram bot token",
    desc: "BotFather token used by the Telegram webhook.",
    field: "telegramBotToken",
  },
  {
    key: "liqPayPublicKey",
    label: "LiqPay public key",
    desc: "Public API key for LiqPay payments.",
    field: "liqPayPublicKey",
  },
  {
    key: "liqPayPrivateKey",
    label: "LiqPay private key",
    desc: "Private API key for LiqPay. Never exposed to the browser.",
    field: "liqPayPrivateKey",
  },
  {
    key: "monoPayPublicKey",
    label: "MonoPay public key",
    desc: "Public token issued by MonoPay.",
    field: "monoPayPublicKey",
  },
  {
    key: "monoPayPrivateKey",
    label: "MonoPay private key",
    desc: "Private token for MonoPay API calls.",
    field: "monoPayPrivateKey",
  },
];

// ---- Helpers -------------------------------------------------------------

function isMasked(value: string): boolean {
  return value.startsWith("•••") || value === "";
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---- Component -----------------------------------------------------------

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Per-secret reveal state.
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Track whether a secret has been edited by the user.
  const [editedSecrets, setEditedSecrets] = useState<Record<string, boolean>>(
    {}
  );

  const lastFocusedField = useRef<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/settings", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const json = (await res.json()) as { settings: Settings };
      setSettings(json.settings);
      setDraft(clone(json.settings));
      setEditedSecrets({});
      setRevealed({});
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const dirty = useMemo(() => {
    if (!settings || !draft) return false;
    if (deepEqual(settings, draft)) return false;
    return true;
  }, [settings, draft]);

  // ---- Update helpers ----

  const updateField = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  const updateHours = (
    day: DayKey,
    field: keyof WorkingHoursEntry,
    value: WorkingHoursEntry[typeof field]
  ) => {
    setDraft((d) =>
      d
        ? {
            ...d,
            workingHours: {
              ...d.workingHours,
              [day]: { ...d.workingHours[day], [field]: value },
            },
          }
        : d
    );
  };

  const onSecretChange = (key: string, value: string) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
    setEditedSecrets((s) => ({ ...s, [key]: true }));
  };

  const resetSecret = (fieldKey: string) => {
    if (!settings) return;
    setDraft((d) =>
      d ? { ...d, [fieldKey]: settings[fieldKey as keyof Settings] } : d
    );
    setEditedSecrets((s) => ({ ...s, [fieldKey]: false }));
  };

  // ---- Submit ----

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setToast(null);

    // Strip unmasked secrets from the payload — server treats them as
    // "no change". Only edited secrets are forwarded.
    const payload: Record<string, unknown> = {
      restaurantName: draft.restaurantName.trim(),
      address: draft.address.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      currency: draft.currency.trim() || "UAH",
      workingHours: draft.workingHours,
    };

    for (const f of SECRET_FIELDS) {
      const value = draft[f.field];
      const edited = editedSecrets[f.field];
      if (edited && !isMasked(value)) {
        payload[f.field] = value;
      }
    }

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json().catch(() => ({})));
      if (!res.ok) {
        const details =
          json.details &&
          Object.entries(json.details)
            .map(
              ([k, v]: [string, unknown]) =>
                `${k}: ${(v as string[]).join(", ")}`
            )
            .join("; ");
        setToast({ type: "error", text: details || json.error || "Save failed" });
        return;
      }
      const next = (json.settings as Settings) ?? null;
      if (next) {
        setSettings(next);
        setDraft(clone(next));
        setEditedSecrets({});
      }
      setToast({ type: "success", text: "Settings saved" });
    } catch (err) {
      setToast({
        type: "error",
        text: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSaving(false);
      // Auto-hide success toast.
      setTimeout(() => setToast(null), 2500);
    }
  };

  const resetAll = () => {
    if (!settings) return;
    setDraft(clone(settings));
    setEditedSecrets({});
    setRevealed({});
  };

  // ---- Render ----

  if (loading && !draft) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-red-600">
          {loadError}
        </CardContent>
      </Card>
    );
  }

  if (!settings || !draft) return null;

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-muted-foreground">
            Restaurant info, opening hours, and integration secrets.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetAll}
          disabled={!dirty || saving}
        >
          <RotateCcw className="h-4 w-4" />
          Discard changes
        </Button>
      </header>

      {/* Restaurant info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-indigo-500" />
            Restaurant info
          </CardTitle>
          <CardDescription>
            Public-facing contact details shown on receipts and the website.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Restaurant name" required>
            <Input
              value={draft.restaurantName}
              onChange={(e) =>
                updateField("restaurantName", e.target.value)
              }
              maxLength={120}
              onFocus={() => (lastFocusedField.current = "restaurantName")}
            />
          </Field>
          <Field label="Currency">
            <Input
              value={draft.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              maxLength={8}
              placeholder="UAH"
            />
          </Field>
          <Field label="Phone" required className="sm:col-span-2">
            <Input
              value={draft.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              maxLength={30}
              placeholder="+380 44 123 4567"
            />
          </Field>
          <Field label="Email" className="sm:col-span-2">
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => updateField("email", e.target.value)}
              maxLength={120}
              placeholder="hello@example.com"
            />
          </Field>
          <Field label="Address" required className="sm:col-span-2">
            <Textarea
              value={draft.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Khreshchatyk St. 1, Kyiv, Ukraine"
            />
          </Field>
        </CardContent>
      </Card>

      {/* Working hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-indigo-500" />
            Working hours
          </CardTitle>
          <CardDescription>
            When the venue accepts orders. Disabled days are treated as
            closed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {DAYS.map(({ key, label }) => {
            const day = draft.workingHours[key];
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col gap-3 rounded-lg border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800",
                  !day.open && "opacity-70"
                )}
              >
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={day.open}
                      onChange={(e) =>
                        updateHours(key, "open", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="w-24 text-sm font-medium">{label}</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={day.from}
                    disabled={!day.open}
                    onChange={(e) =>
                      updateHours(key, "from", e.target.value)
                    }
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">→</span>
                  <Input
                    type="time"
                    value={day.to}
                    disabled={!day.open}
                    onChange={(e) =>
                      updateHours(key, "to", e.target.value)
                    }
                    className="w-32"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Integrations / secrets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="h-4 w-4 text-indigo-500" />
            Integrations
          </CardTitle>
          <CardDescription>
            API tokens for payment providers and the Telegram bot. Leave
            blank to keep the existing value.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SECRET_FIELDS.map(({ key, label, desc, field }) => {
            const value = draft[field];
            const masked = isMasked(value);
            const configured = settings.secretsConfigured[key];
            const isRevealed = !!revealed[field];
            const isEdited = !!editedSecrets[field];
            return (
              <div
                key={field}
                className="space-y-1.5 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    {label}
                  </label>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      configured
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    )}
                  >
                    {configured ? "Configured" : "Not set"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{desc}</p>
                <div className="relative mt-2">
                  <Input
                    type={isRevealed ? "text" : "password"}
                    value={isEdited ? value : masked ? value : ""}
                    placeholder={configured ? "••••••••" : "Not set"}
                    onChange={(e) =>
                      onSecretChange(field, e.target.value)
                    }
                    autoComplete="off"
                    spellCheck={false}
                    className="pr-20 font-mono"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                    {(isEdited || !masked) && (
                      <button
                        type="button"
                        onClick={() => resetSecret(field)}
                        className="rounded p-1 text-muted-foreground hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
                        title="Reset to stored value"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((s) => ({ ...s, [field]: !s[field] }))
                      }
                      className="rounded p-1 text-muted-foreground hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
                      title={isRevealed ? "Hide value" : "Reveal value"}
                    >
                      {isRevealed ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                {masked && !isEdited && (
                  <p className="text-xs text-muted-foreground">
                    Type a new value to replace the stored secret.
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Sticky save bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur-md transition-all dark:border-zinc-800 dark:bg-zinc-950/95",
          dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="font-medium">You have unsaved changes.</span>
            <span className="hidden text-muted-foreground sm:inline">
              Save to apply them across the site.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetAll}
              disabled={saving}
            >
              <X className="h-3.5 w-3.5" />
              Discard
            </Button>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save changes
            </Button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-md border px-4 py-2 text-sm shadow-lg",
              toast.type === "success"
                ? "border-emerald-200 bg-white text-emerald-700 dark:border-emerald-900/50 dark:bg-zinc-950 dark:text-emerald-300"
                : "border-red-200 bg-white text-red-700 dark:border-red-900/50 dark:bg-zinc-950 dark:text-red-300"
            )}
            role="status"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quiet reference to keep type imports honest. */}
      <span className="hidden" aria-hidden>
        <SettingsIcon className="h-4 w-4" />
      </span>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  className,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

