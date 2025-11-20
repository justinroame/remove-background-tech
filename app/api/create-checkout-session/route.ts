// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    const { priceId, mode } = await req.json();

    if (!priceId || !mode) {
      return NextResponse.json({ error: "Missing priceId or mode" }, { status: 400 });
    }

    // Build the checkout session
    const checkout = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin")}/pricing?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?cancel=true`,

      // CRITICAL — metadata ensures Stripe webhook knows what to award
      metadata: {
        userId: String(userId),
        priceId,
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err: any) {
    console.error("CHECKOUT_SESSION_ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Checkout failed" },
      { status: 500 }
    );
  }
}
