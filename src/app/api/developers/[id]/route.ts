import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const developer = await prisma.developer.findUnique({
      where: { id },
      include: {
        projects: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { units: true } },
            builder: {
              select: { id: true, name: true, logo: true },
            },
          },
        },
      },
    });

    if (!developer) {
      return NextResponse.json(
        { error: 'Incorporadora não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(developer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar incorporadora' },
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
    const { name, legalName, document, description, website, logo, active } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const developer = await prisma.developer.update({
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

    return NextResponse.json(developer);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao atualizar incorporadora' },
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

    await prisma.project.updateMany({
      where: { developerId: id },
      data: { developerId: null },
    });

    await prisma.developer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao excluir incorporadora' },
      { status: 500 }
    );
  }
}