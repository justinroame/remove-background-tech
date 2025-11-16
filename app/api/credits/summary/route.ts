import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { desc, eq, gt } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ total: 0 }); // guest = 0 credits
  }

  const now = new Date();

  const rows = await db
    .select()
    .from(credits)
    .where(eq(credits.userId, Number(session.user.id)))
    .where(gt(credits.expiresAt, now));

  let sum = 0;
  rows.forEach(r => sum += r.amount);

  return NextResponse.json({ total: sum });
}
