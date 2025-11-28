// app/api/admin-actions/add-credits/route.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

const PASSWORD = "Poop4lifeyo!"; // ← change to anything you want

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  | null;
  const amountStr = formData.get("amount") as string | null;
  const pass = formData.get("pass") as string | null;

  // Security + validation
  if (pass !== PASSWORD || !email || !amountStr) {
    return new Response("Unauthorized", { status: 401 });
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount < 1) {
    return new Response("Invalid amount", { status: 400 });
  }

  // THIS IS THE ONLY WORKING WAY TO INCREMENT IN DRIZZLE
  await db
    .update(users)
    .set({
      totalCredits: sql`${users.totalCredits} + ${amount}`,
    })
    .where(eq(users.email, email));

  return new Response(`Successfully added ${amount} credits to ${email}`, {
    status: 200,
  });
}