/**
 * G-261 — Mock settings store for the admin panel.
 *
 * In production this would be persisted to a database (and the secret tokens
 * encrypted at rest). For the demo template we keep everything in memory
 * behind a module-level object so changes survive across requests within
 * the same server process.
 *
 * IMPORTANT: the secret tokens below are fake demo values. They are
 * intentionally short / recognizable so anyone reading the source can tell
 * they are placeholders.
 */
import type { DayKey, Settings, SettingsUpdate } from "@/lib/settings-schemas";

/** Stable demo secrets. Masked values must NEVER be sent to the client in plain text. */
const FAKE_TELEGRAM_TOKEN = "1234567890:AAHfakeTelegramBotToken_demoXYZ123";
const FAKE_LIQPAY_PUBLIC = "sandbox_i00000000000";
const FAKE_LIQPAY_PRIVATE = "sandbox_XXXXXXXXXXXXXXXX";
const FAKE_MONOPAY_PUBLIC = "mp_demo_pub_0000000000";
const FAKE_MONOPAY_PRIVATE = "mp_demo_priv_0000000000";

/** In-memory store — survives between requests in the same Next.js process. */
const STORE: Settings = {
  restaurantName: "Demo Restaurant",
  address: "Khreshchatyk St. 1, Kyiv, Ukraine",
  phone: "+380 44 123 4567",
  email: "hello@demo-restaurant.com",
  currency: "UAH",
  workingHours: {
    mon: { open: true, from: "09:00", to: "22:00" },
    tue: { open: true, from: "09:00", to: "22:00" },
    wed: { open: true, from: "09:00", to: "22:00" },
    thu: { open: true, from: "09:00", to: "22:00" },
    fri: { open: true, from: "09:00", to: "23:00" },
    sat: { open: true, from: "10:00", to: "23:00" },
    sun: { open: false, from: "10:00", to: "22:00" },
  },
  // Sensitive — present in the server store, returned to the client as `***masked***`.
  telegramBotToken: FAKE_TELEGRAM_TOKEN,
  liqPayPublicKey: FAKE_LIQPAY_PUBLIC,
  liqPayPrivateKey: FAKE_LIQPAY_PRIVATE,
  monoPayPublicKey: FAKE_MONOPAY_PUBLIC,
  monoPayPrivateKey: FAKE_MONOPAY_PRIVATE,
};

/**
 * Mask a secret for safe transmission to the browser.
 * Reveals the last 4 characters so the user can confirm what's stored
 * without leaking the whole token.
 */
export function maskSecret(value: string | undefined): string {
  if (!value) return "";
  if (value.length <= 4) return "•".repeat(value.length);
  return `••••••••${value.slice(-4)}`;
}

/**
 * Returns a sanitised copy of the settings for the admin UI.
 * Secret fields are replaced with `***masked***` so they never leave the server
 * in plain text. The original values stay in `STORE`.
 */
export function getPublicSettings(): Omit<Settings, "telegramBotToken" | "liqPayPublicKey" | "liqPayPrivateKey" | "monoPayPublicKey" | "monoPayPrivateKey"> & {
  telegramBotToken: string;
  liqPayPublicKey: string;
  liqPayPrivateKey: string;
  monoPayPublicKey: string;
  monoPayPrivateKey: string;
  // Hint flags so the UI can show "configured" badges without exposing values.
  secretsConfigured: {
    telegramBotToken: boolean;
    liqPayPublicKey: boolean;
    liqPayPrivateKey: boolean;
    monoPayPublicKey: boolean;
    monoPayPrivateKey: boolean;
  };
} {
  return {
    restaurantName: STORE.restaurantName,
    address: STORE.address,
    phone: STORE.phone,
    email: STORE.email,
    currency: STORE.currency,
    workingHours: STORE.workingHours,
    telegramBotToken: maskSecret(STORE.telegramBotToken),
    liqPayPublicKey: maskSecret(STORE.liqPayPublicKey),
    liqPayPrivateKey: maskSecret(STORE.liqPayPrivateKey),
    monoPayPublicKey: maskSecret(STORE.monoPayPublicKey),
    monoPayPrivateKey: maskSecret(STORE.monoPayPrivateKey),
    secretsConfigured: {
      telegramBotToken: Boolean(STORE.telegramBotToken),
      liqPayPublicKey: Boolean(STORE.liqPayPublicKey),
      liqPayPrivateKey: Boolean(STORE.liqPayPrivateKey),
      monoPayPublicKey: Boolean(STORE.monoPayPublicKey),
      monoPayPrivateKey: Boolean(STORE.monoPayPrivateKey),
    },
  };
}

export type PublicSettings = ReturnType<typeof getPublicSettings>;

/**
 * Patch the in-memory settings. Returns the new public view (masked secrets).
 * `undefined` values for secrets mean "don't change the existing value".
 */
export function patchSettings(patch: SettingsUpdate): PublicSettings {
  if (patch.restaurantName !== undefined) STORE.restaurantName = patch.restaurantName;
  if (patch.address !== undefined) STORE.address = patch.address;
  if (patch.phone !== undefined) STORE.phone = patch.phone;
  if (patch.email !== undefined) STORE.email = patch.email;
  if (patch.currency !== undefined) STORE.currency = patch.currency;
  if (patch.workingHours) {
    // patch.workingHours is already a partial: each day is optional.
    const next = { ...STORE.workingHours };
    for (const k of ["mon","tue","wed","thu","fri","sat","sun"] as const) {
      const dayPatch = patch.workingHours[k];
      if (dayPatch) next[k] = dayPatch;
    }
    STORE.workingHours = next;
  }

  // Secrets: a secret that arrives as the literal masked placeholder or as an
  // empty string is interpreted as "leave unchanged". Only a real-looking new
  // value should overwrite the existing secret.
  const isUnchanged = (v: string | undefined) =>
    v === undefined || v === "" || v.startsWith("•••");

  if (!isUnchanged(patch.telegramBotToken)) {
    STORE.telegramBotToken = patch.telegramBotToken;
  }
  if (!isUnchanged(patch.liqPayPublicKey)) {
    STORE.liqPayPublicKey = patch.liqPayPublicKey;
  }
  if (!isUnchanged(patch.liqPayPrivateKey)) {
    STORE.liqPayPrivateKey = patch.liqPayPrivateKey;
  }
  if (!isUnchanged(patch.monoPayPublicKey)) {
    STORE.monoPayPublicKey = patch.monoPayPublicKey;
  }
  if (!isUnchanged(patch.monoPayPrivateKey)) {
    STORE.monoPayPrivateKey = patch.monoPayPrivateKey;
  }

  return getPublicSettings();
}

/** All days of the week in canonical order. */
export const DAYS: ReadonlyArray<{ key: DayKey; label: string }> = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];