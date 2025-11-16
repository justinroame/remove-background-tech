// app/api/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";  // your NextAuth setup

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-01",  // latest version
});

export async function POST(req: NextRequest) {
  const { priceId, mode } = await req.json();  // "payment" or "subscription"

  // Get current user session (optional — for customer creation)
  const session = await auth();

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode,  // "payment" for one-time, "subscription" for recurring
      line_items: [
        {
          price: priceId,  // your Stripe Price ID
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get("origin") || "https://remove-background.tech"}/pricing?success=true`,
      cancel_url: `${req.headers.get("origin") || "https://remove-background.tech"}/pricing?cancel=true`,
      // Optional: pre-fill customer email if logged in
      ...(session?.user?.email && { customer_email: session.user.email }),
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}