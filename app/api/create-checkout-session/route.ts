// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover" as any,   // ← THIS LINE ONLY
});

export async function POST(req: NextRequest) {
  const { priceId, mode } = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.get("origin") || "https://remove-background.tech"}/pricing?success=true`,
      cancel_url: `${req.headers.get("origin") || "https://remove-background.tech"}/pricing?cancel=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}