import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    const documents = await prisma.document.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { uploadedAt: 'desc' },
      include: {
        project: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(documents);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar documentos' }, { status: 500 });
  }
}