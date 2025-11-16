import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);

  // Fix TypeScript by casting user object
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ total: 0 });
  }

  const now = new Date();

  // FIX: Combine multiple conditions using `and()`
  const rows = await db
    .select()
    .from(credits)
    .where(
      and(
        eq(credits.userId, Number(userId)),
        gt(credits.expiresAt, now)
      )
    );

  let sum = 0;
  rows.forEach((r) => (sum += r.amount));

  return NextResponse.json({ total: sum });
}
