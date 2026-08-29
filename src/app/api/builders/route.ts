import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const builders = await prisma.builder.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { projects: true } },
      },
    });
    return NextResponse.json(builders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, legalName, document, description, website, logo } = body;

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const builder = await prisma.builder.create({
      data: {
        name,
        legalName: legalName || null,
        document: document || null,
        description: description || null,
        website: website || null,
        logo: logo || null,
      },
    });

    return NextResponse.json(builder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}