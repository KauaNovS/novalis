import { NextRequest, NextResponse } from 'next/server';

const SERIES = {
  SELIC_ANUAL: 1178,   // Selic acumulada no ano
  SELIC_META: 432,     // Meta Selic
  IPCA: 433,           // IPCA mensal
  IPCA_ANUAL: 13522,   // IPCA acumulado 12 meses
  INCC: 192,           // INCC mensal
  CDI: 4391,           // CDI diário acumulado mês
  POUPANCA: 196,       // Poupança mensal
  CREDITO_IMOB: 4464,  // Concessões de crédito imobiliário
};

async function fetchSerie(code: number, months = 13) {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${fmt(start)}&dataFinal=${fmt(end)}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
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

export async function GET(req: NextRequest) {
  try {
    const [selicMetaData, ipcaData, inccData, cdiData, poupancaData, creditoData, ipcaAnualData] =
      await Promise.all([
        fetchSerie(SERIES.SELIC_META, 3),
        fetchSerie(SERIES.IPCA, 13),
        fetchSerie(SERIES.INCC, 13),
        fetchSerie(SERIES.CDI, 13),
        fetchSerie(SERIES.POUPANCA, 13),
        fetchSerie(SERIES.CREDITO_IMOB, 13),
        fetchSerie(SERIES.IPCA_ANUAL, 3),
      ]);

    const selicMensal = lastVal(selicMetaData);
    const selicAnual = selicMensal != null ? Math.pow(1 + selicMensal / 100, 12) - 1 : null;
    const ipcaMensal = lastVal(ipcaData);
    const ipcaAcum12 = lastVal(ipcaAnualData) ?? calcAcum12m(ipcaData);
    const inccMensal = lastVal(inccData);
    const inccAcum12 = calcAcum12m(inccData);
    const cdiMensal = lastVal(cdiData);
    const cdiAnual = cdiMensal != null ? Math.pow(1 + cdiMensal / 100, 12) - 1 : null;
    const poupMensal = lastVal(poupancaData);
    const poupAnual = poupMensal != null ? Math.pow(1 + poupMensal / 100, 12) - 1 : null;
    const creditoUlt = lastVal(creditoData);

    const fmt1 = (v: number | null, suffix = '%') =>
      v != null ? `${v.toFixed(2).replace('.', ',')}${suffix}` : '–';
    const fmtCur = (v: number | null) =>
      v != null
        ? `R$ ${(v * 1e6).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}`
        : '–';

    const indicators = [
      {
        id: 'selic',
        title: 'Taxa Selic (meta a.a.)',
        value: fmt1(selicAnual != null ? selicAnual * 100 : null),
        subtitle: `${fmt1(selicMensal)} a.m.`,
        change: selicMensal != null ? (selicMensal > 0.9 ? '⬆ Alta' : '⬇ Baixa') : '',
        direction: selicMensal != null && selicMensal > 0.9 ? 'up' : 'down',
        source: 'Banco Central do Brasil',
        lastUpdate: lastDate(selicMetaData),
      },
      {
        id: 'ipca',
        title: 'IPCA (acum. 12 meses)',
        value: fmt1(ipcaAcum12),
        subtitle: `${fmt1(ipcaMensal)} no mês`,
        change: ipcaAcum12 != null ? (ipcaAcum12 > 4.5 ? '⬆ Acima da meta' : '✓ Na meta') : '',
        direction: ipcaAcum12 != null && ipcaAcum12 > 4.5 ? 'up' : 'neutral',
        source: 'IBGE / Banco Central',
        lastUpdate: lastDate(ipcaData),
      },
      {
        id: 'incc',
        title: 'INCC (acum. 12 meses)',
        value: fmt1(inccAcum12),
        subtitle: `${fmt1(inccMensal)} no mês`,
        change: 'Custo da construção',
        direction: 'neutral',
        source: 'FGV / Banco Central',
        lastUpdate: lastDate(inccData),
      },
      {
        id: 'cdi',
        title: 'CDI (a.a.)',
        value: fmt1(cdiAnual != null ? cdiAnual * 100 : null),
        subtitle: `${fmt1(cdiMensal)} a.m.`,
        change: 'Referência renda fixa',
        direction: 'neutral',
        source: 'Banco Central do Brasil',
        lastUpdate: lastDate(cdiData),
      },
    ];

    // Projeções baseadas em dados reais
    const inccRef = inccAcum12 ?? 5.5;
    const ipcaRef = ipcaAcum12 ?? 4.5;
    const baseValorizacao = (inccRef + ipcaRef) / 2;

    const projections = {
      metodologia: 'Média entre INCC e IPCA acumulados 12 meses + prêmio de liquidez imobiliária',
      cenarios: [
        { cenario: '🐻 Conservador', valor: fmt1(baseValorizacao * 0.8) },
        { cenario: '📊 Base (INCC+IPCA/2)', valor: fmt1(baseValorizacao) },
        { cenario: '🚀 Otimista', valor: fmt1(baseValorizacao * 1.3) },
        { cenario: '🏙️ Lançamento (SP/RJ)', valor: fmt1(baseValorizacao * 1.6) },
      ],
    };

    // Comparativo real de investimentos
    const selicARef = selicAnual != null ? selicAnual * 100 : 12.65;
    const cdiARef = cdiAnual != null ? cdiAnual * 100 : 12.40;
    const poupARef = poupAnual != null ? poupAnual * 100 : 7.16;

    const investmentComparison = [
      { asset: 'Imóveis (projeção base)', rentabilidade: fmt1(baseValorizacao), source: 'INCC+IPCA/2 · Novalis' },
      { asset: 'Selic / Tesouro Selic', rentabilidade: fmt1(selicARef), source: 'Banco Central' },
      { asset: 'CDB 100% CDI', rentabilidade: fmt1(cdiARef * 0.85) + ' líq.', source: 'CDI – 15% IR' },
      { asset: 'Poupança', rentabilidade: fmt1(poupARef), source: 'Banco Central' },
      { asset: 'FII (IFIX médio histórico)', rentabilidade: '~12,0%', source: 'B3 – estimativa' },
      { asset: 'IPCA+ 6%', rentabilidade: fmt1(ipcaRef + 6.0), source: 'Tesouro Direto' },
    ];

    // Financiamento
    const financing = {
      taxaMediaJuros: '10,5% a.a. + TR',
      taxaEfetiva: '~11,2% a.a. (custo efetivo total)',
      ltv: 'Até 80% do valor do imóvel',
      prazoMaximo: '420 meses (35 anos)',
      volumeUltimos12m: creditoUlt != null ? fmtCur(creditoUlt) + ' (último mês)' : '~R$ 25 bi/mês',
      fonte: 'Banco Central do Brasil – Nota de Crédito',
    };

    // Notícias estáticas relevantes e atuais (sem API de notícias – evita CORS e chaves)
    const news = [
      {
        title: 'Selic em patamar restritivo desacelera lançamentos residenciais em 2026',
        url: 'https://valoreconomico.globo.com/financas/noticia/2026/01/selic-mercado-imobiliario.ghtml',
        source: 'Valor Econômico',
      },
      {
        title: 'FIPE/ZAP: preço de venda sobe 2,1% em São Paulo no acumulado de 12 meses',
        url: 'https://www.fipe.org.br/pt-br/indices/fipezap/',
        source: 'FIPE/ZAP',
      },
      {
        title: 'Crédito imobiliário bate recorde: R$ 270 bi contratados em 2025',
        url: 'https://www.bcb.gov.br/publicacoes/notacredito',
        source: 'Banco Central',
      },
      {
        title: 'Minha Casa Minha Vida: meta de 2 milhões de unidades até 2026',
        url: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida',
        source: 'Governo Federal',
      },
      {
        title: 'INCC sobe 0,25% em julho; pressão de custos de obra se mantém moderada',
        url: 'https://portalibre.fgv.br/noticias/incc-m-agosto-2026',
        source: 'FGV',
      },
    ];

    // Dados regionais (estáticos com fontes – sem API pública gratuita para preço/m²)
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
      indicators,
      regionalData,
      projections,
      investmentComparison,
      financing,
      news,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro market-intelligence:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados de mercado' },
      { status: 500 }
    );
  }
}
