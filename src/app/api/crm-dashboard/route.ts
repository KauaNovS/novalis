import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dedupeByClientDay(rows: { clientId: string; createdAt: Date }[]) {
  const seen = new Set<string>();
  const result: { clientId: string; day: string }[] = [];
  for (const r of rows) {
    const day = dayKey(r.createdAt);
    const key = `${r.clientId}|${day}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push({ clientId: r.clientId, day });
    }
  }
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [
      totalClients,
      byStatusRaw,
      byStageRaw,
      byContactStatusRaw,
      interactions,
      recentInteractions,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.groupBy({ by: ['status'], _count: true }),
      prisma.client.groupBy({ by: ['stage'], _count: true }),
      prisma.client.groupBy({ by: ['contactStatus'], _count: true }),
      prisma.clientInteraction.findMany({
        where: { createdAt: { gte: ninetyDaysAgo } },
        select: {
          clientId: true,
          type: true,
          contactType: true,
          createdAt: true,
        },
      }),
      prisma.clientInteraction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { client: { select: { id: true, name: true } } },
      }),
    ]);

    const byStatus = byStatusRaw.map((r) => ({ key: r.status, count: r._count }));
    const byStage = byStageRaw.map((r) => ({ key: r.stage, count: r._count }));
    const byContactStatus = byContactStatusRaw.map((r) => ({
      key: r.contactStatus || 'NAO_CONTACTADO',
      count: r._count,
    }));

    const naoContactado = byContactStatus.find((c) => c.key === 'NAO_CONTACTADO')?.count || 0;
    const totalLeads = byStatus.find((s) => s.key === 'LEAD')?.count || 0;
    const totalContacted = totalClients - naoContactado;
    const meetingsScheduled = byContactStatus.find((c) => c.key === 'REUNIAO_AGENDADA')?.count || 0;

    const callRows = interactions.filter((i) => i.type === 'CALL' || i.type === 'WHATSAPP_CALL');
    const msgRows = interactions.filter((i) => i.type === 'WHATSAPP_MSG');
    const fupRows = interactions.filter((i) => i.contactType === 'FUP');

    const dedupedCalls = dedupeByClientDay(callRows);
    const dedupedMsgs = dedupeByClientDay(msgRows);
    const dedupedFups = dedupeByClientDay(fupRows);

    const todayKey = dayKey(new Date());
    const callsToday = dedupedCalls.filter((d) => d.day === todayKey).length;
    const messagesToday = dedupedMsgs.filter((d) => d.day === todayKey).length;
    const followupsToday = dedupedFups.filter((d) => d.day === todayKey).length;

    const clientsInFollowUp = new Set(fupRows.map((f) => f.clientId)).size;

    // Como não há campos de resultado, definimos 0 para esses totais
    const successCount = 0;
    const failureCount = 0;
    const blockedCount = 0;

    const trend: { date: string; calls: number; messages: number; followups: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      trend.push({
        date: key,
        calls: dedupedCalls.filter((c) => c.day === key).length,
        messages: dedupedMsgs.filter((c) => c.day === key).length,
        followups: dedupedFups.filter((c) => c.day === key).length,
      });
    }

    return NextResponse.json({
      totals: {
        totalClients,
        totalLeads,
        totalContacted,
        clientsInFollowUp,
        meetingsScheduled,
        successCount,
        failureCount,
        blockedCount,
      },
      today: {
        calls: callsToday,
        messages: messagesToday,
        followups: followupsToday,
      },
      byStatus,
      byStage,
      byContactStatus,
      trend,
      timeline: recentInteractions.map((i) => ({
        id: i.id,
        clientId: i.client.id,
        clientName: i.client.name,
        type: i.type,
        contactType: i.contactType,
        reason: i.reason,
        notes: i.notes,
        createdAt: i.createdAt,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao carregar dashboard do CRM:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao carregar dashboard do CRM' },
      { status: 500 }
    );
  }
}