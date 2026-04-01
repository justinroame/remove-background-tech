import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { attachUserSessionCookie } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "MISSING_EMAIL" }, { status: 400 });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "ACCOUNT_NOT_FOUND" }, { status: 404 });
    }

    const res = NextResponse.json({ success: true });
    return attachUserSessionCookie(res, user.id);
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
