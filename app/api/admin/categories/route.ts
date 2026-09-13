import { NextResponse } from "next/server";
import { DEMO_RESTAURANT } from "@/data/demo";
import {
  AdminCategoryCreateSchema,
  MenuCategorySchema,
} from "@/lib/schemas";
import { generateId } from "@/lib/utils";

export async function GET() {
  return NextResponse.json({
    categories: DEMO_RESTAURANT.categories,
    count: DEMO_RESTAURANT.categories.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = AdminCategoryCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const category = MenuCategorySchema.parse({
      ...parsed.data,
      id: parsed.data.id ?? generateId("c"),
    });
    DEMO_RESTAURANT.categories.push(category);
    console.log("[CATEGORY_CREATED]", { id: category.id, name: category.name });
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/categories]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}