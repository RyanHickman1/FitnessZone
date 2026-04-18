import { Resend } from "resend";

export default async function handler(req, res) {
  try {
    // AUTH
    const auth = req.headers.authorization || "";
    if (auth !== `Bearer ${process.env.API_SECRET}`) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    // METHOD
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "method_not_allowed" });
    }

    // BODY
    let body = req.body || {};

    // If Retell sends JSON as a string, parse it
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const caller_name = body.caller_name || "Unknown";
    const caller_phone = body.caller_phone || "No phone provided";
    const message = body.message || "No message provided";
    const intent = body.intent || "general";
    const urgency = body.urgency || "medium";

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "missing_resend_key"
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Francesca <send@francescaassistant.com>",
      to: "cvaryan22701@gmail.com",
      subject: `📞 New Call – ${intent}`,
      html: `
        <h2>Francesca AI Receptionist</h2>
        <p><strong>Caller:</strong> ${caller_name}</p>
        <p><strong>Phone:</strong> ${caller_phone}</p>
        <p><strong>Intent:</strong> ${intent}</p>
        <p><strong>Urgency:</strong> ${urgency}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    return res.status(200).json({
      ok: true,
      sent: true,
      received: body
    });

  } catch (e) {
    console.error("send-owner-email error:", e);
    return res.status(500).json({
      ok: false,
      error: "server_error",
      details: e.message
    });
  }
}
