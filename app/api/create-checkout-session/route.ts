import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const priceId = form.get("priceId")?.toString();
    let mode = form.get("mode")?.toString() as
      | "payment"
      | "subscription"
      | undefined;

    if (!priceId) {
      return NextResponse.json({ error: "Missing priceId" }, { status: 400 });
    }

    if (mode !== "payment" && mode !== "subscription") {
      return NextResponse.json(
        { error: "Invalid mode (payment | subscription)" },
        { status: 400 }
      );
    }

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").trim();

    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      console.error("Invalid NEXT_PUBLIC_BASE_URL:", baseUrl);
      return NextResponse.json(
        { error: "Server URL misconfigured" },
        { status: 500 }
      );
    }

    const successUrl = `${baseUrl}/pricing?success=true`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    const params: Stripe.Checkout.SessionCreateParams = {
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
