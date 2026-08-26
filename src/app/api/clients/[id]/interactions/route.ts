import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { type, contactMode, answered, success, blocked, reason, notes } = body;

    const interaction = await prisma.clientInteraction.create({
      data: {
        clientId: id,
        type,
        contactType: contactMode || null,
        notes: notes || null,
        success: success || null,
        level: answered ? 'COMPLETED' : 'PENDING',
        answered: answered ?? null,
        blocked: blocked ?? null,
        reason: reason || null,
        createdBy: user.id,
      },
    });

    return NextResponse.json(interaction, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar interação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar interação' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const interactions = await prisma.clientInteraction.findMany({
      where: { clientId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(interactions);
  } catch (error: any) {
    console.error('Erro ao buscar interações:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar interações' },
      { status: 500 }
    );
  }
}