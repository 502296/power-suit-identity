const Stripe = require("stripe");

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        error: "method_not_allowed",
      });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return res.status(500).json({
        error: "missing_STRIPE_SECRET_KEY",
      });
    }

    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Power Suit Identity — Private Atelier Access",
              description: "Private style selection + personalized report",
            },
            unit_amount: 4500, // $15.00
          },
          quantity: 1,
        },
      ],

      success_url:
        "https://power-suit-identity.vercel.app/private-atelier.html?session_id={CHECKOUT_SESSION_ID}",

      cancel_url:
        "https://power-suit-identity.vercel.app/index.html",
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (e) {
    console.error("create-checkout-session error:", e);

    return res.status(500).json({
      error: "session_create_failed",
      message: e?.message || String(e),
    });
  }
};
