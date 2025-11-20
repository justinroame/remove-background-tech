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

    // Build checkout session
    const checkout = await stripe.checkout.sessions.create({
      mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],

      // ✅ FIXED — redirect to HOME PAGE with success banner
      success_url: `${req.headers.get("origin")}/?success=1`,

      // Cancel sends them back to pricing
      cancel_url: `${req.headers.get("origin")}/pricing?cancel=1`,

      // Critical metadata for webhook processing
      metadata: {
        userId: String(userId),
        priceId,
        creditMode: mode === "payment" ? "PAYG" : "SUBSCRIPTION",
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
