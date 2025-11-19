export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { consumeCredits, getUserCreditSummary } from "@/lib/credits";

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

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const count = Number(body?.count);

    if (!count || count <= 0) {
      return NextResponse.json(
        { error: "Missing or invalid credit count" },
        { status: 400 }
      );
    }

    // Deduct FIFO credit batches
    await consumeCredits(userId, count);

    // Return new totals
    const summary = await getUserCreditSummary(userId);

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
        { status: 402 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Failed to consume credits" },
      { status: 400 }
    );
  }
}
