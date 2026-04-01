import { NextResponse } from "next/server";
import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/serverAuth";
import { db } from "@/db";
import { credits } from "@/db/schema";
import { addCredits, syncUserTotalCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const sessionId = String(body?.sessionId || "").trim();
    if (!sessionId) return NextResponse.json({ error: "MISSING_SESSION_ID" }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metaUserId = Number(session.metadata?.userId || 0);
    const purchasedCredits = Number(session.metadata?.credits || 0);
    const source = `STRIPE_SESSION:${session.id}`;

    if (metaUserId !== user.id) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    if (session.payment_status !== "paid") return NextResponse.json({ error: "PAYMENT_NOT_COMPLETE" }, { status: 409 });

    const [existing] = await db
      .select({ id: credits.id })
      .from(credits)
      .where(and(eq(credits.userId, user.id), eq(credits.source, source)))
      .limit(1);

    if (!existing) {
      if (!Number.isFinite(purchasedCredits) || purchasedCredits <= 0) {
        return NextResponse.json({ error: "INVALID_CREDIT_METADATA" }, { status: 400 });
      }

      await addCredits({
        userId: user.id,
        amount: purchasedCredits,
        source,
        daysValid: 365,
      });
    }

    const total = await syncUserTotalCredits(user.id);
    return NextResponse.json({ success: true, total, alreadyApplied: Boolean(existing) });
  } catch (err) {
    console.error("Finalize checkout error:", err);
    return NextResponse.json({ error: "FINALIZE_FAILED" }, { status: 500 });
  }
}
