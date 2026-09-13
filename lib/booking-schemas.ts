import { z } from "zod";

/**
 * Schema for PATCH /api/admin/bookings/[id]. Kept here so both
 * the collection route and the [id] route can import it cleanly
 * without circular cross-route imports.
 */
export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "rescheduled",
] as const;

export const BookingPatchSchema = z
  .object({
    status: z.enum(BOOKING_STATUSES).optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
      .optional(),
    time: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Time must be HH:MM")
      .optional(),
  })
  .refine(
    (data) =>
      data.status !== undefined ||
      data.date !== undefined ||
      data.time !== undefined,
    { message: "At least one field must be provided" }
  );

export type BookingPatch = z.infer<typeof BookingPatchSchema>;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];