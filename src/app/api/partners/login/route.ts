import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email e senha são obrigatórios' }, { status: 400 });

    const company = await prisma.partnerCompany.findUnique({ where: { email } });
    if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 });
    if (!company.active) return NextResponse.json({ error: 'Empresa aguardando aprovação' }, { status: 403 });

    const valid = await bcrypt.compare(password, company.password);
    if (!valid) return NextResponse.json({ error: 'Senha incorreta' }, { status: 400 });

    const token = jwt.sign(
      { partnerId: company.id, email: company.email },
      process.env.JWT_SECRET || 'segredo-super-secreto-2026',
      { expiresIn: '8h' }
    );

    return NextResponse.json({ token, company: { id: company.id, name: company.name, email: company.email } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
