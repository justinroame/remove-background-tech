import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Your Stripe recurring price ID for Pro plan
const PRO_PRICE_ID = "price_XXXX"; // replace with your price ID

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id.toString();

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

      subscription_data: {
        metadata: {
          userId,
          subscriptionCredits: "200", // Number of monthly credits
        },
      },

      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error("Subscription error:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
