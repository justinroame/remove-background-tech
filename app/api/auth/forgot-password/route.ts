import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.email, email));
    
    // Always return OK even if user not found (security best practice)
    if (!user) {
      return NextResponse.json({ ok: true });
    }

    // Generate token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Store token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt: expires,
    });

    // Build reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

    // Send email
    const sendResult = await resend.emails.send({
      from: "Remove BG Tech <support@remove-background.tech>",
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click below to reset it:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      `,
    });

    // Handle sending errors
    if (sendResult.error) {
      console.error("Resend error:", sendResult.error);
      return NextResponse.json(
        { error: "Email failed to send." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("FORGOT PASSWORD ROUTE ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
