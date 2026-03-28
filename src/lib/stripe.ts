import Stripe from "stripe";

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
  });
}

export const stripe = getStripeClient();
