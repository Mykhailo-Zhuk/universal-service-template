import { renderLandingHtml } from "@/lib/landing-page";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(renderLandingHtml(), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
