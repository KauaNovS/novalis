import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q) {
    return NextResponse.json({ projects: [], units: [], clients: [], documents: [] });
  }

  try {
    const [projects, units, clients, documents] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { city: { contains: q } },
            { neighborhood: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.unit.findMany({
        where: {
          OR: [
            { unitNumber: { contains: q } },
            { typology: { contains: q } },
          ],
        },
        include: { project: { select: { name: true } } },
        take: 5,
      }),
      prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.document.findMany({
        where: { name: { contains: q } },
        take: 5,
      }),
    ]);

    return NextResponse.json({ projects, units, clients, documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}