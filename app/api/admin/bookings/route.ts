import { NextResponse } from "next/server";
import { BOOKINGS_STORE, type StoredBooking } from "@/data/bookings";
import { DEMO_SERVICES } from "@/data/demo";

/**
 * GET /api/admin/bookings — list bookings, optional filters by date & status.
 * Includes the joined service so the UI doesn't have to fan-out lookups.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const date = url.searchParams.get("date");
  const serviceId = url.searchParams.get("serviceId");

  let bookings: Array<
    StoredBooking & { service: (typeof DEMO_SERVICES)[number] | null }
  > = BOOKINGS_STORE.map((b) => ({
    ...b,
    service: DEMO_SERVICES.find((s) => s.id === b.serviceId) ?? null,
  }));

  if (status) bookings = bookings.filter((b) => b.status === status);
  if (date) bookings = bookings.filter((b) => b.date === date);
  if (serviceId)
    bookings = bookings.filter((b) => b.serviceId === serviceId);

  // Sort by date+time ascending.
  bookings.sort((a, b) =>
    (a.date + a.time).localeCompare(b.date + b.time)
  );

  return NextResponse.json({ bookings, count: bookings.length });
}