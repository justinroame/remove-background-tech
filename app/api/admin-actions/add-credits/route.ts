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

  // Update credits
  await db
    .update(users)
    .set({ totalCredits: sql`${users.totalCredits} + ${amount}` })
    .where(eq(users.email, email));

  // BULLETPROOF URL — works on Vercel, localhost, preview URLs, everywhere
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `https://${process.env.NEXT_PUBLIC_SITE_URL || "remove-background.tech"}`;

  // Trigger instant UI refresh in all open tabs
  await fetch(`${baseUrl}/api/revalidate-credits`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  }).catch(() => {}); // fire-and-forget — we don't care if it fails

  return new Response(`Added ${amount} credits to ${email}`, { status: 200 });
}

// Prevent any caching of this endpoint
export const dynamic = "force-dynamic";
export const revalidate = 0;