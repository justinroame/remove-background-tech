// app/api/credits/consume/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { consumeCredits, getUserCreditSummary } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userId = Number(session.user.id);

    const { count } = await req.json();

    if (!count || Number(count) <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid credit count" },
        { status: 400 }
      );
    }

    // Consume credits
    await consumeCredits(userId, Number(count));

    // Return fresh total
    const summary = await getUserCreditSummary(userId);

    return NextResponse.json({
      success: true,
      total: summary.total,
    });

  } catch (err: any) {
    console.error("CREDITS_CONSUME_ERROR:", err);

    if (String(err?.message).toLowerCase().includes("not enough")) {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to consume credits" },
      { status: 400 }
    );
  }
}
