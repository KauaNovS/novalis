import type { PrismaClient } from '@prisma/client';
import { matchPlanta } from '../matcher/plantaMatcher.js';
import { normalizarNumeroUnidade, normalizarTipologia } from '../normalizer/realEstateNormalizer.js';

export interface UnidadeImportInput {
  torre?: string | null;
  andar: number;
  final: number;
  numero?: string | null;
  tipologia?: string | null;
  topologia?: string | null;
  area_m2: number;
  dormitorios?: number;
  vagas?: number;
  preco?: number | null;
  precoM2?: number | null;
  status?: string;
}

export async function importUnidades(prisma: PrismaClient, projectId: string, unidades: UnidadeImportInput[]) {
  const result = { criadas: 0, atualizadas: 0, comPlantaAssociada: 0, semPlantaAssociada: 0, erros: [] as Array<{ numero: string; erro: string }> };
  const plantas = await prisma.planta.findMany({ where: { projectId } });

  for (const u of unidades) {
    const numero = normalizarNumeroUnidade(u.andar, u.final);
    try {
      const tipologia = normalizarTipologia(u.tipologia) || 'NAO_INFORMADA';
      const matched = matchPlanta({ final: u.final, andar: u.andar, areaM2: u.area_m2, tipologia }, plantas.map((p) => ({
        id: p.id, nome: p.nome, final: p.final, areaM2: p.areaM2, tipologia: p.tipologia, andares: p.andares, opcao: p.opcao,
      })));
      if (matched.planta) result.comPlantaAssociada++; else result.semPlantaAssociada++;
      const towerName = u.torre?.trim() || 'Torre Única';
      let tower = await prisma.tower.findFirst({ where: { projectId, name: towerName } });
      if (!tower) tower = await prisma.tower.create({ data: { projectId, name: towerName, floors: u.andar } });
      if (u.andar > tower.floors) await prisma.tower.update({ where: { id: tower.id }, data: { floors: u.andar } });
      const data = {
        floor: u.andar,
        final: u.final,
        typology: tipologia,
        topology: u.topologia ?? undefined,
        bedrooms: u.dormitorios ?? 0,
        area: u.area_m2,
        parkingSpaces: u.vagas ?? 0,
        currentPrice: u.preco ?? undefined,
        pricePerSquareMeter: u.precoM2 ?? undefined,
        plantaId: matched.planta?.id ?? null,
        status: u.status ?? 'AVAILABLE',
      };
      const existing = await prisma.unit.findUnique({ where: { projectId_towerId_unitNumber: { projectId, towerId: tower.id, unitNumber: numero } } });
      if (existing) { await prisma.unit.update({ where: { id: existing.id }, data }); result.atualizadas++; }
      else { await prisma.unit.create({ data: { ...data, projectId, towerId: tower.id, unitNumber: numero } }); result.criadas++; }
    } catch (err) {
      result.erros.push({ numero, erro: err instanceof Error ? err.message : String(err) });
    }
  }
  return result;
}

export async function reprocessarMatchingPlantas(prisma: PrismaClient, projectId: string) {
  const [plantas, unidades] = await Promise.all([prisma.planta.findMany({ where: { projectId } }), prisma.unit.findMany({ where: { projectId } })]);
  let atualizadas = 0;
  let semMatch = 0;
  for (const u of unidades) {
    const matched = matchPlanta({ final: u.final ?? 0, andar: u.floor, areaM2: u.area, tipologia: u.typology ?? 'NAO_INFORMADA' }, plantas.map((p) => ({ id: p.id, nome: p.nome, final: p.final, areaM2: p.areaM2, tipologia: p.tipologia, andares: p.andares, opcao: p.opcao })));
    const next = matched.planta?.id ?? null;
    if (next !== u.plantaId) { await prisma.unit.update({ where: { id: u.id }, data: { plantaId: next } }); atualizadas++; }
    if (!next) semMatch++;
  }
  return { atualizadas, semMatch };
}
