import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id;
  if (!userId) return NextResponse.json({ total: 0 });

  const rows = await db
    .select()
    .from(credits)
    .where(
      and(eq(credits.userId, Number(userId)), gt(credits.expiresAt, new Date()))
    );

  const total = rows.reduce((acc, r) => acc + r.amount, 0);

  return NextResponse.json({ total });
}
