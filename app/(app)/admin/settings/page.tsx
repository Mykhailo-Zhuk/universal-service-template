"use client";

/**
 * Admin / Settings (G-261)
 *
 * Lets the operator edit restaurant info, working hours, and integration
 * secrets. Sensitive values are received masked from the server (e.g.
 * "••••••••1234") and only re-sent if the user types a fresh value.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  Loader2,
  Eye,
  EyeOff,
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
import { FormField } from "@/components/admin/form-field";
import { cn } from "@/lib/utils";
import { DAYS } from "@/data/settings";

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

function isMasked(value: string): boolean {
  return value.startsWith("•••") || value === "";
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function deepEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

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

  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
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

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    setToast(null);

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
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const details =
          json.details &&
          Object.entries(json.details)
            .map(
              ([k, v]: [string, unknown]) =>
                `${k}: ${(v as string[]).join(", ")}`
            )
            .join("; ");
        setToast({
          type: "error",
          text: details || json.error || "Save failed",
        });
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
      setTimeout(() => setToast(null), 2500);
    }
  };

  const resetAll = () => {
    if (!settings) return;
    setDraft(clone(settings));
    setEditedSecrets({});
    setRevealed({});
  };

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
        <CardContent className="py-8 text-center text-sm text-red-600 dark:text-red-400">
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
          <h1 className="text-2xl font-normal tracking-[-0.03em] lg:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-foreground" />
            Restaurant info
          </CardTitle>
          <CardDescription>
            Public-facing contact details shown on receipts and the website.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Restaurant name" required>
            <Input
              value={draft.restaurantName}
              onChange={(e) => updateField("restaurantName", e.target.value)}
              maxLength={120}
              onFocus={() => (lastFocusedField.current = "restaurantName")}
            />
          </FormField>
          <FormField label="Currency">
            <Input
              value={draft.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              maxLength={8}
              placeholder="UAH"
              className="font-mono"
            />
          </FormField>
          <FormField label="Phone" required className="sm:col-span-2">
            <Input
              value={draft.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              maxLength={30}
              placeholder="+380 44 123 4567"
              className="font-mono"
            />
          </FormField>
          <FormField label="Email" className="sm:col-span-2">
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => updateField("email", e.target.value)}
              maxLength={120}
              placeholder="hello@example.com"
            />
          </FormField>
          <FormField label="Address" required className="sm:col-span-2">
            <Textarea
              value={draft.address}
              onChange={(e) => updateField("address", e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Khreshchatyk St. 1, Kyiv, Ukraine"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-foreground" />
            Working hours
          </CardTitle>
          <CardDescription>
            When the venue accepts orders. Disabled days are treated as closed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {DAYS.map(({ key, label }) => {
            const day = draft.workingHours[key];
            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col gap-3 rounded-[12px] border border-border bg-background p-3.5 sm:flex-row sm:items-center sm:justify-between",
                  !day.open && "opacity-65"
                )}
              >
                <div className="flex items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={day.open}
                      onChange={(e) =>
                        updateHours(key, "open", e.target.checked)
                      }
                      className="h-4 w-4 rounded border-border-strong accent-[#232323] dark:accent-[#a1ffcb]"
                    />
                    <span className="w-24 text-sm font-medium text-foreground">
                      {label}
                    </span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={day.from}
                    disabled={!day.open}
                    onChange={(e) => updateHours(key, "from", e.target.value)}
                    className="w-32 font-mono"
                  />
                  <span className="text-sm text-muted-foreground">→</span>
                  <Input
                    type="time"
                    value={day.to}
                    disabled={!day.open}
                    onChange={(e) => updateHours(key, "to", e.target.value)}
                    className="w-32 font-mono"
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Plug className="h-4 w-4 text-foreground" />
            Integrations
          </CardTitle>
          <CardDescription>
            API tokens for payment providers and the Telegram bot. Leave blank
            to keep the existing value.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          {SECRET_FIELDS.map(({ key, label, desc, field }) => {
            const value = draft[field];
            const masked = isMasked(value);
            const configured = settings.secretsConfigured[key];
            const isRevealed = !!revealed[field];
            const isEdited = !!editedSecrets[field];
            return (
              <div
                key={field}
                className="space-y-1.5 rounded-[14px] border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    {label}
                  </label>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      configured
                        ? "bg-[#a1ffcb] text-[#173324] dark:bg-[#a1ffcb]/20 dark:text-[#a1ffcb]"
                        : "bg-surface text-muted-foreground border border-border"
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
                    onChange={(e) => onSecretChange(field, e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                    className="pr-20 font-mono"
                  />
                  <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                    {(isEdited || !masked) && (
                      <button
                        type="button"
                        onClick={() => resetSecret(field)}
                        className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                        title="Reset to stored value"
                        aria-label="Reset to stored value"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setRevealed((s) => ({ ...s, [field]: !s[field] }))
                      }
                      className="rounded-[6px] p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
                      title={isRevealed ? "Hide value" : "Reveal value"}
                      aria-label={isRevealed ? "Hide value" : "Reveal value"}
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

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background px-4 py-3 transition-all lg:px-8",
          dirty
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-foreground">
              You have unsaved changes.
            </span>
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

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-[12px] border bg-background px-4 py-2.5 text-sm font-medium",
              toast.type === "success"
                ? "border-border-strong text-foreground"
                : "border-red-300 text-red-700 dark:border-red-900/60 dark:text-red-300"
            )}
            role="status"
          >
            {toast.type === "success" ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#a1ffcb] text-[#232323]">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
