// app/api/credits/me/route.ts
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserCreditSummary } from "@/lib/credits";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const userId = Number(session.user.id);
  const summary = await getUserCreditSummary(userId);

  return NextResponse.json(summary);
}
