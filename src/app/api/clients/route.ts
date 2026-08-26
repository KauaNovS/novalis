import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { addXP } from '@/lib/gamification';
import { notifyAllUsers } from '@/lib/notifications';

// GET - Listar clientes com filtros avançados
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const stage = searchParams.get('stage') || undefined;
    const contactStatus = searchParams.get('contactStatus') || undefined;
    const profile = searchParams.get('profile') || undefined;
    const interestType = searchParams.get('interestType') || undefined;
    const investorProfile = searchParams.get('investorProfile') || undefined;
    const source = searchParams.get('source') || undefined;
    const date = searchParams.get('date') || undefined;

    const where: any = {};

    // Filtro de busca por nome, email ou telefone
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro de status (LEAD | PROSPECT | CLIENT | LOST)
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      if (statusArray.length === 1) {
        where.status = statusArray[0];
      } else {
        where.status = { in: statusArray };
      }
    }

    // Filtro de temperatura/stage (COLD | WARM | HOT)
    if (stage) {
      const stageArray = stage.split(',').map(s => s.trim());
      if (stageArray.length === 1) {
        where.stage = stageArray[0];
      } else {
        where.stage = { in: stageArray };
      }
    }

    // Filtro de status de contato
    if (contactStatus) {
      const contactStatusArray = contactStatus.split(',').map(s => s.trim());
      if (contactStatusArray.length === 1) {
        where.contactStatus = contactStatusArray[0];
      } else {
        where.contactStatus = { in: contactStatusArray };
      }
    }

    // Filtro de perfil DISC
    if (profile) {
      const profileArray = profile.split(',').map(p => p.trim());
      if (profileArray.length === 1) {
        where.profile = profileArray[0];
      } else {
        where.profile = { in: profileArray };
      }
    }

    // Filtro de tipo de interesse
    if (interestType) {
      const interestArray = interestType.split(',').map(i => i.trim());
      if (interestArray.length === 1) {
        where.interestType = interestArray[0];
      } else {
        where.interestType = { in: interestArray };
      }
    }

    // Filtro de perfil de investidor
    if (investorProfile) {
      const investorArray = investorProfile.split(',').map(i => i.trim());
      if (investorArray.length === 1) {
        where.investorProfile = investorArray[0];
      } else {
        where.investorProfile = { in: investorArray };
      }
    }

    // Filtro de fonte
    if (source) {
      const sourceArray = source.split(',').map(s => s.trim());
      if (sourceArray.length === 1) {
        where.source = sourceArray[0];
      } else {
        where.source = { in: sourceArray };
      }
    }

    // Filtro de data de entrada
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error: any) {
    console.error('Erro ao listar clientes:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar clientes' },
      { status: 500 }
    );
  }
}

// POST - Criar novo cliente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      notes,
      status,
      stage,
      contactStatus,
      source,
      profile,
      interestType,
      investorProfile,
      followUpInDays,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const user = await getUserFromRequest(req);

    const client = await prisma.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
        status: status || 'LEAD',
        stage: stage || 'COLD',
        contactStatus: contactStatus || 'NAO_CONTACTADO',
        source: source || null,
        profile: profile || null,
        interestType: interestType || null,
        investorProfile: investorProfile || null,
        assignedTo: user?.id || null,
      },
      include: {
        assignedUser: {
          select: { name: true },
        },
      },
    });

    // Criar activity de follow-up se especificado
    if (followUpInDays) {
      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + parseInt(followUpInDays));
      const assignedUser =
        user ||
        (await prisma.user.findFirst({
          orderBy: { createdAt: 'asc' },
        }));

      if (assignedUser) {
        await prisma.activity.create({
          data: {
            type: 'FOLLOW_UP',
            subject: `Follow-up com ${client.name}`,
            description: 'Acompanhar cliente após contato inicial',
            clientId: client.id,
            dueDate: followUpDate,
            assignedTo: assignedUser.id,
            createdBy: assignedUser.id,
            priority: 'MEDIUM',
          },
        });
      }
    }

    if (user) {
      await addXP(user.id, 'create_client');
    }

    await notifyAllUsers(
      'Novo Cliente',
      `Cliente ${client.name} foi cadastrado.`
    );

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}