import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// POST - Adiciona um membro à equipe (atualiza teamId do usuário)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getUserFromRequest(req);
  if (!currentUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id: teamId } = await params;
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
  }

  // Verifica se o usuário atual tem permissão (admin ou líder da equipe)
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return NextResponse.json({ error: 'Equipe não encontrada' }, { status: 404 });
  }

  if (currentUser.role !== 'MASTER' && team.leaderId !== currentUser.id) {
    return NextResponse.json({ error: 'Sem permissão para gerenciar esta equipe' }, { status: 403 });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { teamId },
    select: { id: true, name: true, email: true, teamId: true },
  });

  return NextResponse.json(updatedUser);
}

// DELETE - Remove um membro da equipe (define teamId = null)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getUserFromRequest(req);
  if (!currentUser) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id: teamId } = await params;
  const { userId } = await req.json();

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    return NextResponse.json({ error: 'Equipe não encontrada' }, { status: 404 });
  }

  if (currentUser.role !== 'MASTER' && team.leaderId !== currentUser.id) {
    return NextResponse.json({ error: 'Sem permissão para gerenciar esta equipe' }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { teamId: null },
  });

  return NextResponse.json({ message: 'Membro removido' });
}