import { NextResponse } from "next/server";
import { DEMO_RESTAURANT } from "@/data/demo";
import {
  AdminMenuItemUpdateSchema,
  MenuItemSchema,
} from "@/lib/schemas";

/**
 * GET /api/admin/menu/[id] — single menu item lookup.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const item = DEMO_RESTAURANT.items.find((i) => i.id === params.id);
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

/**
 * PATCH /api/admin/menu/[id] — update an existing menu item.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idx = DEMO_RESTAURANT.items.findIndex((i) => i.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const parsed = AdminMenuItemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updated = MenuItemSchema.parse({
      ...DEMO_RESTAURANT.items[idx],
      ...parsed.data,
      id: DEMO_RESTAURANT.items[idx].id, // ID is immutable.
    });
    DEMO_RESTAURANT.items[idx] = updated;
    console.log("[MENU_ITEM_UPDATED]", { id: updated.id });
    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/menu/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/menu/[id] — remove a menu item.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const idx = DEMO_RESTAURANT.items.findIndex((i) => i.id === params.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  const [removed] = DEMO_RESTAURANT.items.splice(idx, 1);
  console.log("[MENU_ITEM_DELETED]", { id: removed.id, name: removed.name });
  return NextResponse.json({ success: true, removed });
}