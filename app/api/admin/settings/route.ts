/**
 * G-261 — Admin Settings API.
 *
 * GET  /api/admin/settings
 *   → Returns the sanitised settings (secrets masked).
 *
 * PATCH /api/admin/settings
 *   → Updates a subset of the settings. All fields are optional.
 *   → The body is validated with Zod. Secrets arriving as the masked
 *     placeholder or empty string are treated as "no change".
 *   → Returns the updated public view.
 */
import { NextResponse } from "next/server";
import { SettingsUpdateSchema } from "@/lib/settings-schemas";
import {
  getPublicSettings,
  patchSettings,
} from "@/data/settings";

export async function GET() {
  return NextResponse.json({
    settings: getPublicSettings(),
  });
}

export async function PATCH(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = SettingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const updated = patchSettings(parsed.data);
    console.log("[SETTINGS_UPDATED]", {
      restaurantName: updated.restaurantName,
    });
    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/settings]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}