import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar construtora com projetos
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const builder = await prisma.builder.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { units: true } },
            developer: {
              select: { id: true, name: true, logo: true },
            },
          },
        },
      },
    });

    if (!builder) {
      return NextResponse.json(
        { error: 'Construtora não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(builder);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar construtora' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar construtora
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, legalName, document, description, website, logo, active } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const builder = await prisma.builder.update({
      where: { id },
      data: {
        name,
        legalName: legalName || null,
        document: document || null,
        description: description || null,
        website: website || null,
        logo: logo || null,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(builder);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar construtora' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir construtora
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.project.updateMany({
      where: { builderId: id },
      data: { builderId: null },
    });

    await prisma.builder.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir construtora' },
      { status: 500 }
    );
  }
}