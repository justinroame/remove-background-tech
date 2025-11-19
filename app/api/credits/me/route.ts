// app/api/credits/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { getUserCreditSummary } from "@/lib/credits";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ authenticated: false, total: 0 });
  }

  const summary = await getUserCreditSummary(Number(session.user.id));

  return NextResponse.json({
    authenticated: true,
    total: summary.total,
    pro: summary.pro,
  });
}
