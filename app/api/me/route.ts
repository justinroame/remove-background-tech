import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/serverAuth";

export async function GET() {
  const token = cookies().get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const payload = verifyToken(token);
    return NextResponse.json({
      user: {
        id: payload.uid,
        email: payload.email,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
