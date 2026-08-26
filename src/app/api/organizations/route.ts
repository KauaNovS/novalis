import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const orgs = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      type: true,
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(orgs);
}