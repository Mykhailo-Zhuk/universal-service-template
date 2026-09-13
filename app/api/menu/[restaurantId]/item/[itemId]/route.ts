import { NextResponse } from "next/server";
import { DEMO_RESTAURANT } from "@/data/demo";
import { MenuItemParamsSchema, MenuItemSchema } from "@/lib/schemas";

export async function GET(
  _request: Request,
  { params }: { params: { restaurantId: string; itemId: string } }
) {
  // Validate path params with Zod → 400 on invalid shape.
  const parsed = MenuItemParamsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid path parameters",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { restaurantId, itemId } = parsed.data;

  if (restaurantId !== DEMO_RESTAURANT.id) {
    return NextResponse.json(
      { error: "Restaurant not found" },
      { status: 404 }
    );
  }

  const item = DEMO_RESTAURANT.items.find((i) => i.id === itemId);
  if (!item) {
    return NextResponse.json(
      { error: "Menu item not found" },
      { status: 404 }
    );
  }

  // Re-validate the item against the schema to guarantee a clean payload.
  const validated = MenuItemSchema.parse(item);

  return NextResponse.json(
    { item: validated, currency: DEMO_RESTAURANT.currency },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
