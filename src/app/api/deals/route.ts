import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { addXP } from '@/lib/gamification';
import { notifyAllUsers } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const where = clientId ? { clientId } : {};

    const deals = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true } },
        assignedUser: { select: { name: true } },
        unit: {
          select: {
            unitNumber: true,
            project: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json(deals);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar negócios' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, clientId, stage, value } = body;

    if (!title || !clientId) {
      return NextResponse.json(
        { error: 'Título e cliente são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        stage: stage || 'LEAD',
        value: value ? parseFloat(value) : null,
        clientId,
        assignedTo: user.id,
      },
    });

    await addXP(user.id, 'create_deal');
    await notifyAllUsers('Novo Negócio', `Negócio "${deal.title}" foi criado.`);

    return NextResponse.json(deal, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar negócio' },
      { status: 500 }
    );
  }
}