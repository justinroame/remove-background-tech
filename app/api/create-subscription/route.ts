import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth"; // ✅ new App Router auth system

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
 apiVersion: "2025-10-29.clover",
});

// Your Stripe recurring price ID (update this)
const PRO_PRICE_ID = "price_XXXX"; // ← replace this

export async function POST() {
  try {
    // ✅ authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = String(session.user.id);

    // 💳 Create a Stripe Subscription Checkout Session
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=subscription`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=1`,

      line_items: [
        {
          price: PRO_PRICE_ID,
          quantity: 1,
        },
      ],

      // ✔ metadata provided to the subscription object
      subscription_data: {
        metadata: {
          userId,
          subscriptionCredits: "200", // monthly credits tier
          source: "SUBSCRIPTION",
        },
      },

      // ✔ metadata on checkout session for webhook convenience
      metadata: {
        userId,
        source: "SUBSCRIPTION",
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("Subscription error:", err);
    return NextResponse.json(
      { error: "Stripe error" },
      { status: 500 }
    );
  }
}
