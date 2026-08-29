import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, floors } = body;

    if (!name || !floors) {
      return NextResponse.json(
        { error: 'Nome e andares são obrigatórios' },
        { status: 400 }
      );
    }

    const tower = await prisma.tower.update({
      where: { id },
      data: {
        name,
        floors: parseInt(floors),
      },
    });

    return NextResponse.json(tower);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar torre' },
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

    // Excluir unidades vinculadas
    await prisma.unit.deleteMany({ where: { towerId: id } });

    await prisma.tower.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir torre' },
      { status: 500 }
    );
  }
}
