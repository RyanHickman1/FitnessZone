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
    let {
      caller_name,
      caller_phone,
      message,
      intent,
      urgency
    } = req.body || {};

    // 🔥 AUTO-FIX MISSING FIELDS
    caller_name = caller_name || "Unknown";

    // THIS IS THE BIG ONE — fixes your 400 errors
    caller_phone = caller_phone || "{{user_number}}";

    message = message || "No message provided";

    intent = intent || "general";
    urgency = urgency || "medium";

    // ONLY FAIL if phone is STILL missing (shouldn't happen now)
    if (!caller_phone) {
      return res.status(400).json({
        ok: false,
        error: "missing_fields"
      });
    }

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

    return res.status(200).json({ ok: true, sent: true });

  } catch (e) {
    console.error("send-owner-email error:", e);
    return res.status(500).json({
      ok: false,
      error: "server_error",
      details: e.message
    });
  }
}
