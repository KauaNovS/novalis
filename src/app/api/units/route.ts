import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const projectId = searchParams.get('projectId') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (search) {
      where.OR = [
        { unitNumber: { contains: search } },
        { project: { name: { contains: search } } },
        { tower: { name: { contains: search } } },
      ];
    }

    const total = await prisma.unit.count({ where });

    const units = await prisma.unit.findMany({
      where,
      include: {
        project: { select: { name: true } },
        tower: { select: { name: true } },
      },
      orderBy: [
        { project: { name: 'asc' } },
        { tower: { name: 'asc' } },
        { floor: 'asc' },
        { unitNumber: 'asc' },
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      data: units,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar unidades' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      projectId,
      towerId,
      unitNumber,
      floor,
      typology,
      bedrooms,
      area,
      parkingSpaces,
      status,
      currentPrice,
    } = body;

    if (!projectId || !towerId || !unitNumber || !floor || !area) {
      return NextResponse.json(
        { error: 'Projeto, torre, número da unidade, andar e área são obrigatórios' },
        { status: 400 }
      );
    }

    const pricePerSquareMeter = currentPrice ? currentPrice / area : null;

    const unit = await prisma.unit.create({
      data: {
        projectId,
        towerId,
        unitNumber,
        floor: parseInt(floor),
        typology: typology || null,
        bedrooms: bedrooms ? parseInt(bedrooms) : 0,
        area: parseFloat(area),
        parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : 0,
        status: status || 'AVAILABLE',
        currentPrice: currentPrice ? parseFloat(currentPrice) : null,
        pricePerSquareMeter,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar unidade' },
      { status: 500 }
    );
  }
}