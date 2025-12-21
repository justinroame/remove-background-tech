// lib/serverAuth.ts
import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "rb_session";

// 30 days
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

// Must be set in Vercel env vars
// Make it long/random (at least 32 chars)
const SESSION_SECRET = process.env.SESSION_SECRET || "";

type SessionPayload = {
  uid: string;
  email: string;
  iat: number;
  exp: number;
};

function b64urlEncode(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlDecode(input: string) {
  const pad = 4 - (input.length % 4 || 4);
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  return Buffer.from(base64, "base64").toString("utf8");
}

function sign(data: string) {
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET is missing");
  return b64urlEncode(crypto.createHmac("sha256", SESSION_SECRET).update(data).digest());
}

function createToken(payload: SessionPayload) {
  const json = JSON.stringify(payload);
  const body = b64urlEncode(json);
  const sig = sign(body);
  return `${body}.${sig}`;
}

function verifyToken(token: string): SessionPayload | null {
  try {
    if (!SESSION_SECRET) return null;

    const [body, sig] = token.split(".");
    if (!body || !sig) return null;

    const expected = sign(body);
    // constant-time compare
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(b64urlDecode(body)) as SessionPayload;
    if (!payload?.uid || !payload?.email || !payload?.exp) return null;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function setUserSessionCookie(user: { id: string | number; email: string }) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    uid: String(user.id),
    email: user.email.toLowerCase(),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const token = createToken(payload);

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getUserFromRequest() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const email = payload.email.toLowerCase();

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return null;

  return {
    id: String(user.id),
    email: user.email,
    totalCredits: (user as any).totalCredits ?? 0,
    pro: (user as any).pro ?? false,
  };
}
