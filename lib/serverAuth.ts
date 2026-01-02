// lib/serverAuth.ts
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import type { NextResponse } from "next/server";

const SESSION_COOKIE = "session_user_id";

/**
 * Primary user fetcher (used by most API routes)
 */
export async function getUserFromRequest(_req?: Request) {
  const cookieStore = cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;

  if (!userId) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, Number(userId)))
    .limit(1);

  return user ?? null;
}

/**
 * Alias for legacy routes expecting getServerUser
 */
export async function getServerUser(req?: Request) {
  return getUserFromRequest(req);
}

/**
 * Attach login session
 */
export function attachUserSessionCookie(
  res: NextResponse,
  userId: number
) {
  res.cookies.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
}

/**
 * Clear login session
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}
