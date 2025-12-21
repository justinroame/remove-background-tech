import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function POST(req: Request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { count } = await req.json();
  const creditsToConsume = Number(count || 1);

  // 🔑 CRITICAL FIX: ensure numeric ID for Drizzle
  const userId = Number(user.id);

  if (!Number.isFinite(userId)) {
    return NextResponse.json(
      { error: "INVALID_USER_ID" },
      { status: 400 }
    );
  }

  await db
    .update(users)
    .set({
      totalCredits: sql`${users.totalCredits} - ${creditsToConsume}`,
    })
    .where(eq(users.id, userId));

  return NextResponse.json({ success: true });
}
