import { NextResponse } from "next/server";
import { DEMO_SERVICES } from "@/data/demo";
import { ServiceSlotParamsSchema, ServiceSlotSchema } from "@/lib/schemas";
import { generateSlotsForService } from "@/lib/data-helpers";

export async function GET(
  _request: Request,
  { params }: { params: { serviceId: string; slotId: string } }
) {
  // Validate path params with Zod → 400 on invalid shape.
  const parsed = ServiceSlotParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid path parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { serviceId, slotId } = parsed.data;

  const service = DEMO_SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return NextResponse.json(
      { error: "Service not found" },
      { status: 404 }
    );
  }

  const allSlots = generateSlotsForService(serviceId);
  const slot = allSlots.find((s) => s.id === slotId);

  if (!slot) {
    return NextResponse.json(
      { error: "Slot not found" },
      { status: 404 }
    );
  }

  const validated = ServiceSlotSchema.parse(slot);

  return NextResponse.json(
    {
      slot: validated,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price,
        provider: service.provider,
        masterName: service.masterName ?? null,
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}
