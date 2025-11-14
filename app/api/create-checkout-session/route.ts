import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { priceId, mode } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    if (!["payment", "subscription"].includes(mode)) {
      return NextResponse.json(
        { error: "Invalid mode (payment | subscription)" },
        { status: 400 }
      );
    }

    // --- BASE URL FIX ---
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();

    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      console.error("ERROR — Invalid NEXT_PUBLIC_BASE_URL:", baseUrl);
      return NextResponse.json(
        { error: "Server URL misconfigured" },
        { status: 500 }
      );
    }

    const successUrl = `${baseUrl}/pricing?success=true`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    console.log("Using URLs for Stripe:", { successUrl, cancelUrl });

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
