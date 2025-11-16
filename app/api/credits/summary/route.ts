import { NextResponse } from "next/server";
import { auth } from "@/auth";        // ✅ NEW AUTH
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET() {
  // ✅ Use new NextAuth App Router auth handler
  const session = await auth();

  // User ID safely extracted
  const userId = session?.user?.id;

  // If no session → return 0 credits (NOT 500)
  if (!userId) {
    return NextResponse.json({ total: 0 });
  }

  const now = new Date();

  // DB query
  const rows = await db
    .select()
    .from(credits)
    .where(
      and(
        eq(credits.userId, Number(userId)),
        gt(credits.expiresAt, now)
      )
    );

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return NextResponse.json({ total });
}
