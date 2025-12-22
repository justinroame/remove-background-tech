import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createUserByEmail } from "@/lib/user";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
    }

    const user = await createUserByEmail(email.toLowerCase().trim());

    // 🔑 THIS IS THE KEY FIX
    cookies().set("uid", String(user.id), {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Signup error:", err);

    // User already exists → fetch + set cookie
    if (
      err?.code === "SQLITE_CONSTRAINT" ||
      err?.message?.includes("unique")
    ) {
      const { email } = await req.json();
      const existing = await createUserByEmail(
        email.toLowerCase().trim()
      );

      cookies().set("uid", String(existing.id), {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
