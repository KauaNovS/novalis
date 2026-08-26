import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        tower: { select: { id: true, name: true } },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unidade não encontrada' }, { status: 404 });
    }

    return NextResponse.json(unit);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
      unitNumber,
      floor,
      typology,
      topology,
      bedrooms,
      area,
      parkingSpaces,
      status,
      currentPrice,
      pricePerSquareMeter,
      floorplanUrl,
    } = body;

    if (!unitNumber || !floor || !area) {
      return NextResponse.json(
        { error: 'Número da unidade, andar e área são obrigatórios' },
        { status: 400 }
      );
    }

    const unit = await prisma.unit.update({
      where: { id },
      data: {
        unitNumber,
        floor: parseInt(floor),
        typology: typology || null,
        topology: topology || null,
        bedrooms: bedrooms ? parseInt(bedrooms) : 0,
        area: parseFloat(area),
        parkingSpaces: parkingSpaces ? parseInt(parkingSpaces) : 0,
        status: status || 'AVAILABLE',
        currentPrice: currentPrice ? parseFloat(currentPrice) : null,
        pricePerSquareMeter: pricePerSquareMeter ? parseFloat(pricePerSquareMeter) : null,
        floorplanUrl: floorplanUrl || null,
      },
    });

    return NextResponse.json(unit);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar unidade' },
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

    await prisma.priceHistory.deleteMany({ where: { unitId: id } });
    await prisma.statusHistory.deleteMany({ where: { unitId: id } });
    await prisma.propertyVisit.deleteMany({ where: { unitId: id } });
    await prisma.deal.deleteMany({ where: { unitId: id } });

    await prisma.unit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir unidade' },
      { status: 500 }
    );
  }
}