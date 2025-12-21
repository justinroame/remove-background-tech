// app/api/me/route.ts
import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/serverAuth";

export async function GET() {
  const user = await getUserFromRequest();
  return NextResponse.json({ user });
}
