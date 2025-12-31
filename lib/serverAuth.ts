import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "rb_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET not set");
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function createToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as any;
}

/**
 * Attach a login session cookie to a response
 */
export function attachUserSessionCookie(
  res: NextResponse,
  user: { id: string | number; email: string }
) {
  const now = Math.floor(Date.now() / 1000);

  const token = createToken({
    uid: String(user.id),
    email: user.email.toLowerCase().trim(),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  });

  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    ...cookieOptions(),
  });

  return res;
}

/**
 * Clear login session
 */
export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return res;
}

/**
 * Read the authenticated user from cookies (App Router safe)
 * Used by credits, stripe, remove-background, etc.
 */
export function getUserFromRequest() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    return {
      id: payload.uid,
      email: payload.email,
    };
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
