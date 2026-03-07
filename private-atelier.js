import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ ok: false, error: "Missing session_id" });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session && session.payment_status === "paid") {
      return res.status(200).json({ ok: true });
    }

    return res.status(403).json({ ok: false });

  } catch (error) {
    console.error("verify-session error:", error);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
}
