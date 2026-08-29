import type { LinhaTabelao, ValidacaoPreco } from '../intelligence/types.js';
import { calcularValorM2, percentualDivergencia } from '../normalizer/realEstateNormalizer.js';

export function validarPrecoM2(linha: LinhaTabelao): ValidacaoPreco {
  const calculado = calcularValorM2(linha.valor_unidade, linha.area_m2);
  const divergencia = percentualDivergencia(calculado, linha.valor_m2_documento ?? null);
  const status = calculado === null || linha.valor_m2_documento == null
    ? 'INDETERMINADO'
    : Math.abs(divergencia ?? 999) <= Number(process.env.NOVALIS_PRICE_M2_TOLERANCE_PERCENT || 1.5)
      ? 'VALIDO'
      : 'DIVERGENTE';
  return { valor_unidade: linha.valor_unidade ?? null, area_m2: linha.area_m2 ?? null, valor_m2_documento: linha.valor_m2_documento ?? null, valor_m2_calculado: calculado, divergencia_percentual: divergencia, status };
}

export function validarLinhaTabelao(linha: LinhaTabelao): string[] {
  const erros: string[] = [];
  if (!linha.empreendimento) erros.push('empreendimento ausente');
  if (linha.andar != null && linha.andar < 0) erros.push('andar inválido');
  if (linha.final != null && linha.final < 0) erros.push('final inválido');
  if (linha.area_m2 != null && linha.area_m2 <= 0) erros.push('area_m2 inválida');
  if (linha.valor_unidade != null && linha.valor_unidade < 0) erros.push('valor_unidade inválido');
  return erros;
}
