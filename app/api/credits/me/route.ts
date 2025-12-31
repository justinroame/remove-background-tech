export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";
import { db } from "@/lib/db";
import { credits } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const user = getUserFromRequest();
  if (!user) {
    return NextResponse.json({ credits: 0 });
  }

  const [row] = await db
    .select()
    .from(credits)
    .where(eq(credits.userId, user.id))
    .limit(1);

  return NextResponse.json({ credits: row?.amount ?? 0 });
}
