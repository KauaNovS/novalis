import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'clients';
  let csv = '';

  try {
    if (type === 'clients') {
      const clients = await prisma.client.findMany();
      csv = 'Nome;Email;Telefone;Status\n';
      clients.forEach((c) => {
        csv += `${c.name};${c.email || ''};${c.phone || ''};${c.status}\n`;
      });
    } else if (type === 'deals') {
      const deals = await prisma.deal.findMany({ include: { client: true } });
      csv = 'Título;Cliente;Estágio;Valor\n';
      deals.forEach((d) => {
        csv += `${d.title};${d.client.name};${d.stage};${d.value || ''}\n`;
      });
    } else {
      return NextResponse.json({ error: 'Tipo de relatório inválido' }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}