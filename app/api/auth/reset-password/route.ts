import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.token, token));

  if (!row) return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  if (row.expiresAt < new Date())
    return NextResponse.json({ error: "Token expired" }, { status: 400 });

  const hashed = await bcrypt.hash(password, 10);

  await db
    .update(users)
    .set({ password: hashed })
    .where(eq(users.id, row.userId));

  await db
    .delete(passwordResetTokens)
    .where(eq(passwordResetTokens.id, row.id));

  return NextResponse.json({ success: true });
}
