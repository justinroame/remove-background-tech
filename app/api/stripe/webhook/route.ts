// app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { addCredits, syncUserTotalCredits } from "@/lib/credits";
import { eq, sql } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const config = {
  api: { bodyParser: false },
};

async function readBuffer(readable: ReadableStream<Uint8Array>) {
  const chunks: any[] = [];
  const reader = readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks);
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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

    // ===== SUBS =====
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
  const body = await readBuffer(req.body as any);
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // ----------------------------------------------------------
  // PAYG PURCHASE
  // ----------------------------------------------------------
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const priceId = session.metadata?.priceId;
    const creditMode = session.metadata?.creditMode;

    if (!userId || !priceId || creditMode !== "PAYG") {
      return NextResponse.json({ ok: true });
    }

    const credits = mapPriceToCredits(priceId);
    if (!credits) return NextResponse.json({ ok: true });

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    await addCredits({
      userId: Number(userId),
      amount: credits,
      source: "stripe:payg",
      daysValid: 30,
    });

    console.log("💳 Added PAYG credits:", credits);
  }

  // ----------------------------------------------------------
  // SUBSCRIPTION RENEWAL
  // ----------------------------------------------------------
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    const userId = invoice.metadata?.userId;
    const line = invoice.lines.data[0];
    const priceId = line?.price?.id;

    if (!userId || !priceId) return NextResponse.json({ ok: true });

    const credits = mapPriceToCredits(priceId);
    if (!credits) return NextResponse.json({ ok: true });

    // Expiration = Stripe cycle end
    const periodEnd = line.period?.end;
    const expires = new Date(periodEnd * 1000);

    // 1. Expire old subscription credits
    await db
      .update(credits)
      .set({ amount: 0, expiresAt: new Date() })
      .where(
        sql`${credits.userId} = ${Number(userId)} AND ${credits.source} LIKE 'stripe:subscription%'`
      );

    // 2. Add new subscription credits
    await addCredits({
      userId: Number(userId),
      amount: credits,
      source: "stripe:subscription",
      daysValid: Math.ceil((expires.getTime() - Date.now()) / 86400000),
    });

    console.log("🔄 Added subscription credits:", credits);
  }

  // ----------------------------------------------------------
  // SUBSCRIPTION CANCELED
  // ----------------------------------------------------------
  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata?.userId;

    if (!userId) return NextResponse.json({ ok: true });

    // Expire these credits in 30 days
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);

    await db
      .update(credits)
      .set({ expiresAt: expires })
      .where(
        sql`${credits.userId} = ${Number(userId)} AND ${credits.source} LIKE 'stripe:subscription%'`
      );

    console.log("⚠️ Subscription canceled → credits set to expire in 30 days");
  }

  return NextResponse.json({ received: true });
}
