export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const { count } = await req.json();

    if (!count || Number(count) <= 0) {
      return NextResponse.json({ error: "Missing or invalid credit count" }, { status: 400 });
    }

    // Load user
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if ((user.totalCredits ?? 0) < Number(count)) {
      return NextResponse.json({ error: "Not enough credits" }, { status: 402 });
    }

    // Deduct credits
    await db
      .update(users)
      .set({ totalCredits: user.totalCredits - Number(count) })
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      total: user.totalCredits - Number(count)
    });

  } catch (err: any) {
    console.error("CREDITS_CONSUME_ERROR:", err);
    return NextResponse.json(
      { error: err.message || "Failed to consume credits" },
      { status: 400 }
    );
  }
}
