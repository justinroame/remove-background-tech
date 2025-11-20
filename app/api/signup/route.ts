// app/api/signup/route.ts — ADD 3 FREE SIGNUP CREDITS
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, credits } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Create user
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await db
      .insert(users)
      .values({
        email,
        password: hashed,
        totalCredits: 3, // UI convenience, but credits table is source of truth
      })
      .returning();

    const userId = newUser[0].id;

    // Create 3-credit signup batch
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await db.insert(credits).values({
      userId,
      amount: 3,
      source: "SIGNUP",
      expiresAt,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("SIGNUP_ERROR:", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
