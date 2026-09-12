import { NextResponse } from "next/server";
import { DEMO_SERVICES } from "@/data/demo";
import { BookingSchema, ServiceSchema } from "@/lib/schemas";
import { generateId } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const serviceId = url.searchParams.get("serviceId");

    if (serviceId) {
      const service = DEMO_SERVICES.find((s) => s.id === serviceId);
      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }
      const validated = ServiceSchema.parse(service);
      return NextResponse.json({ service: validated });
    }

    return NextResponse.json({ services: DEMO_SERVICES });
  } catch {
    return NextResponse.json(
      { error: "Failed to load services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const booking = parsed.data;
    const service = DEMO_SERVICES.find((s) => s.id === booking.serviceId);

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (!service.available) {
      return NextResponse.json(
        { error: "Service is not available" },
        { status: 409 }
      );
    }

    const bookingId = generateId("book");
    const bookingDate = new Date(`${booking.date}T${booking.time}:00`);

    if (bookingDate.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "Booking time must be in the future" },
        { status: 400 }
      );
    }

    // Mock booking persistence - in production, save to DB
    console.log("[BOOKING_CREATED]", {
      bookingId,
      service: service.name,
      customer: booking.customerName,
      date: booking.date,
      time: booking.time,
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: bookingId,
          ...booking,
          service: {
            id: service.id,
            name: service.name,
            duration: service.duration,
            price: service.price,
          },
          createdAt: new Date().toISOString(),
          status: "confirmed",
        },
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
