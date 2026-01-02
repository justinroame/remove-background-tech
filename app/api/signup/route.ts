// app/api/signup/route.ts
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { attachUserSessionCookie } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "EMAIL_EXISTS" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({
        email,
        password: hashed,
        totalCredits: 3,
      })
      .returning();

    const res = NextResponse.json({ success: true });

    // ✅ FIX: pass ONLY user.id
    return attachUserSessionCookie(res, user.id);
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
