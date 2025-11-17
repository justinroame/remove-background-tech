// /app/api/signup/route.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const existing = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    });

    if (existing)
      return NextResponse.json({ error: "User exists" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      email: email.toLowerCase().trim(),
      password: hashed,
      totalCredits: 50,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.log("SIGNUP ERROR", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
