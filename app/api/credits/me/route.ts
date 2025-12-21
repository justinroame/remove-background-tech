import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function GET() {
  const user = await getUserFromRequest();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      email: user.email,
      totalCredits: user.totalCredits ?? 0,
      pro: user.pro ?? false,
    },
  });
}
