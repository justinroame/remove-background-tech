// app/api/credits/summary/route.ts
export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

export async function GET() {
  const session = await auth();
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

  const total = rows.reduce((a, r) => a + r.amount, 0);

  return Response.json({ total });
}
