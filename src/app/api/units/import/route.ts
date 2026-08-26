import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, towerName, towerId, units } = body;

    if (!projectId && !towerId) {
      return NextResponse.json(
        { error: 'Informe projectId ou towerId' },
        { status: 400 }
      );
    }

    if (!Array.isArray(units) || units.length === 0) {
      return NextResponse.json(
        { error: 'Lista de unidades vazia ou inválida' },
        { status: 400 }
      );
    }

    // Resolver a torre
    let towerIdFinal = towerId;
    if (!towerIdFinal) {
      if (!towerName) {
        return NextResponse.json(
          { error: 'Informe towerName quando towerId não for passado' },
          { status: 400 }
        );
      }

      let tower = await prisma.tower.findFirst({
        where: { projectId, name: towerName },
      });

      if (!tower) {
        tower = await prisma.tower.create({
          data: {
            projectId,
            name: towerName,
            floors: 1,
            unitsCount: 0,
          },
        });
      }
      towerIdFinal = tower.id;
    }

    const createData = units.map((unit: any) => ({
      projectId: projectId || undefined,
      towerId: towerIdFinal,
      unitNumber: unit.unitNumber,
      floor: parseInt(unit.floor) || 1,
      typology: unit.typology || null,
      topology: unit.topology || null,
      bedrooms: parseInt(unit.bedrooms) || 0,
      area: parseFloat(unit.area) || 0,
      parkingSpaces: parseInt(unit.parkingSpaces) || 0,
      status: unit.status || 'AVAILABLE',
      currentPrice: unit.currentPrice ? parseFloat(unit.currentPrice) : null,
      pricePerSquareMeter:
        unit.currentPrice && unit.area
          ? parseFloat(unit.currentPrice) / parseFloat(unit.area)
          : null,
    }));

    const result = await prisma.unit.createMany({
      data: createData,
    });

    return NextResponse.json({
      success: true,
      imported: result.count,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao importar unidades' },
      { status: 500 }
    );
  }
}