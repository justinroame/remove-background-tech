import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification error:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ---------------------------
  // Checkout one-time purchases
  // ---------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const creditsPurchased = session.metadata?.credits;

    if (userId && creditsPurchased) {
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);

      await db.insert(credits).values({
        userId: Number(userId),
        amount: Number(creditsPurchased),
        expiresAt: expires,
        source: "PAYG",            // ✅ REQUIRED
      });

      console.log("💳 Added PAYG credits:", creditsPurchased);
    }
  }

  // ---------------------------
  // Subscription renewals
  // ---------------------------
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const userId = invoice.metadata?.userId;

    if (userId) {
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);

      // Example subscription: 150 credits/month
      await db.insert(credits).values({
        userId: Number(userId),
        amount: 150,
        expiresAt: expires,
        source: "SUBSCRIPTION",    // ✅ REQUIRED
      });

      console.log("🔄 Subscription credits added");
    }
  }

  return NextResponse.json({ received: true });
}
