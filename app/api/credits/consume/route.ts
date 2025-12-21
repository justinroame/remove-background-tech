import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function POST(req: Request) {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { count } = await req.json();

  if ((user.totalCredits ?? 0) < count) {
    return NextResponse.json({ error: "NO_CREDITS" }, { status: 402 });
  }

  await db
    .update(users)
    .set({
      totalCredits: sql`${users.totalCredits} - ${count}`,
    })
    .where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
}
