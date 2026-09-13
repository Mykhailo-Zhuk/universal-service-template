import { NextResponse } from "next/server";
import { DEMO_RESTAURANT } from "@/data/demo";
import {
  AdminMenuItemCreateSchema,
  MenuItemSchema,
} from "@/lib/schemas";
import { generateId } from "@/lib/utils";

/**
 * GET /api/admin/menu — full menu for admin CRUD.
 */
export async function GET() {
  return NextResponse.json({
    items: DEMO_RESTAURANT.items,
    count: DEMO_RESTAURANT.items.length,
  });
}

/**
 * POST /api/admin/menu — create a new menu item.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = AdminMenuItemCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const item = MenuItemSchema.parse({
      ...parsed.data,
      id: parsed.data.id ?? generateId("i"),
    });

    DEMO_RESTAURANT.items.push(item);
    console.log("[MENU_ITEM_CREATED]", { id: item.id, name: item.name });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/menu]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}