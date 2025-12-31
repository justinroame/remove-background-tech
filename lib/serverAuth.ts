// lib/serverAuth.ts
import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "rb_session";

// 30 days
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

// Must be set in Vercel env vars (>= 32 chars random)
const SESSION_SECRET = process.env.SESSION_SECRET || "";

// Optional: set if you want cookie shared across subdomains (e.g. app.example.com + example.com)
// For your case you can leave unset.
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || "";

type SessionPayload = {
  uid: string;
  email: string;
  iat: number;
  exp: number;
};

function b64urlEncode(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlDecode(input: string) {
  // Proper base64 padding:
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  return Buffer.from(padded, "base64").toString("utf8");
}

function sign(data: string) {
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET is missing");
  return b64urlEncode(
    crypto.createHmac("sha256", SESSION_SECRET).update(data).digest()
  );
}

function createToken(payload: SessionPayload) {
  const body = b64urlEncode(JSON.stringify(payload));
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

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  };
}

export async function setUserSessionCookie(user: { id: string | number; email: string }) {
  const now = Math.floor(Date.now() / 1000);

  const payload: SessionPayload = {
    uid: String(user.id),
    email: user.email.toLowerCase().trim(),
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const token = createToken(payload);

  cookies().set({
    name: COOKIE_NAME,
    value: token,
    ...cookieOptions(),
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
    ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
  });
}

export async function getUserFromRequest() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const email = payload.email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return null;

  return {
    id: String(user.id),
    email: user.email,
    totalCredits: (user as any).totalCredits ?? 0,
    pro: (user as any).pro ?? false,
  };
}
