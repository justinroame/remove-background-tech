import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const stripe = getStripe(); // ✅ runtime only

    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const { priceId, mode } = await req.json();

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: "Missing priceId or mode" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?cancel=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout-session error:", err);
    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}
