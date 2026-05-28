import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    if (!user) {
      // Create user on first access
      const newUser = await prisma.user.create({
        data: {
          id: session.user.id,
          email: session.user.email ?? '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Creator',
          avatarUrl: session.user.user_metadata?.avatar_url,
        },
        include: { subscription: true },
      });
      return NextResponse.json({ user: newUser });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('GET /api/user error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const allowed = ['name', 'avatarUrl'];
    const updates = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowed.includes(key))
    );

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: updates,
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('PATCH /api/user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
