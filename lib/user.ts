// lib/user.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Find a user by email
 */
export async function getUserByEmail(email: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a user by email (NO credits added here)
 */
export async function createUserByEmail(email: string) {
  const result = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
    })
    .returning();

  return result[0];
}
