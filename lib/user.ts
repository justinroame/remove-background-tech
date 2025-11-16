import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function findUserByEmail(email: string) {
  return db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
