import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getUserFromRequest } from "@/lib/serverAuth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  const user = await getUserFromRequest();

  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const { priceId, mode } = body as {
    priceId: string;
    mode: "payment" | "subscription";
  };

  if (!priceId || !mode) {
    return NextResponse.json(
      { error: "Missing priceId or mode" },
      { status: 400 }
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode,
    customer_email: user.email,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?cancel=1`,
  });

  return NextResponse.json({ url: session.url });
}
