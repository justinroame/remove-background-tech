import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    await resend.emails.send({
      from: "Contact Form <noreply@yourdomain.com>",
      to: "your-email@gmail.com",
      subject: "New Contact Form Message",
      html: `
        <h2>New Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
