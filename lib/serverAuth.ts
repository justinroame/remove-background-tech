import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

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

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: COOKIE_NAME,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export { COOKIE_NAME };
