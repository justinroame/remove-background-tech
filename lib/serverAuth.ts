import { cookies } from "next/headers";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Returns the currently logged-in user from the database,
 * or null if not authenticated.
 *
 * This is the ONLY source of truth for server-side auth.
 */
export async function getServerUser() {
  const cookieStore = cookies();

  // Adjust this cookie name ONLY if your app uses a different one
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return null;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!result || result.length === 0) {
    return null;
  }

  return result[0];
}
