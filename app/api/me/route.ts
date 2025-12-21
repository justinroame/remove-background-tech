import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const uid = cookies().get("uid")?.value;
  if (!uid) return NextResponse.json({ user: null });

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(uid)));

  if (!user) return NextResponse.json({ user: null });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      totalCredits: user.totalCredits ?? 0,
      pro: user.pro ?? false,
    },
  });
}
