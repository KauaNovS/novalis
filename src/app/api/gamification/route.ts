import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const profiles = await prisma.gamificationProfile.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { totalXp: 'desc' },
    });

    return NextResponse.json(profiles);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar ranking' },
      { status: 500 }
    );
  }
}