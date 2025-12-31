export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST() {
  const user = getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db
    .update(credits)
    .set({
      amount: sql`${credits.amount} - 1`,
    })
    .where(eq(credits.userId, user.id));

  return NextResponse.json({ success: true });
}
