import { NextResponse } from "next/server";
import Stripe from "stripe";
import { addCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const userId = session.metadata?.userId;
    const amount = Number(session.metadata?.credits); // e.g., "25"

    if (!userId || !amount) {
      return NextResponse.json({ error: "Invalid session metadata" }, { status: 400 });
    }

    await addCredits({
      userId: parseInt(userId),
      amount,
      source: "PAYG",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Stripe error" }, { status: 500 });
  }
}
