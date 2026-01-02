import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerUser } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { count } = await req.json();
    const amount = Number(count) || 1;

    if (user.credits <= 0 || user.credits < amount) {
      return NextResponse.json(
        { error: "NO_CREDITS" },
        { status: 402 }
      );
    }

    await db
      .update(users)
      .set({ credits: user.credits - amount })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CREDITS_CONSUME_ERROR", err);
    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
