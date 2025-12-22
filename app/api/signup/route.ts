import { NextResponse } from "next/server";
import { createUserByEmail } from "@/lib/user";
import { setUserSessionCookie } from "@/lib/serverAuth";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { error: "Email required" },
      { status: 400 }
    );
  }

  try {
    const user = await createUserByEmail(email.toLowerCase().trim());

    // email-only login: set session cookie
    await setUserSessionCookie({
  id: user.id,
  email: user.email,
});


    return NextResponse.json({ success: true });
  } catch (err: any) {
    // unique constraint = user already exists → still success
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
