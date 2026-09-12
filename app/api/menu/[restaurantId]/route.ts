import { NextResponse } from "next/server";
import { DEMO_RESTAURANT } from "@/data/demo";
import { RestaurantSchema } from "@/lib/schemas";

export async function GET(
  _request: Request,
  { params }: { params: { restaurantId: string } }
) {
  try {
    if (params.restaurantId === DEMO_RESTAURANT.id) {
      const validated = RestaurantSchema.parse(DEMO_RESTAURANT);
      return NextResponse.json(validated, {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      });
    }

    return NextResponse.json(
      { error: "Restaurant not found" },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid restaurant data" },
      { status: 500 }
    );
  }
}
