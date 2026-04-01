export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function POST(req: Request) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
