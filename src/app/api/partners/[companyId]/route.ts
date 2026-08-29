import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const company = await prisma.partnerCompany.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      email: true,
      document: true,
      projects: {
        where: { status: 'APPROVED' },
        select: { id: true, name: true, description: true, status: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
  return NextResponse.json(company);
}
