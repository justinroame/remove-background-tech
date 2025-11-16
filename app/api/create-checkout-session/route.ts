import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth"; // ✅ NEW — pulls from root auth.ts

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "latest",
});

export async function POST(req: Request) {
  try {
    // ✅ Auth using the App Router NextAuth system
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { credits } = await req.json();

    if (!credits || credits < 1) {
      return NextResponse.json(
        { error: "Invalid credit amount" },
        { status: 400 }
      );
    }

    // Your PAYG unit price (in dollars)
    const unitPrice = 30; // Example = $0.30 per credit

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=1`,

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${credits} Image Credits`,
            },
            unit_amount: unitPrice * 100, // convert to cents
          },
          quantity: credits,
        },
      ],

      // Metadata → used in webhook to mint credits
      metadata: {
        userId: String(session.user.id),
        credits: String(credits),
        source: "PAYG",
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
