import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { name: true } },
        unitsOfInterest: {
          include: {
            unit: {
              include: {
                project: { select: { name: true } },
              },
            },
          },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar cliente' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    // Sanitizar os dados de entrada — apenas campos permitidos
    const allowedFields = [
      'name',
      'email',
      'phone',
      'birthDate',
      'notes',
      'status',
      'stage',
      'contactStatus',
      'source',
      'profile',
      'interestType',
      'investorProfile',
      'investmentValue',
      'region',
      'topology',
      'typology',
      'areaInterest',
      'score',
    ];

    const updateData: any = {};
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = body[key];
      }
    }

    // birthDate é DateTime? no schema — string vazia quebra o Prisma
    // ("" não é uma data válida). Normaliza: vazio/ausente -> null,
    // string preenchida -> Date de verdade.
    if ('birthDate' in updateData) {
      updateData.birthDate = updateData.birthDate ? new Date(updateData.birthDate) : null;
    }

    // investmentValue e areaInterest são Float? — mesma armadilha se
    // vier string vazia do formulário.
    if ('investmentValue' in updateData) {
      updateData.investmentValue =
        updateData.investmentValue === '' || updateData.investmentValue === null
          ? null
          : Number(updateData.investmentValue);
    }
    if ('areaInterest' in updateData) {
      updateData.areaInterest =
        updateData.areaInterest === '' || updateData.areaInterest === null
          ? null
          : Number(updateData.areaInterest);
    }

    const client = await prisma.client.update({
      where: { id },
      data: updateData,
      include: {
        assignedUser: { select: { name: true } },
        unitsOfInterest: {
          include: {
            unit: {
              include: {
                project: { select: { name: true } },
              },
            },
          },
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar cliente' },
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

    // Deletar todas as interações relacionadas
    await prisma.clientInteraction.deleteMany({
      where: { clientId: id },
    });

    // Deletar todas as unidades de interesse
    await prisma.unitOfInterest.deleteMany({
      where: { clientId: id },
    });

    // Deletar todas as visitas à propriedade
    await prisma.propertyVisit.deleteMany({
      where: { clientId: id },
    });

    // Deletar todas as atividades
    await prisma.activity.deleteMany({
      where: { clientId: id },
    });

    // Deletar todos os deals
    await prisma.deal.deleteMany({
      where: { clientId: id },
    });

    // Deletar o cliente
    const client = await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Cliente deletado com sucesso', client });
  } catch (error: any) {
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao deletar cliente' },
      { status: 500 }
    );
  }
}