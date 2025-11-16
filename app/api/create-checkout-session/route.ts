import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { credits } = await req.json();

    if (!credits || credits < 1) {
      return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 });
    }

    // Your PAYG price from Stripe dashboard
    const unitPrice = 30; // $0.30 per credit, example

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=1`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${credits} Image Credits` },
            unit_amount: unitPrice * 100,
          },
          quantity: credits,
        },
      ],
      metadata: {
        userId: session.user.id.toString(),
        credits: credits.toString(),
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
