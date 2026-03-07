const Stripe = require("stripe");

module.exports = async (req, res) => {
  try {
    const session_id = req.query.session_id;

    if (!session_id) {
      return res.status(400).json({
        ok: false,
        error: "missing_session_id"
      });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        ok: false,
        error: "missing_STRIPE_SECRET_KEY"
      });
    }

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    const paid =
      session &&
      (session.payment_status === "paid" || session.status === "complete");

    return res.status(200).json({
      ok: Boolean(paid),
      payment_status: session?.payment_status || null,
      status: session?.status || null,
      session_id: session?.id || null
    });
  } catch (e) {
    console.error("verify-session error:", e);

    return res.status(500).json({
      ok: false,
      error: "verify_failed",
      message: e?.message || String(e)
    });
  }
};
