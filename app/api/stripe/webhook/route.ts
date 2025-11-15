import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { addCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    console.error("❌ Webhook signature mismatch", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // --------------------------------------------------
    // 1️⃣ ONE-TIME payments (PAYG credits)
    // --------------------------------------------------
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.credits && session.metadata?.userId) {
        await addCredits({
          userId: parseInt(session.metadata.userId),
          amount: Number(session.metadata.credits),
          source: "PAYG",
        });
      }
    }

    // --------------------------------------------------
    // 2️⃣ SUBSCRIPTIONS renew monthly
    // --------------------------------------------------
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      const userId = invoice.metadata?.userId;
      const credits = invoice.metadata?.subscriptionCredits; // e.g., "200"

      if (userId && credits) {
        await addCredits({
          userId: parseInt(userId),
          amount: Number(credits),
          source: "SUBSCRIPTION:pro_monthly",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
