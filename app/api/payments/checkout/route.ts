import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createCheckoutSession, STRIPE_PLANS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, billing } = await req.json();

    const priceMap: Record<string, string> = {
      'pro-monthly': STRIPE_PLANS.PRO_MONTHLY,
      'pro-yearly': STRIPE_PLANS.PRO_YEARLY,
      'business-monthly': STRIPE_PLANS.BUSINESS_MONTHLY,
      'business-yearly': STRIPE_PLANS.BUSINESS_YEARLY,
    };

    const billingType = billing === 'yearly' ? 'yearly' : 'monthly';
    const priceKey = `${plan}-${billingType}`;
    const priceId = priceMap[priceKey];

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const url = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email ?? '',
      priceId,
      successUrl: `${origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/billing?canceled=true`,
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
