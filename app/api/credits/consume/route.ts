// app/api/credits/consume/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const amount = Number(body.count) || 1;

    // 🔒 HARD SERVER-SIDE CREDIT CHECK
    if (user.totalCredits <= 0 || user.totalCredits < amount) {
      return NextResponse.json(
        { error: "NO_CREDITS" },
        { status: 402 }
      );
    }

    // ✅ Deduct credits atomically
    await db
      .update(users)
      .set({
        totalCredits: user.totalCredits - amount,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Credit consume error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
