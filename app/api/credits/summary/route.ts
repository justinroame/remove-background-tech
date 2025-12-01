// app/api/credits/summary/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { and, eq, gt } from "drizzle-orm";

// THESE TWO LINES ARE CRITICAL — NEVER CACHE THIS ENDPOINT
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Not logged in → return 0 (safe)
  if (!userId) {
    return Response.json({ total: 0 });
  }

  try {
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
  } catch (error) {
    console.error("Credits summary error:", error);
    return Response.json({ total: 0 });
  }
}