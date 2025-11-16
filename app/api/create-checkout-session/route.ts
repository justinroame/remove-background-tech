import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// ⭐ Keep YOUR apiVersion exactly as you already set it
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  try {
    // ⭐ Correct NextAuth session check for App Router
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // ⭐ Match your pricing page's request body
    const { priceId, mode } = await req.json();

    if (!priceId || !mode) {
      return NextResponse.json(
        { error: "Missing priceId or mode" },
        { status: 400 }
      );
    }

    // ⭐ Create checkout session using existing Price IDs
    const checkoutSession = await stripe.checkout.sessions.create({
      mode,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=${mode === "payment" ? "1" : "subscription"}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=canceled`,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: session.user.email,

      // ⭐ Keep metadata format the same for your webhook
      metadata: {
        userEmail: session.user.email,
        source: mode === "payment" ? "PAYG" : "SUBSCRIPTION",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json(
      { error: "Stripe error" },
      { status: 500 }
    );
  }
}
