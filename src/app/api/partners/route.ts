import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const partners = await prisma.partnerCompany.findMany({
      include: {
        projects: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(partners);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao carregar parceiros' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, document } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 });
    }

    const exists = await prisma.partnerCompany.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const partner = await prisma.partnerCompany.create({
      data: {
        name,
        email,
        password: hashed,
        document: document || null,
        active: false,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar parceiro' }, { status: 500 });
  }
}