// app/api/logout/route.ts
import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/serverAuth";

export async function POST() {
  clearSessionCookie();
  return NextResponse.json({ success: true });
}
