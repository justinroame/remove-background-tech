import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  const { email } = await req.json();

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    return NextResponse.json({ ok: true }); // intentional
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  await db.insert(passwordResetTokens).values({
    userId: user.id,
    token,
    expiresAt: expires,
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Remove BG Tech <support@remove-background.tech>",
    to: email,
    subject: "Reset your password",
    html: `
      <p>Click below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    `,
  });

  return NextResponse.json({ ok: true });
}
