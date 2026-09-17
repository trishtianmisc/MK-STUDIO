import type { Request, Response } from "express";
import { Resend } from "resend";
import { contactSchema } from "../../shared/schemas/contact.js";
import { env } from "../config/env.js";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendInquiry(req: Request, res: Response) {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    res.status(400).json({ error: message });
    return;
  }

  const { name, email, occasion, message } = parsed.data;

  if (!env.RESEND_API_KEY) {
    res.status(500).json({ error: "Email service not configured" });
    return;
  }

  const occasionLine = occasion && occasion !== "" ? `<p><strong>Occasion:</strong> ${occasion}</p>` : "";
  const messageLine = message ? `<p><strong>Message:</strong></p><p>${message.replace(/\n/g, "<br/>")}</p>` : "";

  const { error } = await resend.emails.send({
    from: "MK Studio <hello@mkstudiocollective.com>",
    to: env.CONTACT_EMAIL,
    replyTo: email,
    subject: `New Inquiry from ${name}`,
    html: `
      <h2>New Inquiry</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${occasionLine}
      ${messageLine}
    `,
  });

  if (error) {
    console.error("[Contact] Resend error:", JSON.stringify(error, null, 2));
    res.status(500).json({ error: error.message || "Failed to send inquiry" });
    return;
  }

  res.json({ ok: true });
}
