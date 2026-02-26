import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
try {
const sessionId = req.query.session_id;
if (!sessionId) return res.status(400).json({ ok: false, error: "missing_session_id" });

const session = await stripe.checkout.sessions.retrieve(sessionId);

const paid =
session &&
(session.payment_status === "paid" || session.status === "complete");

// Optional: also verify it matches your product/price if you want stricter security
// const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });

if (!paid) return res.status(403).json({ ok: false, error: "not_paid" });

return res.status(200).json({
ok: true,
customer_email: session.customer_details?.email || null,
});
} catch (e) {
return res.status(500).json({ ok: false, error: "server_error" });
}
}
