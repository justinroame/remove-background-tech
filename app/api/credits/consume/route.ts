import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerUser } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: "NOT_AUTHENTICATED" },
        { status: 401 }
      );
    }

    const { count } = await req.json();
    const cost = Number(count || 1);

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    if (!dbUser || dbUser.credits < cost) {
      return NextResponse.json(
        { error: "NO_CREDITS" },
        { status: 402 }
      );
    }

    await db
      .update(users)
      .set({ credits: dbUser.credits - cost })
      .where(eq(users.id, user.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("CREDIT CONSUME ERROR:", err);
    return NextResponse.json(
      { error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
