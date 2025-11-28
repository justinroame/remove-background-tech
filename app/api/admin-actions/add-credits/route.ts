// app/api/admin-actions/add-credits/route.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

const PASSWORD = "Poop4lifeyo!";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  const amount = Number(formData.get("amount"));
  const pass = formData.get("pass") as string;

  if (pass !== PASSWORD || !email || isNaN(amount) || amount < 1) {
    return new Response("Unauthorized or invalid data", { status: 401 });
  }

  await db
    .update(users)
    .set({ totalCredits: () => `total_credits + ${amount}` })
    .where(eq(users.email, email));

  return new Response(`Added ${amount} credits to ${email}`, { status: 200 });
}