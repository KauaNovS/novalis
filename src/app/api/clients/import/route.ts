import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { addXP } from '@/lib/gamification';
import { notifyAllUsers } from '@/lib/notifications';

interface ImportRow {
  name: string;
  phone?: string;
}

// POST - Importar clientes em lote via CSV (apenas nome + telefone)
export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const rows: ImportRow[] = Array.isArray(body.clients) ? body.clients : [];

    // Sanitiza: exige nome, remove linhas vazias
    const validRows = rows
      .map((r) => ({
        name: (r.name || '').toString().trim(),
        phone: (r.phone || '').toString().trim(),
      }))
      .filter((r) => r.name.length > 0);

    if (validRows.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum cliente válido para importar. Cada linha precisa de um nome.' },
        { status: 400 }
      );
    }

    // Todo cliente importado por CSV entra como Lead frio, sem contato,
    // com origem "Lista" — para não confundir com integração Rd Station.
    const data = validRows.map((r) => ({
      name: r.name,
      phone: r.phone || null,
      status: 'LEAD',
      stage: 'COLD',
      contactStatus: 'NAO_CONTACTADO',
      source: 'Lista',
      assignedTo: user.id,
    }));

    const result = await prisma.client.createMany({ data });

    // Uma única notificação resumindo a importação (evita spam por cliente).
    await notifyAllUsers(
      'Importação de clientes',
      `${result.count} clientes foram importados via lista por ${user.name}.`
    );

    // XP único pela ação de importar (não multiplicado por cliente, para não pesar no banco).
    await addXP(user.id, 'create_client');

    return NextResponse.json(
      { imported: result.count, skipped: rows.length - validRows.length },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Erro ao importar clientes:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao importar clientes' },
      { status: 500 }
    );
  }
}