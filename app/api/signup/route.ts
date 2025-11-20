// app/api/signup/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { addCredits } from "@/lib/credits";
import { eq } from "drizzle-orm";

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

    // 🔍 Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // 🆕 Create the new user
    const result = await db
      .insert(users)
      .values({
        email,
        password, // (you can hash later)
      })
      .returning({ id: users.id });

    const newUserId = result[0].id;

    // 🎁 Add 3 free signup credits
    await addCredits({
      userId: newUserId,
      amount: 3,
      source: "signup_bonus",
      daysValid: 30,
    });

    return NextResponse.json({ success: true, userId: newUserId });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
