// app/api/credits/consume/route.ts
import { NextResponse } from "next/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { credits } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth"; // uses your existing auth helper

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const count = Number(body?.count ?? 1);

    if (!Number.isFinite(count) || count <= 0) {
      return NextResponse.json({ error: "INVALID_COUNT" }, { status: 400 });
    }

    // ✅ HARD ENFORCEMENT:
    // Only decrement if amount > 0 (prevents negative credits + stops free clean downloads)
    const updated = await db
      .update(credits)
      .set({ amount: sql`${credits.amount} - ${count}` })
      .where(and(eq(credits.userId, user.id), gt(credits.amount, 0)))
      .returning({ amount: credits.amount });

    // If no row updated, user has 0 credits (or no credits row)
    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "NO_CREDITS" }, { status: 402 });
    }

    // Safety clamp (in case count > amount, you still want to block)
    // If you want strict: do a select first and require amount >= count.
    if (updated[0].amount < 0) {
      // rollback-style correction (optional safety)
      await db
        .update(credits)
        .set({ amount: 0 })
        .where(eq(credits.userId, user.id));

      return NextResponse.json({ error: "NO_CREDITS" }, { status: 402 });
    }

    return NextResponse.json({ ok: true, remaining: updated[0].amount });
  } catch (err: any) {
    console.error("consume credits error:", err);
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
