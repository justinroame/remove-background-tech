// app/api/credits/consume/route.ts
import { NextResponse } from "next/server";
import { consumeCredits, getUserCreditSummary } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const { userId, count } = await req.json();

    if (!userId || !count) {
      return NextResponse.json(
        { error: "Missing userId or count" },
        { status: 400 }
      );
    }

    await consumeCredits(Number(userId), Number(count));
    const summary = await getUserCreditSummary(Number(userId));

    return NextResponse.json({
      success: true,
      total: summary.total,
    });
  } catch (err: any) {
    console.error("CREDITS_CONSUME_ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to consume credits" },
      { status: 400 }
    );
  }
}
