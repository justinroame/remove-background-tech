export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, credits } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  // Fix ALL users missing credit batches
  const rows = await db.select().from(users);

  for (const u of rows) {
    // Skip if user already has credit rows
    const existing = await db
      .select()
      .from(credits)
      .where(eq(credits.userId, u.id));

    if (existing.length > 0) continue;

    // Insert batch = user.totalCredits
    if (u.totalCredits > 0) {
      await db.insert(credits).values({
        userId: u.id,
        amount: u.totalCredits,
        source: "migration-fix",
        expiresAt: new Date(Date.now() + 30 * 86400 * 1000),
      });
    }
  }

  return NextResponse.json({ fixed: true });
}
