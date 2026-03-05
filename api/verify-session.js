const Stripe = require("stripe");

module.exports = async (req, res) => {
  try {
    const session_id = req.query.session_id;

    if (!session_id) {
      return res.status(400).json({ ok: false, error: "missing_session_id" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ ok: false, error: "missing_STRIPE_SECRET_KEY" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const paid =
      session &&
      (session.payment_status === "paid" || session.status === "complete");

    return res.status(200).json({
      ok: !!paid,
      payment_status: session.payment_status,
      status: session.status
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: "verify_failed",
      message: e?.message || String(e)
    });
  }
};
