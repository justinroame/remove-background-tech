export const dynamic = "force-dynamic";

// app/api/credits/me/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { credits } from "@/db/schema";
import { eq } from "drizzle-orm";
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
      .limit(1);

    const row = rows[0];

    return NextResponse.json({
      credits: row?.amount ?? 0,
    });
  } catch (err) {
    console.error("Credits me error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
