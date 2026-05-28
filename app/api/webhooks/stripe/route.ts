import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Stripe webhook signature failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const stripeSubscription = await getStripe().subscriptions.retrieve(subscriptionId);

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              plan: 'PRO',
              status: 'ACTIVE',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            },
            update: {
              status: 'ACTIVE',
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { plan: 'PRO' },
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;

        if (subscriptionId) {
          const stripeSubscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const userId = stripeSubscription.metadata?.userId;

          if (userId) {
            await prisma.subscription.update({
              where: { userId },
              data: {
                status: 'ACTIVE',
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
              },
            });
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await prisma.subscription.update({
            where: { userId },
            data: { status: 'CANCELED', cancelAtPeriodEnd: false },
          });
          await prisma.user.update({
            where: { id: userId },
            data: { plan: 'FREE' },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : null;
        if (subscriptionId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          const userId = sub.metadata?.userId;
          if (userId) {
            await prisma.subscription.update({
              where: { userId },
              data: { status: 'PAST_DUE' },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
