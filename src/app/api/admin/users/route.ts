import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'MASTER') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const withoutTeam = searchParams.get('withoutTeam') === 'true';

  const users = await prisma.user.findMany({
    where: withoutTeam ? { teamId: null } : {},
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userType: true,
      permissions: true,
      teamId: true,
      organizationId: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(users);
}