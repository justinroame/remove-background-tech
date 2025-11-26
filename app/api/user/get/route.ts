import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db"; // or however you read users

export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await getUserByEmail(email);

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}
