import { NextResponse } from "next/server";
import { DEMO_ORDERS } from "@/data/orders";
import { OrderUpdateSchema } from "@/lib/schemas";

/**
 * GET /api/orders/[id] — single order lookup.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const order = DEMO_ORDERS.find((o) => o.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

/**
 * PATCH /api/orders/[id] — admin updates status / payment flags.
 * In production this would persist to a DB and broadcast over a channel
 * so the customer-facing menu UI can refresh.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idx = DEMO_ORDERS.findIndex((o) => o.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = OrderUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updates = parsed.data;
    const current = DEMO_ORDERS[idx];

    // Convenience: when an order moves to "served", keep the kitchen
    // flow natural — the "paid" transition is handled separately so we
    // don't auto-charge here.
    const updated = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Mock persistence — would be a DB write in production.
    DEMO_ORDERS[idx] = updated;
    console.log("[ORDER_UPDATED]", {
      id: updated.id,
      status: updated.status,
      paymentStatus: updated.paymentStatus,
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err) {
    console.error("[PATCH /api/orders/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}