import { NextResponse } from "next/server";
import { BOOKINGS_STORE } from "@/data/bookings";
import { BookingPatchSchema } from "@/lib/booking-schemas";

/**
 * PATCH /api/admin/bookings/[id] — confirm / cancel / reschedule a booking.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idx = BOOKINGS_STORE.findIndex((b) => b.id === params.id);
  if (idx === -1) {
    return NextResponse.json(
      { error: "Booking not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const parsed = BookingPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = {
      ...BOOKINGS_STORE[idx],
      ...parsed.data,
      // If date or time changed without a status bump, mark as rescheduled.
      status:
        parsed.data.status ??
        (parsed.data.date || parsed.data.time
          ? "rescheduled"
          : BOOKINGS_STORE[idx].status),
      updatedAt: new Date().toISOString(),
    };
    BOOKINGS_STORE[idx] = updated;
    console.log("[BOOKING_UPDATED]", {
      id: updated.id,
      status: updated.status,
      date: updated.date,
      time: updated.time,
    });
    return NextResponse.json({ success: true, booking: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/bookings/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}