import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Não revelar se o email existe ou não
      return NextResponse.json({ success: true });
    }

    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'segredo-super-secreto-2026',
      { expiresIn: '1h' }
    );

    // Em produção, enviar por email. Aqui retornamos o link para desenvolvimento.
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    console.log('Reset URL:', resetUrl);

    return NextResponse.json({ success: true, resetUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}