export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { consumeCredits, syncUserTotalCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

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

    // Deduct from FIFO credit batches (the real credit system)
    const result = await consumeCredits(userId, Number(count));

    // Recompute totals + update user.totalCredits
    const total = await syncUserTotalCredits(userId);

    return NextResponse.json({
      success: true,
      total
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
