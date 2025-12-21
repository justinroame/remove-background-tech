// app/api/signup/route.ts
import { NextResponse } from "next/server";
import { findUserByEmail, createUserByEmail } from "@/lib/user";
import { setUserSessionCookie } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const normalized = String(email || "").toLowerCase().trim();
    if (!normalized || !normalized.includes("@")) {
      return NextResponse.json(
        { error: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    let user = await findUserByEmail(normalized);

    if (!user) {
      user = await createUserByEmail(normalized);
    }

    await setUserSessionCookie({
      id: (user as any).id,
      email: (user as any).email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json(
      { error: "SIGNUP_FAILED" },
      { status: 500 }
    );
  }
}
