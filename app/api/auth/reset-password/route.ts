import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Missing token or password." },
        { status: 400 }
      );
    }

    // Basic password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Fetch token
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));

    if (!row) {
      return NextResponse.json(
        { error: "Invalid or already used token." },
        { status: 400 }
      );
    }

    // Check expiration
    if (row.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This reset link has expired." },
        { status: 400 }
      );
    }

    // Hash new password
    const hashed = await bcrypt.hash(password, 10);

    // Update user password
    await db
      .update(users)
      .set({ password: hashed })
      .where(eq(users.id, row.userId));

    // Delete the used token
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, row.id));

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("RESET-PASSWORD ERROR:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
