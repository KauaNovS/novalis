import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { addXP } from '@/lib/gamification';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        client: { select: { name: true } },
        assignedUser: { select: { name: true } },
        unit: {
          select: {
            unitNumber: true,
            project: { select: { name: true } },
          },
        },
        activities: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!deal) {
      return NextResponse.json({ error: 'Negócio não encontrado' }, { status: 404 });
    }

    return NextResponse.json(deal);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar negócio' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { stage } = body;

    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const deal = await prisma.deal.update({
      where: { id },
      data: body,
    });

    if (user && stage === 'CLOSED_WON') {
      await addXP(user.id, 'close_deal');
    }

    return NextResponse.json(deal);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar negócio' },
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

    await prisma.deal.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir negócio' },
      { status: 500 }
    );
  }
}
