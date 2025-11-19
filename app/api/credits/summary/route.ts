// app/api/credits/summary/route.ts
export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);

  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ total: 0 }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(credits)
    .where(
      and(
        eq(credits.userId, Number(userId)),
        gt(credits.expiresAt, new Date())
      )
    );

  const total = rows.reduce((sum, r) => sum + r.amount, 0);

  return Response.json({ total });
}
