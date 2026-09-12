import { NextResponse } from "next/server";
import { BotWebhookSchema } from "@/lib/schemas";
import { DEMO_SERVICES } from "@/data/demo";
import { generateId } from "@/lib/utils";

// In-memory log (in production, persist to DB or log file)
const log: Array<{
  id: string;
  timestamp: string;
  level: "info" | "success" | "warning" | "error";
  message: string;
}> = [];

function logEntry(level: "info" | "success" | "warning" | "error", message: string) {
  const entry = {
    id: generateId("log"),
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  log.unshift(entry);
  // Keep only the last 100 entries
  if (log.length > 100) log.length = 100;
  return entry;
}

function buildMenuResponse(): string {
  const services = DEMO_SERVICES.slice(0, 5)
    .map((s, i) => `${i + 1}. ${s.name} — ${s.duration}min — ₴${s.price}`)
    .join("\n");
  return `Available services:\n\n${services}\n\nReply with /book <id> to book.`;
}

function handleCommand(command: string, chatId: number): string {
  const cmd = command.toLowerCase().trim();

  if (cmd === "/start" || cmd === "/help") {
    return `Welcome! I can help you book a service.\n\nCommands:\n/services - list available services\n/book <id> - book a service\n/contact - get contact info`;
  }

  if (cmd === "/services") {
    return buildMenuResponse();
  }

  if (cmd === "/contact") {
    return "Phone: +380 44 123 4567\nAddress: Khreshchatyk St. 1, Kyiv";
  }

  if (cmd.startsWith("/book ")) {
    const serviceId = cmd.replace("/book ", "").trim();
    const service = DEMO_SERVICES.find((s) => s.id === serviceId);
    if (service) {
      logEntry("success", `Bot: booking initiated for ${service.name} from chat ${chatId}`);
      return `Great! Open this link to complete your booking:\n/book/${service.id}`;
    }
    return `Service not found. Try /services to see the list.`;
  }

  return "I didn't understand that. Try /help for available commands.";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = BotWebhookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid Telegram update format",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const update = parsed.data;
    let response = "ok";

    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const fromName = update.message.from?.first_name ?? "user";
      logEntry(
        "info",
        `Bot webhook: "${update.message.text}" from ${fromName} (chat ${chatId})`
      );
      response = handleCommand(update.message.text, chatId);
    } else if (update.update_id !== undefined) {
      logEntry("info", `Bot webhook: update_id=${update.update_id}`);
    }

    return NextResponse.json({
      ok: true,
      method: "sendMessage",
      response,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST a Telegram update to this endpoint",
    example: {
      update_id: 123456,
      message: {
        chat: { id: 123 },
        from: { id: 123, first_name: "John" },
        text: "/start",
      },
    },
    logEndpoint: "/api/bot/log",
  });
}
