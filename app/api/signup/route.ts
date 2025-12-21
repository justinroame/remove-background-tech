import { NextResponse } from "next/server";
import { findUserByEmail, createUserByEmail } from "@/lib/user";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // find or create user
    let user = await findUserByEmail(email);
    if (!user) {
      user = await createUserByEmail(email);
    }

    // set signed cookie (simple identity)
    cookies().set("uid", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
