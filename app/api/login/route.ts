export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { attachUserSessionCookie } from "@/lib/serverAuth";

export async function POST(req: Request) {
  const { email } = await req.json();
  const normalized = String(email || "").toLowerCase().trim();

  if (!normalized) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { error: "Account not found" },
      { status: 404 }
    );
  }

  const res = NextResponse.json({ success: true });
  return attachUserSessionCookie(res, {
    id: user.id,
    email: user.email,
  });
}
