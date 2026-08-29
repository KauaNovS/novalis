import type { MatchResult } from '../intelligence/types.js';

export interface PlantaParaMatch {
  id: string;
  nome: string;
  final: number;
  areaM2: number;
  tipologia: string;
  andares: number[];
  opcao?: string | null;
}

export interface UnidadeParaMatch {
  final: number;
  andar: number;
  areaM2: number;
  tipologia: string;
}

const TOLERANCIA_AREA_M2 = 0.5;
const LIMIAR_MATCH = 60;

function score(p: PlantaParaMatch, u: UnidadeParaMatch): { value: number; method: string; evidence: string[] } {
  const evidence: string[] = [];
  let value = 0;
  if (p.tipologia === u.tipologia) { value += 30; evidence.push(`tipologia=${u.tipologia}`); }
  if (p.final === u.final) { value += 40; evidence.push(`final=${u.final}`); }
  if (p.andares.includes(u.andar)) { value += 20; evidence.push(`andar=${u.andar}`); }
  const delta = Math.abs(p.areaM2 - u.areaM2);
  if (delta <= TOLERANCIA_AREA_M2) { value += 10; evidence.push(`area_delta=${delta.toFixed(2)}m²`); }
  if ((p.opcao || '').toLowerCase() === 'padrao') value += 2;
  const method = p.final === u.final && p.andares.includes(u.andar)
    ? 'FINAL_TIPOLOGIA_ANDAR'
    : p.final === u.final
      ? 'FINAL_TIPOLOGIA'
      : delta <= TOLERANCIA_AREA_M2
        ? 'AREA_TIPOLOGIA'
        : 'TIPOLOGIA';
  return { value: Math.min(100, value), method, evidence };
}

export function matchPlanta(unidade: UnidadeParaMatch, plantas: PlantaParaMatch[]): MatchResult<PlantaParaMatch> {
  if (!plantas.length) return { planta: null, evidence: null };
  const ranked = plantas
    .filter((p) => p.tipologia === unidade.tipologia)
    .map((p) => ({ planta: p, s: score(p, unidade) }))
    .sort((a, b) => b.s.value - a.s.value || Number((b.planta.opcao || '').toLowerCase() === 'padrao') - Number((a.planta.opcao || '').toLowerCase() === 'padrao'));

  if (!ranked.length) return { planta: null, evidence: null };
  const top = ranked[0];
  if (top.s.value < LIMIAR_MATCH) {
    return {
      planta: null,
      evidence: { nivel: 4, score: top.s.value, metodo: 'SEM_MATCH', evidencias: top.s.evidence },
    };
  }
  const nivel = top.s.method === 'FINAL_TIPOLOGIA_ANDAR' ? 1 : top.s.method === 'FINAL_TIPOLOGIA' ? 2 : top.s.method === 'AREA_TIPOLOGIA' ? 3 : 4;
  return { planta: top.planta, evidence: { nivel, score: top.s.value, metodo: top.s.method, evidencias: top.s.evidence } };
}
