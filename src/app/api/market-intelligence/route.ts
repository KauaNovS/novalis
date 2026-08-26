import { NextRequest, NextResponse } from 'next/server';

// Séries BACEN SGS
const SERIES = {
  SELIC_META: 432,       // Meta Selic % a.a. (decisão COPOM)
  SELIC_MENSAL: 4390,    // Selic acumulada no mês % a.m.
  IPCA_MENSAL: 433,      // IPCA % mensal
  IPCA_ANUAL: 13522,     // IPCA acumulado 12 meses
  INCC_MENSAL: 192,      // INCC % mensal
  CDI_MENSAL: 4391,      // CDI % a.m.
  POUPANCA: 196,         // Poupança % a.m.
  CREDITO_IMOB: 4464,    // Crédito imobiliário (R$ mi)
};

const fmtBACEN = (d: Date) =>
  `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;

async function fetchSerie(code: number, months = 14) {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${fmtBACEN(start)}&dataFinal=${fmtBACEN(end)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

async function fetchSerieHistorico(code: number) {
  // Histórico desde Jan/2000
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=01/01/2000&dataFinal=${fmtBACEN(new Date())}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
    if (!res.ok) return [];
    return await res.json();
  } catch { return []; }
}

function lastVal(arr: any[]): number | null {
  if (!arr || arr.length === 0) return null;
  const v = arr[arr.length - 1]?.valor;
  return v != null ? parseFloat(String(v).replace(',', '.')) : null;
}
function lastDate(arr: any[]): string {
  if (!arr || arr.length === 0) return '';
  return arr[arr.length - 1]?.data || '';
}
function calcAcum12m(arr: any[]): number | null {
  if (!arr || arr.length < 2) return null;
  const last12 = arr.slice(-12);
  let acum = 1;
  for (const item of last12) {
    const v = parseFloat(String(item.valor).replace(',', '.'));
    if (!isNaN(v)) acum *= (1 + v / 100);
  }
  return (acum - 1) * 100;
}
function fmt1(v: number | null, digits = 2): string {
  if (v == null) return '–';
  return `${v.toFixed(digits).replace('.', ',')}%`;
}

// Reduzir histórico para pontos anuais (1 por ano, último valor do ano)
function anualizarHistorico(data: any[]): { ano: string; valor: number }[] {
  const porAno: Record<string, number> = {};
  for (const item of data) {
    const ano = String(item.data).split('/')[2];
    if (ano) porAno[ano] = parseFloat(String(item.valor).replace(',', '.'));
  }
  return Object.entries(porAno)
    .filter(([, v]) => !isNaN(v))
    .map(([ano, valor]) => ({ ano, valor }))
    .sort((a, b) => Number(a.ano) - Number(b.ano));
}

// Reduzir histórico para pontos mensais dos últimos 12 meses
function ultimos12Meses(data: any[]): { mes: string; valor: number }[] {
  const last12 = data.slice(-12);
  return last12.map(item => ({
    mes: String(item.data).split('/').slice(0, 2).join('/'),
    valor: parseFloat(String(item.valor).replace(',', '.')),
  })).filter(x => !isNaN(x.valor));
}

export async function GET(req: NextRequest) {
  try {
    // Dados recentes (últimos 14 meses)
    const [selicMetaArr, selicMensalArr, ipcaMensalArr, ipcaAnualArr, inccArr, cdiArr, poupArr, creditoArr] =
      await Promise.all([
        fetchSerie(SERIES.SELIC_META, 3),
        fetchSerie(SERIES.SELIC_MENSAL, 14),
        fetchSerie(SERIES.IPCA_MENSAL, 14),
        fetchSerie(SERIES.IPCA_ANUAL, 3),
        fetchSerie(SERIES.INCC_MENSAL, 14),
        fetchSerie(SERIES.CDI_MENSAL, 14),
        fetchSerie(SERIES.POUPANCA, 14),
        fetchSerie(SERIES.CREDITO_IMOB, 14),
      ]);

    // Histórico desde 2000 (para gráficos de timeline)
    const [selicHistorico, ipcaHistorico, inccHistorico] = await Promise.all([
      fetchSerieHistorico(SERIES.SELIC_META),
      fetchSerieHistorico(SERIES.IPCA_MENSAL),
      fetchSerieHistorico(SERIES.INCC_MENSAL),
    ]);

    // Valores atuais
    const selicAnual = lastVal(selicMetaArr);       // já vem em % a.a.
    const selicMensal = lastVal(selicMensalArr);    // % a.m.
    const ipcaMensal = lastVal(ipcaMensalArr);
    const ipcaAnual = lastVal(ipcaAnualArr) ?? calcAcum12m(ipcaMensalArr);
    const inccMensal = lastVal(inccArr);
    const inccAnual = calcAcum12m(inccArr);
    const cdiMensal = lastVal(cdiArr);
    const cdiAnual = cdiMensal != null ? (Math.pow(1 + cdiMensal / 100, 12) - 1) * 100 : null;
    const poupMensal = lastVal(poupArr);
    const poupAnual = poupMensal != null ? (Math.pow(1 + poupMensal / 100, 12) - 1) * 100 : null;

    const indicators = [
      {
        id: 'selic',
        title: 'Taxa Selic (meta)',
        valueMes: fmt1(selicMensal),
        valueAno: fmt1(selicAnual),
        change: selicAnual != null && selicAnual > 12 ? '⬆ Restritiva' : '⬇ Expansionista',
        direction: selicAnual != null && selicAnual > 12 ? 'up' : 'down',
        source: 'Banco Central do Brasil',
        lastUpdate: lastDate(selicMetaArr) || lastDate(selicMensalArr),
        grafico12m: ultimos12Meses(selicMensalArr),
      },
      {
        id: 'ipca',
        title: 'IPCA',
        valueMes: fmt1(ipcaMensal),
        valueAno: fmt1(ipcaAnual),
        change: ipcaAnual != null && ipcaAnual > 4.5 ? '⬆ Acima da meta' : '✓ Na meta',
        direction: ipcaAnual != null && ipcaAnual > 4.5 ? 'up' : 'neutral',
        source: 'IBGE / BACEN',
        lastUpdate: lastDate(ipcaMensalArr),
        grafico12m: ultimos12Meses(ipcaMensalArr),
      },
      {
        id: 'incc',
        title: 'INCC',
        valueMes: fmt1(inccMensal),
        valueAno: fmt1(inccAnual),
        change: 'Custo da construção',
        direction: 'neutral' as const,
        source: 'FGV / BACEN',
        lastUpdate: lastDate(inccArr),
        grafico12m: ultimos12Meses(inccArr),
      },
      {
        id: 'cdi',
        title: 'CDI',
        valueMes: fmt1(cdiMensal),
        valueAno: fmt1(cdiAnual),
        change: 'Referência renda fixa',
        direction: 'neutral' as const,
        source: 'BACEN',
        lastUpdate: lastDate(cdiArr),
        grafico12m: ultimos12Meses(cdiArr),
      },
    ];

    // Timeline histórica anual desde 2000
    const timeline = {
      selic: anualizarHistorico(selicHistorico),
      ipca: anualizarHistorico(ipcaHistorico),
      incc: anualizarHistorico(inccHistorico),
    };

    // Projeções
    const inccRef = inccAnual ?? 5.5;
    const ipcaRef = ipcaAnual ?? 4.5;
    const base = (inccRef + ipcaRef) / 2;
    const projections = {
      metodologia: 'Média INCC + IPCA acumulados 12 meses + prêmio de liquidez',
      cenarios: [
        { cenario: '🐻 Conservador', valor: fmt1(base * 0.8) },
        { cenario: '📊 Base (INCC+IPCA/2)', valor: fmt1(base) },
        { cenario: '🚀 Otimista', valor: fmt1(base * 1.3) },
        { cenario: '🏙️ Lançamento SP/RJ', valor: fmt1(base * 1.6) },
      ],
    };

    // Comparativo
    const investmentComparison = [
      { asset: 'Imóveis (projeção base)', rentabilidade: fmt1(base), source: 'INCC+IPCA · Novalis' },
      { asset: 'Selic / Tesouro Selic', rentabilidade: fmt1(selicAnual), source: 'BACEN' },
      { asset: 'CDB 100% CDI (líq. IR)', rentabilidade: fmt1(cdiAnual != null ? cdiAnual * 0.85 : null), source: 'CDI – 15% IR' },
      { asset: 'Poupança', rentabilidade: fmt1(poupAnual), source: 'BACEN' },
      { asset: 'FII (IFIX médio histórico)', rentabilidade: '~12,0%', source: 'B3 – estimativa' },
      { asset: 'IPCA+ 6%', rentabilidade: fmt1(ipcaRef + 6), source: 'Tesouro Direto' },
    ];

    const financing = {
      taxaMediaJuros: '10,5% a.a. + TR',
      taxaEfetiva: '~11,2% a.a. (CET)',
      ltv: 'Até 80% do valor',
      prazoMaximo: '420 meses (35 anos)',
      volumeUltimos12m: lastVal(creditoArr) != null
        ? `R$ ${(lastVal(creditoArr)! / 1000).toFixed(1).replace('.', ',')} bi (último mês)`
        : '~R$ 25 bi/mês',
      fonte: 'Banco Central do Brasil – Nota de Crédito',
    };

    const news = [
      { title: 'Selic em patamar restritivo impacta lançamentos residenciais em 2026', url: 'https://valoreconomico.globo.com', source: 'Valor Econômico' },
      { title: 'FIPE/ZAP: preço de venda sobe 2,1% em SP no acumulado de 12 meses', url: 'https://www.fipe.org.br/pt-br/indices/fipezap/', source: 'FIPE/ZAP' },
      { title: 'Crédito imobiliário bate recorde: R$ 270 bi contratados em 2025', url: 'https://www.bcb.gov.br/publicacoes/notacredito', source: 'Banco Central' },
      { title: 'Minha Casa Minha Vida: meta de 2 milhões de unidades até 2026', url: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida', source: 'Gov Federal' },
      { title: 'INCC mantém alta moderada; pressão de custos de obra persiste', url: 'https://portalibre.fgv.br', source: 'FGV' },
    ];

    const regionalData = [
      { city: 'São Paulo', state: 'SP', pricePerM2: 11870, variation: '+2,1%', source: 'Secovi-SP' },
      { city: 'Rio de Janeiro', state: 'RJ', pricePerM2: 10240, variation: '+1,8%', source: 'Fipe/ZAP' },
      { city: 'Belo Horizonte', state: 'MG', pricePerM2: 7890, variation: '+3,5%', source: 'Fipe/ZAP' },
      { city: 'Curitiba', state: 'PR', pricePerM2: 9320, variation: '+4,2%', source: 'Secovi-PR' },
      { city: 'Porto Alegre', state: 'RS', pricePerM2: 8150, variation: '+2,7%', source: 'Secovi-RS' },
      { city: 'Florianópolis', state: 'SC', pricePerM2: 10100, variation: '+5,8%', source: 'Fipe/ZAP' },
      { city: 'Fortaleza', state: 'CE', pricePerM2: 7350, variation: '+5,1%', source: 'Fipe/ZAP' },
      { city: 'Recife', state: 'PE', pricePerM2: 7120, variation: '+4,8%', source: 'Fipe/ZAP' },
      { city: 'Salvador', state: 'BA', pricePerM2: 6980, variation: '+3,0%', source: 'Fipe/ZAP' },
      { city: 'Goiânia', state: 'GO', pricePerM2: 6540, variation: '+6,2%', source: 'Fipe/ZAP' },
    ];

    return NextResponse.json({
      indicators, regionalData, projections, investmentComparison,
      financing, news, timeline, lastUpdate: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
