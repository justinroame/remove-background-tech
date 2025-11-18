import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, trimmedEmail));

    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const [newUser] = await db
      .insert(users)
      .values({
        email: trimmedEmail,
        password: hashed,
        totalCredits: 3, // free credits
        pro: false,
      })
      .returning();

    return NextResponse.json({
      success: true,
      user: {
        id: String(newUser.id),
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
