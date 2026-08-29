import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, document } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }
    const existing = await prisma.partnerCompany.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 });

    const hashed = await bcrypt.hash(password, 10);
    const company = await prisma.partnerCompany.create({
      data: { name, email, password: hashed, document, active: false },
    });
    return NextResponse.json({ id: company.id, name: company.name }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
