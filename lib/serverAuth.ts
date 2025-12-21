import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Server-side auth helper.
 * Reads user email from secure cookie and loads user from DB.
 */
export async function getUserFromRequest() {
  const cookieStore = cookies();
  const email = cookieStore.get("user_email")?.value;

  if (!email) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()));

  return user ?? null;
}
