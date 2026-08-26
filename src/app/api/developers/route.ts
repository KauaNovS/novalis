import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar incorporadoras
export async function GET(req: NextRequest) {
  try {
    const developers = await prisma.developer.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { projects: true } } },
    });
    return NextResponse.json(developers);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar incorporadoras' },
      { status: 500 }
    );
  }
}

// POST - Criar nova incorporadora
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      legalName,
      document,
      creci,
      description,
      website,
      logo,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }

    const developer = await prisma.developer.create({
      data: {
        name,
        legalName: legalName || null,
        document: document || null,
        creci: creci || null,
        description: description || null,
        website: website || null,
        logo: logo || null,
      },
    });

    return NextResponse.json(developer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao criar incorporadora' },
      { status: 500 }
    );
  }
}