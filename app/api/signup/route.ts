import { NextResponse } from "next/server";
import { createUserByEmail } from "@/lib/user";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email required" },
      { status: 400 }
    );
  }

  try {
    // Create user if they don't exist.
    // If they already exist, this should NO-OP via unique email constraint.
    await createUserByEmail(email.toLowerCase().trim());

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // If email already exists, treat as success
    if (err?.code === "SQLITE_CONSTRAINT" || err?.message?.includes("unique")) {
      return NextResponse.json({ success: true });
    }

    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
