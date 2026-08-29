import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealId = searchParams.get('dealId');
    const clientId = searchParams.get('clientId');

    const where: any = {};
    if (dealId) where.dealId = dealId;
    if (clientId) where.clientId = clientId;

    const activities = await prisma.activity.findMany({
      where,
      include: {
        client: { select: { name: true } },
        deal: { select: { title: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar atividades' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, subject, description, dueDate, clientId, dealId, assignedTo, priority } = body;

    if (!type || !subject || !assignedTo) {
      return NextResponse.json({ error: 'Tipo, assunto e responsável são obrigatórios' }, { status: 400 });
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        clientId: clientId || null,
        dealId: dealId || null,
        assignedTo,
        createdBy: assignedTo,
        priority: priority || 'MEDIUM',
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar atividade' }, { status: 500 });
  }
}
