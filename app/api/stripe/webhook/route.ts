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

  // ⚡ Handle checkout completed
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
      });

      console.log("💳 Added credits:", creditsPurchased);
    }
  }

  // ⚡ Handle subscription renewals (optional)
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const userId = invoice.metadata?.userId;

    if (userId) {
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);

      await db.insert(credits).values({
        userId: Number(userId),
        amount: 150, // Example monthly credits
        expiresAt: expires,
      });

      console.log("🔄 Subscription credits added");
    }
  }

  return NextResponse.json({ received: true });
}
