import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId é obrigatório' }, { status: 400 });
    }

    const towers = await prisma.tower.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(towers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar torres' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { projectId, name, floors } = body;

    if (!projectId || !name || !floors) {
      return NextResponse.json({ error: 'Projeto, nome e andares são obrigatórios' }, { status: 400 });
    }

    const tower = await prisma.tower.create({
      data: {
        projectId,
        name,
        floors: parseInt(floors),
        unitsCount: 0,
      },
    });

    return NextResponse.json(tower, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar torre' }, { status: 500 });
  }
}