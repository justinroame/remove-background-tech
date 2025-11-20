// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { addCredits } from "@/lib/credits";
import { sql } from "drizzle-orm";

// ✅ Next.js 14 / App Router compatible settings
export const dynamic = "force-dynamic";
export const preferredRegion = "iad1";
export const maxDuration = 300;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Utility: read raw body for Stripe signature verification
async function readRawBody(readable: ReadableStream<Uint8Array>) {
  const reader = readable.getReader();
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

// PRICE → CREDITS MAP (Option A)
function mapPriceToCredits(priceId: string): number | null {
  const map: Record<string, number> = {
    // ===== PAYG =====
    "price_1SSrc4C7SdJDqSQL9Zl6ZSPz": 5,
    "price_1ST76xC7SdJDqSQLwGjqxRmt": 15,
    "price_1ST7EIC7SdJDqSQLarYb4WgE": 50,
    "price_1ST7EIC7SdJDqSQLa34lWIMK": 100,
    "price_1ST7EIC7SdJDqSQLRLfW3Lbh": 500,
    "price_1ST7EIC7SdJDqSQL8RFOBHvs": 1000,

    // ===== SUBSCRIPTIONS =====
    "price_1ST85YC7SdJDqSQLl9BDMF9i": 50,
    "price_1ST85YC7SdJDqSQLmyewfZya": 250,
    "price_1ST85YC7SdJDqSQL2iAc6jQN": 500,
    "price_1ST85YC7SdJDqSQLYsOqCYBO": 1000,
    "price_1ST85YC7SdJDqSQLdSUGJhXJ": 2500,
    "price_1ST85YC7SdJDqSQLAKFbT9fN": 5000,
  };

  return map[priceId] ?? null;
}

// ------------------------------------------------------------
// MAIN WEBHOOK HANDLER
// ------------------------------------------------------------
export async function POST(req: Request) {
  const rawBody = await readRawBody(req.body as any);
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, webhookSecret);
  } catch (err: any) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // ============================================================
  // PAYG — checkout.session.completed (one-time purchases)
  // ============================================================
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const priceId = session.metadata?.priceId;
    const mode = session.metadata?.creditMode; // PAYG or SUBSCRIPTION

    if (!userId || !priceId || mode !== "PAYG") {
      return NextResponse.json({ received: true });
    }

    const creditAmount = mapPriceToCredits(priceId);
    if (!creditAmount) return NextResponse.json({ received: true });

    await addCredits({
      userId: Number(userId),
      amount: creditAmount,
      source: "stripe:payg",
      daysValid: 30,
    });

    console.log(`💳 PAYG credits added: ${creditAmount} credits for user ${userId}`);
  }

  // ============================================================
  // SUBSCRIPTION — invoice.payment_succeeded
  // ============================================================
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    const userId = invoice.metadata?.userId;
    const line = invoice.lines.data?.[0];
    const priceId = line?.price?.id;
    const periodEnd = line?.period?.end;

    if (!userId || !priceId || !periodEnd) {
      return NextResponse.json({ received: true });
    }

    const creditAmount = mapPriceToCredits(priceId);
    if (!creditAmount) return NextResponse.json({ received: true });

    // 1. Expire all previous subscription credits immediately
    await db
      .update(credits)
      .set({ amount: 0, expiresAt: new Date() })
      .where(sql`${credits.userId} = ${Number(userId)} AND ${credits.source} LIKE 'stripe:subscription%'`);

    // 2. Add new subscription credits
    const expires = new Date(periodEnd * 1000);

    await addCredits({
      userId: Number(userId),
      amount: creditAmount,
      source: "stripe:subscription",
      daysValid: Math.ceil((expires.getTime() - Date.now()) / 86400000),
    });

    console.log(`🔄 Subscription renewed → ${creditAmount} credits added for user ${userId}`);
  }

  // ============================================================
  // SUBSCRIPTION CANCELED — customer.subscription.deleted
  // ============================================================
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;

    if (!userId) return NextResponse.json({ received: true });

    // Subscription canceled → expire remaining credits in 30 days
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    await db
      .update(credits)
      .set({ expiresAt: expires })
      .where(sql`${credits.userId} = ${Number(userId)} AND ${credits.source} LIKE 'stripe:subscription%'`);

    console.log(`⚠️ Subscription canceled → credits expire in 30 days for user ${userId}`);
  }

  return NextResponse.json({ received: true });
}
