import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function findUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).limit(1);
}

export async function createUser(email: string, password: string | null) {
  const hashed = password ? await bcrypt.hash(password, 10) : null;

  const [user] = await db
    .insert(users)
    .values({
      email,
      password: hashed,
    })
    .returning();

  return user;
}
