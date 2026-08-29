import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        developer: { select: { id: true, name: true } },
        builder: { select: { id: true, name: true } },
        towers: { include: { units: true } },
        units: true,
        documents: { orderBy: { uploadedAt: 'desc' } },
        images: { orderBy: { order: 'asc' } },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar projeto' },
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
      status,
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

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description: description || null,
        neighborhood: neighborhood || null,
        city,
        state,
        zipCode: zipCode || null,
        address: address || null,
        addressNumber: addressNumber || null,
        zone: zone || null,
        status: status || 'ACTIVE',
        projectStage: projectStage || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        totalUnits: totalUnits ? parseInt(totalUnits) : 0,
        totalTowers: totalTowers ? parseInt(totalTowers) : 0,
        developerId: developerId || null,
        builderId: builderId || null,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar projeto' },
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

    await prisma.priceHistory.deleteMany({ where: { unit: { projectId: id } } });
    await prisma.statusHistory.deleteMany({ where: { unit: { projectId: id } } });
    await prisma.propertyVisit.deleteMany({ where: { unit: { projectId: id } } });
    await prisma.deal.deleteMany({ where: { unit: { projectId: id } } });
    await prisma.document.deleteMany({ where: { projectId: id } });
    await prisma.unit.deleteMany({ where: { projectId: id } });
    await prisma.tower.deleteMany({ where: { projectId: id } });
    await prisma.projectImage.deleteMany({ where: { projectId: id } });

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir projeto' },
      { status: 500 }
    );
  }
}