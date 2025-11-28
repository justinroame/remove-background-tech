// app/api/admin-actions/add-credits/route.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

const PASSWORD = "Poop4lifeyo!"; // Change this!

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string | null;
  const amountStr = formData.get("amount") as string | null;
  const pass = formData.get("pass") as string | null;

  if (pass !== PASSWORD || !email || !amountStr) {
    return new Response("Unauthorized", { status: 401 });
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount < 1) {
    return new Response("Invalid amount", { status: 400 });
  }

  // This is the ONLY correct way in Drizzle ORM
  await db
    .update(users)
    .set({
      totalCredits: sql`${users.totalCredits} + ${amount}`,
    })
    .where(eq(users.email, email));

  return new Response(`Added ${amount} credits to ${email}`, { status: 200 });
}