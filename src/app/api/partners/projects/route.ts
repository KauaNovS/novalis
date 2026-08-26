import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getPartnerId(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo-super-secreto-2026') as any;
    return decoded.partnerId;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const partnerId = getPartnerId(req);
  const projects = await prisma.partnerProject.findMany({
    where: partnerId ? { companyId: partnerId } : {},
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const partnerId = getPartnerId(req);
  const { companyId, name, description } = await req.json();
  if (!partnerId || partnerId !== companyId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }
  if (!name) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  const project = await prisma.partnerProject.create({
    data: { companyId, name, description },
  });
  return NextResponse.json(project, { status: 201 });
}
