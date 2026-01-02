import { NextResponse } from "next/server";
import { db } from "@/app/db";
import { credits } from "@/app/db/schema";
import { eq, gt, sql, and } from "drizzle-orm";
import { getUser } from "@/app/lib/getUser";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const count = Number(body?.count ?? 1);

    if (!Number.isFinite(count) || count <= 0) {
      return NextResponse.json({ error: "INVALID_COUNT" }, { status: 400 });
    }

    /**
     * 🔒 HARD CREDIT ENFORCEMENT
     * Only decrement if credits.amount > 0
     * If no row is updated → NO_CREDITS
     */
    const updated = await db
      .update(credits)
      .set({
        amount: sql`${credits.amount} - ${count}`,
      })
      .where(
        and(
          eq(credits.userId, user.id),
          gt(credits.amount, 0)
        )
      )
      .returning({ amount: credits.amount });

    // 🚫 ZERO credits → block clean download
    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { error: "NO_CREDITS" },
        { status: 402 }
      );
    }

    // Extra safety clamp (never allow negative credits)
    if (updated[0].amount < 0) {
      await db
        .update(credits)
        .set({ amount: 0 })
        .where(eq(credits.userId, user.id));

      return NextResponse.json(
        { error: "NO_CREDITS" },
        { status: 402 }
      );
    }

    return NextResponse.json({
      ok: true,
      remaining: updated[0].amount,
    });
  } catch (err: any) {
    console.error("consume credits error:", err);
    return NextResponse.json(
      { error: err?.message || "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
