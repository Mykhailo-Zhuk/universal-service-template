/**
 * G-261 — Zod schemas + inferred types for the admin Settings form.
 *
 * The form supports:
 *   - Restaurant info (name, address, phone, email, currency)
 *   - Working hours per weekday (open/closed + from/to time)
 *   - Integration secrets (Telegram bot token, LiqPay keys, MonoPay keys)
 *
 * Secret fields are sent to the client masked (e.g. "••••••••1234") and
 * only get persisted when the user types a new value. The PATCH route
 * treats the masked placeholder or empty string as "no change".
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Working hours
// ---------------------------------------------------------------------------

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

const HHMM = /^\d{2}:\d{2}$/;

/** Time range for one day. `from` must be strictly earlier than `to`. */
export const WorkingHoursEntrySchema = z
  .object({
    open: z.boolean(),
    from: z.string().regex(HHMM, "Use HH:MM"),
    to: z.string().regex(HHMM, "Use HH:MM"),
  })
  .refine(
    (v) => !v.open || v.from < v.to,
    { message: "Close time must be after open time", path: ["to"] }
  );

export const WorkingHoursSchema = z.object({
  mon: WorkingHoursEntrySchema,
  tue: WorkingHoursEntrySchema,
  wed: WorkingHoursEntrySchema,
  thu: WorkingHoursEntrySchema,
  fri: WorkingHoursEntrySchema,
  sat: WorkingHoursEntrySchema,
  sun: WorkingHoursEntrySchema,
});

// ---------------------------------------------------------------------------
// Settings (full server-side shape, includes real secrets)
// ---------------------------------------------------------------------------

export const SettingsSchema = z.object({
  restaurantName: z.string().min(1, "Name is required").max(120),
  address: z.string().min(1, "Address is required").max(200),
  phone: z
    .string()
    .min(1, "Phone is required")
    .max(30)
    .regex(/^[+\d\s()-]+$/, "Invalid phone"),
  email: z
    .string()
    .email("Invalid email")
    .max(120)
    .optional()
    .or(z.literal("")),
  currency: z.string().min(1).max(8).default("UAH"),
  workingHours: WorkingHoursSchema,
  // Secrets — server-side only. The client only ever sees masked versions.
  telegramBotToken: z.string().optional(),
  liqPayPublicKey: z.string().optional(),
  liqPayPrivateKey: z.string().optional(),
  monoPayPublicKey: z.string().optional(),
  monoPayPrivateKey: z.string().optional(),
});

export type Settings = z.infer<typeof SettingsSchema>;

// ---------------------------------------------------------------------------
// Update payload — what the PATCH route accepts.
// Secrets are optional strings; the route treats the masked placeholder
// or empty string as "no change".
// ---------------------------------------------------------------------------

export const SettingsUpdateSchema = SettingsSchema.partial().extend({
  workingHours: WorkingHoursSchema.partial().optional(),
});

export type SettingsUpdate = z.infer<typeof SettingsUpdateSchema>;