import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const [
      totalProjects,
      totalUnits,
      availableUnits,
      soldUnits,
      totalClients,
      totalDeals,
      totalPipelineValue,
      unitsByStatus,
      recentProjects,
      recentClients,
      recentDeals,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.unit.count(),
      prisma.unit.count({ where: { status: 'AVAILABLE' } }),
      prisma.unit.count({ where: { status: 'SOLD' } }),
      prisma.client.count(),
      prisma.deal.count(),
      prisma.deal.aggregate({
        _sum: { value: true },
        where: { stage: { not: 'CLOSED_LOST' } },
      }),
      prisma.unit.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.client.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.deal.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { client: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({
      totalProjects,
      totalUnits,
      availableUnits,
      soldUnits,
      totalClients,
      totalDeals,
      totalPipelineValue: totalPipelineValue._sum.value || 0,
      unitsByStatus,
      recentProjects,
      recentClients,
      recentDeals,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar dashboard' },
      { status: 500 }
    );
  }
}