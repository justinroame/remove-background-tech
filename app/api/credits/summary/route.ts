// app/api/credits/summary/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { credits } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function GET(req: Request) {
  try {
    // ✅ MUST await
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const rows = await db
      .select()
      .from(credits)
      .where(eq(credits.userId, user.id))
      .orderBy(desc(credits.createdAt));

    const total = rows.reduce((sum, row) => sum + row.amount, 0);

    return NextResponse.json({
      totalCredits: total,
      entries: rows,
    });
  } catch (err) {
    console.error("Credits summary error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
