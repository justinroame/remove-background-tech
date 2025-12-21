import { NextResponse } from "next/server";
import { getUserByEmail, createUserByEmail } from "@/lib/user";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await getUserByEmail(normalizedEmail);

    if (!user) {
      user = await createUserByEmail(normalizedEmail);
    }

    // 🚫 NO credits here. Signup is identity-only.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
