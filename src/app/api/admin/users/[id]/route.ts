import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getUserFromRequest(req);
  if (!currentUser || currentUser.role !== 'MASTER') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { role, permissions, teamId, userType, organizationId } = body;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      role,
      userType,
      permissions: JSON.stringify(permissions || []),
      teamId: teamId || null,
      organizationId: organizationId || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userType: true,
      permissions: true,
      teamId: true,
      organizationId: true,
      organization: {
        select: { id: true, name: true, type: true },
      },
    },
  });

  return NextResponse.json(updated);
}