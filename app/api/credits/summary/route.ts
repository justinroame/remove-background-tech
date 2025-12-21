import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function GET() {
  const user = await getUserFromRequest();
  if (!user) {
    return NextResponse.json({ total: 0 });
  }

  return NextResponse.json({
    total: user.totalCredits ?? 0,
  });
}
