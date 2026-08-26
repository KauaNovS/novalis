import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET - Lista todas as equipes com líder e membros
export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const teams = await prisma.team.findMany({
    include: {
      leader: { select: { id: true, name: true, email: true } },
      members: { select: { id: true, name: true, email: true, userType: true } },
    },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(teams);
}

// POST - Cria uma nova equipe
export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || user.role !== 'MASTER') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { name, leaderId } = await req.json();
  if (!name || !leaderId) {
    return NextResponse.json({ error: 'Nome e líder são obrigatórios' }, { status: 400 });
  }

  const team = await prisma.team.create({
    data: {
      name,
      leaderId,
    },
    include: {
      leader: { select: { id: true, name: true, email: true } },
      members: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(team, { status: 201 });
}