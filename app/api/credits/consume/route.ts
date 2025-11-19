import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { consumeCredits, getUserCreditSummary } from "@/lib/credits";
//
export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { count } = await req.json();

    if (!count || Number(count) <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid credit count" },
        { status: 400 }
      );
    }

    // Consume credits for this user only
    await consumeCredits(Number(userId), Number(count));

    // Return updated totals
    const summary = await getUserCreditSummary(Number(userId));

    return NextResponse.json({
      success: true,
      total: summary.total,
    });
  } catch (err: any) {
    console.error("CREDITS_CONSUME_ERROR:", err);

    const message = String(err?.message || "").toLowerCase();

    if (message.includes("not enough")) {
      return NextResponse.json(
        { error: "Not enough credits" },
        { status: 402 } // 402 = Payment Required
      );
    }

    return NextResponse.json(
      { error: err?.message || "Failed to consume credits" },
      { status: 400 }
    );
  }
}
