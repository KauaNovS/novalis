import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// Esta rota não existia: o frontend (src/app/clients/[id]/page.tsx,
// handleUpdateInteraction / handleDeleteInteraction) já chamava
// PUT e DELETE em /api/clients/interactions/[id], mas só a criação
// (POST em /api/clients/[id]/interactions) estava implementada.
// Por isso editar ou excluir uma interação sempre falhava (404).

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();

    const allowedFields = [
      'type',
      'notes',
      'success',
      'level',
      'contactType',
      'answered',
      'blocked',
      'reason',
    ];

    const updateData: any = {};
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key];
      }
    }

    const interaction = await prisma.clientInteraction.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(interaction);
  } catch (error: any) {
    console.error('Erro ao atualizar interação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar interação' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await prisma.clientInteraction.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao excluir interação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir interação' },
      { status: 500 }
    );
  }
}
