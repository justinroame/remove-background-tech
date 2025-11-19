import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserCreditSummary } from "@/lib/credits";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const summary = await getUserCreditSummary(Number(session.user.id));

  return NextResponse.json(summary);
}
