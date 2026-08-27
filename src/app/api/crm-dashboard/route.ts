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
      blockedClientRows,
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
          success: true,
          blocked: true,
          answered: true,
          createdAt: true,
        },
      }),
      prisma.clientInteraction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { client: { select: { id: true, name: true } } },
      }),
      // "ao longo do histórico" -> não limitado aos 90 dias da query acima
      prisma.clientInteraction.findMany({
        where: { blocked: true },
        select: { clientId: true },
        distinct: ['clientId'],
      }),
    ]);

    const byStatus = byStatusRaw.map((r: any) => ({ key: r.status, count: r._count }));
    const byStage = byStageRaw.map((r: any) => ({ key: r.stage, count: r._count }));
    const byContactStatus = byContactStatusRaw.map((r: any) => ({
      key: r.contactStatus || 'NAO_CONTACTADO',
      count: r._count,
    }));

    const naoContactado = byContactStatus.find((c: any) => c.key === 'NAO_CONTACTADO')?.count || 0;
    const totalLeads = byStatus.find((s: any) => s.key === 'LEAD')?.count || 0;
    const totalContacted = totalClients - naoContactado;
    const meetingsScheduled = byContactStatus.find((c: any) => c.key === 'REUNIAO_AGENDADA')?.count || 0;

    const callRows = interactions.filter((i: any) => i.type === 'CALL' || i.type === 'WHATSAPP_CALL');
    const msgRows = interactions.filter((i: any) => i.type === 'WHATSAPP_MSG');
    const fupRows = interactions.filter((i: any) => i.contactType === 'FUP');

    const dedupedCalls = dedupeByClientDay(callRows);
    const dedupedMsgs = dedupeByClientDay(msgRows);
    const dedupedFups = dedupeByClientDay(fupRows);

    const todayKey = dayKey(new Date());
    const callsToday = dedupedCalls.filter((d) => d.day === todayKey).length;
    const messagesToday = dedupedMsgs.filter((d) => d.day === todayKey).length;
    const followupsToday = dedupedFups.filter((d) => d.day === todayKey).length;

    const clientsInFollowUp = new Set(fupRows.map((f: any) => f.clientId)).size;

    // Antes fixos em 0 com o comentário "não há campos de resultado" — os
    // campos existem no schema (success/blocked), só não estavam sendo
    // usados. success/failure são sobre os últimos 90 dias (mesma janela
    // do resto do dashboard); blocked é "ao longo do histórico" (sem
    // limite de data), como o texto do card já dizia.
    const successCount = interactions.filter((i: any) => i.success === true).length;
    const failureCount = interactions.filter((i: any) => i.success === false).length;
    const blockedCount = blockedClientRows.length;

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
      timeline: recentInteractions.map((i: any) => ({
        id: i.id,
        clientId: i.client.id,
        clientName: i.client.name,
        type: i.type,
        contactMode: i.contactType,
        answered: i.answered,
        success: i.success,
        blocked: i.blocked,
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