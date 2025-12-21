// lib/user.ts
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string) {
  const normalized = email.toLowerCase().trim();

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create a user by email (email-only, no password, no email verification)
 * By default this creates with 0 credits (per your requirement).
 */
export async function createUserByEmail(email: string) {
  const normalized = email.toLowerCase().trim();

  const result = await db
    .insert(users)
    .values({
      email: normalized,
      // If your schema has these fields, great. If not, they will be ignored by drizzle types.
      // @ts-expect-error - optional columns may exist depending on your schema
      totalCredits: 0,
      // @ts-expect-error
      pro: false,
    })
    .returning();

  return result[0];
}
