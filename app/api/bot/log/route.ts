import { NextResponse } from "next/server";
import { ADMIN_LOG } from "@/data/demo";

// In a real app, this would be a database query or in-memory store
// For the demo, we expose the static log; bot webhook appends new entries
// (kept in module scope of bot/webhook/route.ts)
export async function GET() {
  return NextResponse.json({
    logs: ADMIN_LOG,
    total: ADMIN_LOG.length,
  });
}
