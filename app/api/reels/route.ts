import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET() {
  const reels = await prisma.reel.findMany({ take: 10, orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ reels });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, title, projectId } = body;

  const reel = await prisma.reel.create({
    data: {
      projectId,
      userId,
      title,
      status: 'QUEUED',
      script: '',
      videoUrl: '',
    },
  });

  return NextResponse.json({ reel });
}
