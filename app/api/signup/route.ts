import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // check existing
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) {
    return NextResponse.json({ error: "Email exists" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    email,
    password: hashed,
  });

  return NextResponse.json({ success: true });
}
