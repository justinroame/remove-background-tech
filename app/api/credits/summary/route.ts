// app/api/credits/summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserCreditSummary } from "@/lib/credits";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userIdParam = searchParams.get("userId");

  if (!userIdParam) {
    return NextResponse.json(
      { error: "Missing userId query param" },
      { status: 400 }
    );
  }

  const userId = Number(userIdParam);
  if (Number.isNaN(userId)) {
    return NextResponse.json(
      { error: "Invalid userId" },
      { status: 400 }
    );
  }

  const summary = await getUserCreditSummary(userId);
  return NextResponse.json(summary);
}
