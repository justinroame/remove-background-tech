// app/api/stripe/webhook/route.ts
// FINAL VERSION — DEPLOY THIS

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { addCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function readRawBody(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

function mapPriceToCredits(priceId: string): number | null {
  const map: Record<string, number> = {
    "price_1SSrc4C7SdJDqSQL9Zl6ZSPz": 5,
    "price_1ST76xC7SdJDqSQLwGjqxRmt": 15,
    "price_1ST7EIC7SdJDqSQLarYb4WgE": 50,
    "price_1ST7EIC7SdJDqSQLa34lWIMK": 100,
    "price_1ST7EIC7SdJDqSQLRLfW3Lbh": 500,
    "price_1ST7EIC7SdJDqSQL8RFOBHvs": 1000,

    // THIS IS YOUR $2.99 → 20 CREDITS PACK
    "price_1SczVNC7SdJDqSQLfhP2q6u8": 20,

    // Subscriptions
    "price_1ST85YC7SdJDqSQLl9BDMF9i": 50,
    "price_1ST85YC7SdJDqSQLmyewfZya": 250,
    "price_1ST85YC7SdJDqSQL2iAc6jQN": 500,
    "price_1ST85YC7SdJDqSQLYsOqCYBO": 1000,
    "price_1ST85YC7SdJDqSQLdSUGJhXJ": 2500,
    "price_1ST85YC7SdJDqSQLAKFbT9fN": 5000,
  };
  return map[priceId] ?? null;
}

export async function POST(req: Request) {
  const rawBody = await readRawBody(req.body as any);
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret);
  } catch (err: any) {
    console.error("Webhook error:", err.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.mode !== "payment" || session.payment_status !== "paid") {
      return NextResponse.json({ received: true });
    }

    const userId = session.metadata?.userId;
    const priceId = session.metadata?.priceId;

    if (!userId || !priceId) {
      return NextResponse.json({ received: true });
    }

    const credits = mapPriceToCredits(priceId);
    if (!credits) {
      console.log("Unknown price ID:", priceId);
      return NextResponse.json({ received: true });
    }

    await addCredits({
      userId: Number(userId),
      amount: credits,
      source: "stripe:payg",
      daysValid: 365, // or 30 if you prefer
    });

    console.log(`Added ${credits} credits to user ${userId}`);
  }

  return NextResponse.json({ received: true });
}