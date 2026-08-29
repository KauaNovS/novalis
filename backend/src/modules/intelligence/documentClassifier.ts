import type { TipoDocumento } from './types.js';

const REGRAS: Array<[TipoDocumento, RegExp[]]> = [
  ['ESPELHO_VENDAS', [/espelho/i, /vendas/i, /dispon[ií]vel/i, /reservad/i]],
  ['TABELA_FINANCIAMENTO', [/financiamento/i, /entrada/i, /parcelas?/i, /juros/i]],
  ['TABELA_PRECOS', [/tabela\s+de\s+pre[cç]os?/i, /pre[cç]o\s+unit[aá]rio/i, /r\$\/m[²2]/i]],
  ['BOOK', [/book/i, /arquitetura/i, /paisagismo/i, /lazer/i, /planta\s+baixa/i]],
  ['TABELAO', [/tabel[aã]o/i, /empreendimentos/i, /lan[cç]amentos?/i, /bairro/i]],
];

export function classificarDocumento(nomeArquivo: string, texto = ''): TipoDocumento {
  const alvo = `${nomeArquivo}\n${texto}`;
  let melhor: { tipo: TipoDocumento; score: number } = { tipo: 'DESCONHECIDO', score: 0 };
  for (const [tipo, regras] of REGRAS) {
    const score = regras.reduce((s, r) => s + (r.test(alvo) ? 1 : 0), 0);
    if (score > melhor.score) melhor = { tipo, score };
  }
  return melhor.tipo;
}
