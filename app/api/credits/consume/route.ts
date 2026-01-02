import { NextResponse } from "next/server";
import { db } from "../../../db";
import { users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { getUser } from "../../../lib/getUser";

export async function POST(req: Request) {
  try {
    const user = await getUser();

    // 🔒 HARD BLOCK — must be logged in
    if (!user) {
      return NextResponse.json(
        { error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    // 🔥 HARD BLOCK — no credits
    if (user.credits <= 0) {
      return NextResponse.json(
        { error: "NO_CREDITS" },
        { status: 402 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const count = Math.max(1, Number(body.count || 1));

    // 🔥 Atomic credit deduction
    await db
      .update(users)
      .set({
        credits: user.credits - count,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[CREDITS_CONSUME_ERROR]", err);
    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
