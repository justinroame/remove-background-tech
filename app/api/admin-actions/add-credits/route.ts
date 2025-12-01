// app/api/admin-actions/add-credits/route.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

const PASSWORD = "Poop4lifeyo!";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  const amountStr = formData.get("amount") as string;
  const pass = formData.get("pass") as string;

  if (pass !== PASSWORD || !email || !amountStr) {
    return new Response("Unauthorized", { status: 401 });
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount < 1) {
    return new Response("Invalid amount", { status: 400 });
  }

  // Update DB
  await db
    .update(users)
    .set({ totalCredits: sql`${users.totalCredits} + ${amount}` })
    .where(eq(users.email, email));

  // THIS IS THE WINNING LINE — sets the cookie your CreditsPill is waiting for
  const headers = new Headers();
  headers.append("Set-Cookie", `credits-updated=true; Path=/; Max-Age=5; SameSite=Lax`);

  return new Response(`Added ${amount} credits to ${email}`, {
    status: 200,
    headers,
  });
}

export const dynamic = "force-dynamic";