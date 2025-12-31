export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function GET() {
  const user = getUserFromRequest();
  return NextResponse.json({ user });
}
