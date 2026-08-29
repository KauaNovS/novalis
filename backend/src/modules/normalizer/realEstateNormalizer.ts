export function normalizarNome(valor: string | null | undefined): string {
  return String(valor ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function normalizarTipologia(valor: string | null | undefined): string | null {
  const s = normalizarNome(valor);
  if (!s) return null;
  if (s.includes('studio')) return 'STUDIO';
  if (s.includes('r2v')) return 'R2V';
  if (s.includes('hmp')) return 'HMP';
  const dorm = s.match(/(\d+)\s*dorm/);
  if (dorm) return `${dorm[1]} DORM`;
  return s.toUpperCase();
}

export function normalizarNumeroUnidade(andar: number, final: number): string {
  return `${andar}${String(final).padStart(2, '0')}`;
}

export function calcularValorM2(valorUnidade: number | null | undefined, areaM2: number | null | undefined): number | null {
  if (valorUnidade == null || areaM2 == null || valorUnidade <= 0 || areaM2 <= 0) return null;
  return Number((valorUnidade / areaM2).toFixed(2));
}

export function percentualDivergencia(calculado: number | null, informado: number | null): number | null {
  if (calculado == null || informado == null || informado <= 0) return null;
  return Number((((calculado - informado) / informado) * 100).toFixed(2));
}
