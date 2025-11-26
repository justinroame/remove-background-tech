import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ⭐ IMPORTANT: Must be a verified domain sender
    const sendResult = await resend.emails.send({
      from: "Contact Form <contact@remove-background.tech>",
      to: "justinroame@gmail.com", // <-- CHANGE TO YOUR REAL DESTINATION
      subject: "New Contact Form Message",
      html: `
        <h2>New Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `
    });

    if (sendResult.error) {
      console.error("Resend Error:", sendResult.error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CONTACT ERROR:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
