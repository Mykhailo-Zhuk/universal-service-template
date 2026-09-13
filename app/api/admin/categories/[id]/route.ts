import { NextResponse } from "next/server";
import { DEMO_RESTAURANT } from "@/data/demo";
import {
  AdminCategoryUpdateSchema,
  MenuCategorySchema,
} from "@/lib/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const idx = DEMO_RESTAURANT.categories.findIndex(
    (c) => c.id === params.id
  );
  if (idx === -1) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    const parsed = AdminCategoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const updated = MenuCategorySchema.parse({
      ...DEMO_RESTAURANT.categories[idx],
      ...parsed.data,
      id: DEMO_RESTAURANT.categories[idx].id,
    });
    DEMO_RESTAURANT.categories[idx] = updated;
    console.log("[CATEGORY_UPDATED]", { id: updated.id });
    return NextResponse.json({ success: true, category: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/categories/[id]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const idx = DEMO_RESTAURANT.categories.findIndex(
    (c) => c.id === params.id
  );
  if (idx === -1) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404 }
    );
  }

  // Refuse the delete if items still reference this category.
  const inUse = DEMO_RESTAURANT.items.some(
    (item) => item.category === params.id
  );
  if (inUse) {
    return NextResponse.json(
      {
        error:
          "Cannot delete category that still has menu items. Reassign or remove them first.",
      },
      { status: 409 }
    );
  }

  const [removed] = DEMO_RESTAURANT.categories.splice(idx, 1);
  console.log("[CATEGORY_DELETED]", { id: removed.id, name: removed.name });
  return NextResponse.json({ success: true, removed });
}