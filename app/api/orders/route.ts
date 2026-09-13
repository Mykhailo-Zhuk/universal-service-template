import { NextResponse } from "next/server";
import { DEMO_ORDERS } from "@/data/orders";
import { OrderCreateSchema, OrderSchema, type Order } from "@/lib/schemas";
import { DEMO_RESTAURANT } from "@/data/demo";
import { generateId } from "@/lib/utils";

/**
 * GET /api/orders
 *
 * Returns the demo order list with optional filters:
 *   - status    (new|preparing|ready|served|paid|cancelled)
 *   - tableId
 *   - date      (YYYY-MM-DD, matches the order's calendar day)
 *
 * In production this would read from a DB keyed by restaurant.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const tableId = url.searchParams.get("tableId");
  const date = url.searchParams.get("date");

  let orders = [...DEMO_ORDERS];

  if (status) orders = orders.filter((o) => o.status === status);
  if (tableId) orders = orders.filter((o) => o.tableId === tableId);
  if (date) {
    orders = orders.filter((o) => o.createdAt.startsWith(date));
  }

  // Sort newest first.
  orders.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(
    { orders, count: orders.length },
    {
      headers: {
        // Short cache so the polling dashboard always sees something fresh.
        "Cache-Control": "no-store",
      },
    }
  );
}

/**
 * POST /api/orders — used by the QR-menu flow when a customer places an order.
 * Validates the payload with Zod, looks up real menu items, snapshots prices
 * and returns the new order.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = OrderCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    if (payload.restaurantId !== DEMO_RESTAURANT.id) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 }
      );
    }

    // Resolve items against the live menu so prices/variations are accurate.
    const orderItems: Order["items"] = [];
    for (const requested of payload.items) {
      const menuItem = DEMO_RESTAURANT.items.find(
        (i) => i.id === requested.itemId
      );
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item not found: ${requested.itemId}` },
          { status: 404 }
        );
      }
      if (!menuItem.available) {
        return NextResponse.json(
          { error: `Item unavailable: ${menuItem.name}` },
          { status: 409 }
        );
      }

      let variationId: string | undefined;
      let variationName: string | undefined;
      let variationPriceDelta: number | undefined;

      if (requested.variationId) {
        const variation = menuItem.variations?.find(
          (v) => v.id === requested.variationId
        );
        if (!variation) {
          return NextResponse.json(
            {
              error: `Variation not found: ${requested.variationId}`,
            },
            { status: 404 }
          );
        }
        variationId = variation.id;
        variationName = variation.name;
        variationPriceDelta = variation.priceDelta;
      }

      orderItems.push({
        itemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: requested.quantity,
        notes: requested.notes,
        variationId,
        variationName,
        variationPriceDelta,
      });
    }

    const total = orderItems.reduce((sum, item) => {
      const unit =
        item.price + (item.variationPriceDelta ?? 0);
      return sum + unit * item.quantity;
    }, 0);

    const now = new Date().toISOString();
    const order: Order = OrderSchema.parse({
      id: generateId("ord"),
      restaurantId: payload.restaurantId,
      tableId: payload.tableId,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      items: orderItems,
      status: "new",
      paymentStatus: "pending",
      total,
      notes: payload.notes,
      createdAt: now,
      updatedAt: now,
    });

    // Mock persistence — would be a DB insert in production.
    console.log("[ORDER_CREATED]", {
      id: order.id,
      tableId: order.tableId,
      total: order.total,
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}