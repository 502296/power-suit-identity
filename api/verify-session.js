const Stripe = require("stripe");

module.exports = async (req, res) => {
  try {
    console.log("verify-session called");
    console.log("query:", req.query);

    const session_id = req.query.session_id;

    if (!session_id) {
      console.log("missing session_id");
      return res.status(400).json({
        ok: false,
        error: "missing_session_id"
      });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    console.log("has STRIPE_SECRET_KEY:", !!secretKey);

    if (!secretKey) {
      return res.status(500).json({
        ok: false,
        error: "missing_STRIPE_SECRET_KEY"
      });
    }

    const stripe = new Stripe(secretKey);

    console.log("retrieving session:", session_id);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    console.log("session retrieved:", {
      id: session?.id,
      payment_status: session?.payment_status,
      status: session?.status
    });

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
    console.error("FULL verify-session error:");
    console.error("message:", e?.message);
    console.error("type:", e?.type);
    console.error("code:", e?.code);
    console.error("raw:", e);

    return res.status(500).json({
      ok: false,
      error: "verify_failed",
      message: e?.message || String(e),
      type: e?.type || null,
      code: e?.code || null
    });
  }
};
