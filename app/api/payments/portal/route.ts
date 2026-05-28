import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { createBillingPortalSession } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: 'No billing account found' }, { status: 404 });
    }

    const origin = req.headers.get('origin') || 'http://localhost:3000';
    const url = await createBillingPortalSession(
      subscription.stripeCustomerId,
      `${origin}/billing`
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json({ error: 'Failed to open billing portal' }, { status: 500 });
  }
}
