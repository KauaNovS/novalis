import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { addXP } from '@/lib/gamification';
import { notifyAllUsers } from '@/lib/notifications';

export async function GET(req: NextRequest) {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { units: true, towers: true } },
        developer: { select: { id: true, name: true } },
        builder: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar projetos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      neighborhood,
      city,
      state,
      zipCode,
      address,
      addressNumber,
      zone,
      totalUnits,
      totalTowers,
      developerId,
      builderId,
      projectStage,
      deliveryDate,
    } = body;

    if (!name || !city || !state) {
      return NextResponse.json(
        { error: 'Nome, cidade e estado são obrigatórios' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    let organization = await prisma.organization.findFirst();
    if (!organization) {
      organization = await prisma.organization.create({
        data: { name: 'Organização Padrão' },
      });
    }

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description: description || null,
        neighborhood: neighborhood || null,
        city,
        state,
        zipCode: zipCode || null,
        address: address || null,
        addressNumber: addressNumber || null,
        zone: zone || null,
        status: 'ACTIVE',
        projectStage: projectStage || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        totalUnits: totalUnits ? parseInt(totalUnits) : 0,
        totalTowers: totalTowers ? parseInt(totalTowers) : 0,
        developerId: developerId || null,
        builderId: builderId || null,
        organizationId: organization.id,
      },
    });

    const numTowers = totalTowers ? parseInt(totalTowers) : 0;
    for (let i = 1; i <= numTowers; i++) {
      await prisma.tower.create({
        data: {
          projectId: project.id,
          name: `Torre ${i}`,
          floors: 1,
          unitsCount: 0,
        },
      });
    }

    const user = await getUserFromRequest(req);
    if (user) await addXP(user.id, 'create_project');
    await notifyAllUsers('Novo Projeto', `Projeto ${project.name} foi criado.`);

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar projeto' },
      { status: 500 }
    );
  }
}