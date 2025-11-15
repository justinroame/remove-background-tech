import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    // Read form POST, not JSON
    const form = await req.formData();

    const priceId = form.get("priceId")?.toString();
    const mode = form.get("mode")?.toString();

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing priceId" },
        { status: 400 }
      );
    }

    if (!["payment", "subscription"].includes(mode || "")) {
      return NextResponse.json(
        { error: "Invalid mode (payment | subscription)" },
        { status: 400 }
      );
    }

    // Validate base URL
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

    console.log("Stripe redirect URLs:", { successUrl, cancelUrl });

    // Create session
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
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
