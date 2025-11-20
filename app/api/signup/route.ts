// app/api/signup/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { addCredits } from "@/lib/credits";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 🔍 Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // 🔐 HASH THE PASSWORD (this was missing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Create the user
    const result = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        password: hashedPassword,
      })
      .returning({ id: users.id });

    const newUserId = result[0].id;

    // 🎁 Give free credits
    await addCredits({
      userId: newUserId,
      amount: 3,
      source: "signup_bonus",
      daysValid: 30,
    });

    return NextResponse.json({ success: true, userId: newUserId });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
