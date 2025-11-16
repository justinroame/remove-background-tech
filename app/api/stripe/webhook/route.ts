import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { addCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  let event: Stripe.Event;

  // -----------------------------
  // Verify signature
  // -----------------------------
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err) {
    console.error("❌ Invalid Stripe webhook signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    // -----------------------------------------------
    // 1️⃣ PAYG Checkout — checkout.session.completed
    // -----------------------------------------------
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "payment") {
        if (session.metadata?.userId && session.metadata?.credits) {
          console.log("💰 PAYG purchase → adding credits");
          await addCredits({
            userId: Number(session.metadata.userId),
            amount: Number(session.metadata.credits),
            source: "PAYG",
          });
        }
      }

      // For subscription checkout we wait for subscription creation
    }

    // ------------------------------------------------------------
    // 2️⃣ Subscription CREATED (first payment) — customer.subscription.created
    // ------------------------------------------------------------
    if (event.type === "customer.subscription.created") {
      const sub = event.data.object as Stripe.Subscription;

      const userId = sub.metadata?.userId;
      const credits = sub.metadata?.subscriptionCredits;

      if (userId && credits) {
        console.log("🔥 New subscription → adding initial credits");

        await addCredits({
          userId: Number(userId),
          amount: Number(credits),
          source: "SUBSCRIPTION:first_month",
        });
      }
    }

    // -----------------------------------------------------------------
    // 3️⃣ Subscription RENEWAL (monthly) — invoice.payment_succeeded
    // -----------------------------------------------------------------
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;

      // Only process subscription invoices
      if (!invoice.subscription) return NextResponse.json({ ok: true });

      // Fetch subscription to access metadata
      const subscription = await stripe.subscriptions.retrieve(
        invoice.subscription as string
      );

      const userId = subscription.metadata?.userId;
      const credits = subscription.metadata?.subscriptionCredits;

      if (userId && credits) {
        console.log("🔁 Monthly renewal → adding credits");

        await addCredits({
          userId: Number(userId),
          amount: Number(credits),
          source: "SUBSCRIPTION:renewal",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
