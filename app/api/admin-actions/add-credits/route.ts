// app/api/admin-actions/add-credits/route.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

const PASSWORD = "Poop4lifeyo!"; // Change this in prod!

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = formData.get("email") as string;
  const amountStr = formData.get("amount") as string;
  const pass = formData.get("pass") as string;

  // Auth check
  if (pass !== PASSWORD || !email || !amountStr) {
    return new Response("Unauthorized", { status: 401 });
  }

  const amount = Number(amountStr);
  if (isNaN(amount) || amount < 1) {
    return new Response("Invalid amount", { status: 400 });
  }

  // Add credits to DB
  await db
    .update(users)
    .set({
      totalCredits: sql`${users.totalCredits} + ${amount}`,
    })
    .where(eq(users.email, email));

  // THIS LINE MAKES THE BLACK PILL UPDATE INSTANTLY
  // It calls your existing /api/revalidate-credits endpoint → sets cookie → triggers refresh
  await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || "https://remove-background.tech"}/api/revalidate-credits`,
    { method: "POST" }
  ).catch(() => {}); // fire-and-forget

  return new Response(`Added ${amount} credits to ${email}`, { status: 200 });
}