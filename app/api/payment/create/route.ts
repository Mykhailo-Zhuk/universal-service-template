import { NextResponse } from "next/server";
import { PaymentCreateSchema } from "@/lib/schemas";
import { generateId } from "@/lib/utils";

// Mock payment provider integration - in production, replace with real LiqPay/MonoPay SDK calls
function signMockPayment(provider: string, data: string): string {
  // Real implementations would use HMAC-SHA1/256 with provider keys
  // For demo, return a deterministic mock signature
  return Buffer.from(`${provider}:${data}:demo-signature`).toString("base64");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PaymentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { amount, currency, description, orderId, provider, customerEmail } =
      parsed.data;
    const transactionId = generateId("txn");

    const paymentData = JSON.stringify({
      version: 3,
      public_key: provider === "liqpay" ? "sandbox_i00000000" : "demo_key",
      action: "pay",
      amount,
      currency,
      description,
      order_id: orderId,
      sandbox: 1,
    });

    const signature = signMockPayment(provider, paymentData);

    // Mock checkout URL - in production, this would be a real LiqPay/MonoPay URL
    const checkoutUrl = `https://${provider}.checkout/demo/${transactionId}`;

    return NextResponse.json(
      {
        success: true,
        transactionId,
        orderId,
        provider,
        amount,
        currency,
        checkoutUrl,
        data: paymentData,
        signature,
        sandbox: true,
        customerEmail,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to create a payment",
    schema: {
      amount: "number (positive)",
      currency: "string (default: UAH)",
      description: "string",
      orderId: "string",
      provider: "liqpay | monopay",
      customerEmail: "string (optional)",
    },
  });
}
