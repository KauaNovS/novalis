import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo-super-secreto-2026') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo-super-secreto-2026') as any;
    const { name, email, phone, avatar, currentPassword, newPassword } = await req.json();

    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone) data.phone = phone;
    if (avatar) data.avatar = avatar;

    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 });

      data.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: decoded.userId },
      data,
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao atualizar' }, { status: 500 });
  }
}