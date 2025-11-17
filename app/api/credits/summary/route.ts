import { NextResponse } from "next/server";
import { auth } from "@/auth";            // Auth.js v5 session helper
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET() {
  // Get the session from Auth.js (v5)
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ total: 0 });
  }

  // Fetch all NON-EXPIRED credits for this user
  const rows = await db
    .select()
    .from(credits)
    .where(
      and(
        eq(credits.userId, Number(userId)),
        gt(credits.expiresAt, new Date())
      )
    );

  const total = rows.reduce((acc, r) => acc + r.amount, 0);

  return NextResponse.json({ total });
}
