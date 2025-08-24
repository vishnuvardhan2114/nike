import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/client";
import { createOrder } from "@/lib/actions/orders";
import { headers } from "next/headers";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature");

    if (!signature || !webhookSecret) {
      console.error("Missing stripe signature or webhook secret");
      return NextResponse.json(
        { error: "Missing stripe signature or webhook secret" },
        { status: 400 }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        
        // Extract user ID from metadata if available
        const userId = session.metadata?.userId || undefined;
        
        // Create order
        const orderResult = await createOrder(session.id, userId);
        
        if (!orderResult.success) {
          console.error("Failed to create order:", orderResult.error);
          return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
          );
        }
        
        console.log("Order created successfully:", orderResult.orderId);
        break;

      case "payment_intent.payment_failed":
        const paymentIntent = event.data.object;
        console.error("Payment failed:", paymentIntent.id, paymentIntent.last_payment_error);
        break;

      case "payment_intent.succeeded":
        console.log("Payment succeeded:", event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
