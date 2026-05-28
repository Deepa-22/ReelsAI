import Stripe from 'stripe';

let _stripe: Stripe | null = null;
export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('The STRIPE_SECRET_KEY environment variable is missing or empty; provide it to use Stripe features.');
    _stripe = new Stripe(key, { apiVersion: '2025-02-24.acacia', typescript: true });
  }
  return _stripe;
}

export const STRIPE_PLANS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  BUSINESS_MONTHLY: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || 'price_business_monthly',
  BUSINESS_YEARLY: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || 'price_business_yearly',
} as const;

export async function createCheckoutSession(params: {
  userId: string;
  email: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const session = await getStripe().checkout.sessions.create({
    customer_email: params.email,
    client_reference_id: params.userId,
    line_items: [{ price: params.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: { userId: params.userId },
    subscription_data: { metadata: { userId: params.userId } },
    allow_promotion_codes: true,
  });
  return session.url!;
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}
