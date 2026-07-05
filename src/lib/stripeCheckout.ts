import { auth } from './firebase';
import type { PricingPlan } from '../components/landing/LandingPricing';

function priceIdForPlan(plan: PricingPlan): string {
  const priceId =
    plan === 'monthly'
      ? import.meta.env.VITE_STRIPE_PRICE_MONTHLY
      : import.meta.env.VITE_STRIPE_PRICE_ANNUAL;

  if (!priceId) {
    throw new Error(
      plan === 'monthly'
        ? 'VITE_STRIPE_PRICE_MONTHLY is not configured.'
        : 'VITE_STRIPE_PRICE_ANNUAL is not configured.'
    );
  }

  return priceId;
}

export async function createStripeCheckoutSession(plan: PricingPlan): Promise<string> {
  const user = auth.currentUser;
  if (!user?.email) {
    throw new Error('You must be signed in with a valid email to subscribe.');
  }

  const priceId = priceIdForPlan(plan);

  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      uid: user.uid,
      email: user.email,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to start checkout.');
  }

  if (!data.url) {
    throw new Error('Checkout session did not return a redirect URL.');
  }

  return data.url;
}
