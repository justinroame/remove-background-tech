export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { attachUserSessionCookie } from "@/lib/serverAuth";

export async function POST(req: Request) {
  const { email } = await req.json();
  const normalized = String(email || "").toLowerCase().trim();

  if (!normalized) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    const [user] = await db
      .insert(users)
      .values({ email: normalized })
      .returning();

    const res = NextResponse.json({ success: true });
    return attachUserSessionCookie(res, {
      id: user.id,
      email: user.email,
    });
  } catch {
    return NextResponse.json(
      { error: "Account already exists" },
      { status: 409 }
    );
  }
}
