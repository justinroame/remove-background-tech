export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function GET() {
  const user = await getUserFromRequest(req);

  return NextResponse.json({ user });
}
