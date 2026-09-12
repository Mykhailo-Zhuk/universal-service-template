import { NextResponse } from "next/server";
import { PaymentCallbackSchema } from "@/lib/schemas";

// In production, this would verify the signature from the payment provider
// and update the order status in the database.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = PaymentCallbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { orderId, status, amount, provider, transactionId } = parsed.data;

    // Mock action based on status
    switch (status) {
      case "success":
        console.log(`[PAYMENT_SUCCESS] ${provider} order=${orderId} amount=${amount} txn=${transactionId}`);
        break;
      case "failure":
        console.log(`[PAYMENT_FAILED] ${provider} order=${orderId}`);
        break;
      case "pending":
        console.log(`[PAYMENT_PENDING] ${provider} order=${orderId}`);
        break;
    }

    return NextResponse.json({
      success: true,
      orderId,
      status,
      provider,
      transactionId,
      processedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process callback" },
      { status: 500 }
    );
  }
}
