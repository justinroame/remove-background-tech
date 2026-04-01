import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/serverAuth";
import { PAYG_PRICES } from "@/lib/prices";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Please log in first." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const credits = String(body?.credits ?? "");
    const priceId = PAYG_PRICES[credits as keyof typeof PAYG_PRICES];
    if (!priceId) return NextResponse.json({ error: "Invalid credit selection." }, { status: 400 });

    const origin = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/pricing?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: { userId: String(user.id), credits },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
