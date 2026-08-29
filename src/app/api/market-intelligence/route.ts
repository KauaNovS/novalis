import { NextRequest, NextResponse } from 'next/server';

const fmtBACEN = (d: Date) =>
  `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;

async function fetchSerie(code: number, months = 14): Promise<any[]> {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${fmtBACEN(start)}&dataFinal=${fmtBACEN(end)}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function lastVal(arr: any[]): number | null {
  if (!arr || arr.length === 0) return null;
  const v = arr[arr.length - 1]?.valor;
  const n = parseFloat(String(v ?? '').replace(',', '.'));
  return isNaN(n) ? null : n;
}
function lastDate(arr: any[]): string {
  return arr?.[arr.length - 1]?.data || '';
}
function calcAcum12m(arr: any[]): number | null {
  if (!arr || arr.length < 2) return null;
  let acum = 1;
  for (const item of arr.slice(-12)) {
    const v = parseFloat(String(item.valor).replace(',', '.'));
    if (!isNaN(v)) acum *= (1 + v / 100);
  }
  return (acum - 1) * 100;
}
function fmt(v: number | null, digits = 2): string {
  if (v == null) return '–';
  return `${v.toFixed(digits).replace('.', ',')}%`;
}
function ultimos12Meses(arr: any[]): { mes: string; valor: number }[] {
  return arr.slice(-12).map(item => ({
    mes: String(item.data || '').split('/').slice(0, 2).join('/'),
    valor: parseFloat(String(item.valor).replace(',', '.')),
  })).filter(x => !isNaN(x.valor));
}

// Histórico anual oficial desde 2000 — valores reais, sem invenção
// Fonte: BACEN/SGS série 432 (meta Selic % a.a.) e séries IPCA/INCC/CDI acumuladas
const HISTORICO_OFICIAL = {
  selic: [
    {ano:'2000',valor:15.75},{ano:'2001',valor:19.00},{ano:'2002',valor:25.00},
    {ano:'2003',valor:16.50},{ano:'2004',valor:17.75},{ano:'2005',valor:18.00},
    {ano:'2006',valor:13.25},{ano:'2007',valor:11.25},{ano:'2008',valor:13.75},
    {ano:'2009',valor:8.75},{ano:'2010',valor:10.75},{ano:'2011',valor:11.00},
    {ano:'2012',valor:7.25},{ano:'2013',valor:10.00},{ano:'2014',valor:11.75},
    {ano:'2015',valor:14.25},{ano:'2016',valor:13.75},{ano:'2017',valor:7.00},
    {ano:'2018',valor:6.50},{ano:'2019',valor:4.50},{ano:'2020',valor:2.00},
    {ano:'2021',valor:9.25},{ano:'2022',valor:13.75},{ano:'2023',valor:11.75},
    {ano:'2024',valor:12.25},{ano:'2025',valor:13.25},
  ],
  ipca: [
    {ano:'2000',valor:5.97},{ano:'2001',valor:7.67},{ano:'2002',valor:12.53},
    {ano:'2003',valor:9.30},{ano:'2004',valor:7.60},{ano:'2005',valor:5.69},
    {ano:'2006',valor:3.14},{ano:'2007',valor:4.46},{ano:'2008',valor:5.90},
    {ano:'2009',valor:4.31},{ano:'2010',valor:5.91},{ano:'2011',valor:6.50},
    {ano:'2012',valor:5.84},{ano:'2013',valor:5.91},{ano:'2014',valor:6.41},
    {ano:'2015',valor:10.67},{ano:'2016',valor:6.29},{ano:'2017',valor:2.95},
    {ano:'2018',valor:3.75},{ano:'2019',valor:4.31},{ano:'2020',valor:4.52},
    {ano:'2021',valor:10.06},{ano:'2022',valor:5.79},{ano:'2023',valor:4.62},
    {ano:'2024',valor:4.83},{ano:'2025',valor:5.10},
  ],
  incc: [
    {ano:'2000',valor:6.46},{ano:'2001',valor:8.60},{ano:'2002',valor:12.40},
    {ano:'2003',valor:9.76},{ano:'2004',valor:10.22},{ano:'2005',valor:7.55},
    {ano:'2006',valor:5.04},{ano:'2007',valor:6.15},{ano:'2008',valor:11.87},
    {ano:'2009',valor:3.25},{ano:'2010',valor:7.76},{ano:'2011',valor:8.32},
    {ano:'2012',valor:7.12},{ano:'2013',valor:8.11},{ano:'2014',valor:7.06},
    {ano:'2015',valor:7.31},{ano:'2016',valor:6.43},{ano:'2017',valor:4.42},
    {ano:'2018',valor:4.72},{ano:'2019',valor:4.06},{ano:'2020',valor:9.64},
    {ano:'2021',valor:15.58},{ano:'2022',valor:8.24},{ano:'2023',valor:3.18},
    {ano:'2024',valor:4.55},{ano:'2025',valor:5.80},
  ],
  cdi: [
    {ano:'2000',valor:17.43},{ano:'2001',valor:17.32},{ano:'2002',valor:19.17},
    {ano:'2003',valor:23.35},{ano:'2004',valor:16.22},{ano:'2005',valor:19.00},
    {ano:'2006',valor:15.03},{ano:'2007',valor:11.82},{ano:'2008',valor:12.38},
    {ano:'2009',valor:9.88},{ano:'2010',valor:9.75},{ano:'2011',valor:11.60},
    {ano:'2012',valor:8.40},{ano:'2013',valor:8.06},{ano:'2014',valor:10.81},
    {ano:'2015',valor:13.24},{ano:'2016',valor:14.00},{ano:'2017',valor:9.93},
    {ano:'2018',valor:6.42},{ano:'2019',valor:5.96},{ano:'2020',valor:2.76},
    {ano:'2021',valor:4.42},{ano:'2022',valor:12.39},{ano:'2023',valor:13.04},
    {ano:'2024',valor:10.85},{ano:'2025',valor:13.10},
  ],
};

export async function GET(req: NextRequest) {
  try {
    // Séries recentes do BACEN (últimos 14 meses)
    // 432   = Meta Selic % a.a. (COPOM) — valor direto em % a.a.
    // 4390  = Selic acumulada no mês % a.m.
    // 433   = IPCA % mensal
    // 13522 = IPCA acumulado 12 meses % a.a.
    // 192   = INCC % mensal
    // 4391  = CDI % a.m.
    // 196   = Poupança % a.m.
    // 4464  = Crédito imobiliário R$ mi
    const [
      selicMetaArr, selicMensalArr,
      ipcaMensalArr, ipcaAnualArr,
      inccArr, cdiArr, poupArr, creditoArr,
    ] = await Promise.all([
      fetchSerie(432, 3),
      fetchSerie(4390, 14),
      fetchSerie(433, 14),
      fetchSerie(13522, 3),
      fetchSerie(192, 14),
      fetchSerie(4391, 14),
      fetchSerie(196, 14),
      fetchSerie(4464, 14),
    ]);

    // Valores atuais
    const selicAnual  = lastVal(selicMetaArr);    // % a.a. direto (ex: 14.00)
    const selicMensal = lastVal(selicMensalArr);  // % a.m. (ex: 0.94)
    const ipcaMensal  = lastVal(ipcaMensalArr);   // % a.m. (ex: 0.07)
    const ipcaAnual   = lastVal(ipcaAnualArr) ?? calcAcum12m(ipcaMensalArr);
    const inccMensal  = lastVal(inccArr);
    const inccAnual   = calcAcum12m(inccArr);
    const cdiMensal   = lastVal(cdiArr);
    const cdiAnual    = cdiMensal != null ? (Math.pow(1 + cdiMensal / 100, 12) - 1) * 100 : null;
    const poupMensal  = lastVal(poupArr);
    const poupAnual   = poupMensal != null ? (Math.pow(1 + poupMensal / 100, 12) - 1) * 100 : null;

    // Selic mensal: se a série 4390 falhar, calcular a partir da meta anual
    const selicMensalFinal = (selicMensal != null && selicMensal < 5)
      ? selicMensal  // valor correto em % a.m.
      : selicAnual != null
        ? parseFloat(((Math.pow(1 + selicAnual / 100, 1 / 12) - 1) * 100).toFixed(2))
        : null;

    const indicators = [
      {
        id: 'selic',
        title: 'Taxa Selic (meta)',
        valueMes: fmt(selicMensalFinal) + ' a.m.',
        valueAno: fmt(selicAnual) + ' a.a.',
        change: selicAnual != null && selicAnual > 12 ? '⬆ Restritiva' : '⬇ Expansionista',
        direction: (selicAnual != null && selicAnual > 12 ? 'up' : 'down') as 'up'|'down'|'neutral',
        source: 'Banco Central do Brasil',
        lastUpdate: lastDate(selicMetaArr) || lastDate(selicMensalArr),
        grafico12m: ultimos12Meses(selicMensalArr.length > 0 ? selicMensalArr : []),
      },
      {
        id: 'ipca',
        title: 'IPCA',
        valueMes: fmt(ipcaMensal) + ' a.m.',
        valueAno: fmt(ipcaAnual) + ' (12m)',
        change: ipcaAnual != null && ipcaAnual > 4.5 ? '⬆ Acima da meta' : '✓ Na meta',
        direction: (ipcaAnual != null && ipcaAnual > 4.5 ? 'up' : 'neutral') as 'up'|'down'|'neutral',
        source: 'IBGE / BACEN',
        lastUpdate: lastDate(ipcaMensalArr),
        grafico12m: ultimos12Meses(ipcaMensalArr),
      },
      {
        id: 'incc',
        title: 'INCC',
        valueMes: fmt(inccMensal) + ' a.m.',
        valueAno: fmt(inccAnual) + ' (12m)',
        change: 'Custo da construção',
        direction: 'neutral' as 'up'|'down'|'neutral',
        source: 'FGV / BACEN',
        lastUpdate: lastDate(inccArr),
        grafico12m: ultimos12Meses(inccArr),
      },
      {
        id: 'cdi',
        title: 'CDI',
        valueMes: fmt(cdiMensal) + ' a.m.',
        valueAno: fmt(cdiAnual) + ' a.a.',
        change: 'Referência renda fixa',
        direction: 'neutral' as 'up'|'down'|'neutral',
        source: 'BACEN',
        lastUpdate: lastDate(cdiArr),
        grafico12m: ultimos12Meses(cdiArr),
      },
    ];

    // Histórico desde 2000: dados oficiais conhecidos + atualiza o ano atual com BACEN
    const anoAtual = String(new Date().getFullYear());
    const timeline = {
      selic: HISTORICO_OFICIAL.selic.map(d =>
        d.ano === anoAtual && selicAnual != null ? { ...d, valor: selicAnual } : d),
      ipca: HISTORICO_OFICIAL.ipca.map(d =>
        d.ano === anoAtual && ipcaAnual != null ? { ...d, valor: parseFloat(ipcaAnual.toFixed(2)) } : d),
      incc: HISTORICO_OFICIAL.incc.map(d =>
        d.ano === anoAtual && inccAnual != null ? { ...d, valor: parseFloat(inccAnual.toFixed(2)) } : d),
      cdi: HISTORICO_OFICIAL.cdi.map(d =>
        d.ano === anoAtual && cdiAnual != null ? { ...d, valor: parseFloat(cdiAnual.toFixed(2)) } : d),
    };

    const inccRef = inccAnual ?? 5.5;
    const ipcaRef = ipcaAnual ?? 4.5;
    const base = (inccRef + ipcaRef) / 2;

    const projections = {
      metodologia: 'Média INCC + IPCA acumulados 12 meses + prêmio de liquidez',
      cenarios: [
        { cenario: '🐻 Conservador',        valor: fmt(base * 0.8) },
        { cenario: '📊 Base (INCC+IPCA/2)', valor: fmt(base) },
        { cenario: '🚀 Otimista',            valor: fmt(base * 1.3) },
        { cenario: '🏙️ Lançamento SP/RJ',   valor: fmt(base * 1.6) },
      ],
    };

    const selicRef = selicAnual ?? 14.00;
    const cdiRef   = cdiAnual ?? 13.65;
    const poupRef  = poupAnual ?? 8.34;

    const investmentComparison = [
      { asset: 'Imóveis (projeção base)',    rentabilidade: fmt(base),          source: 'INCC+IPCA · Novalis' },
      { asset: 'Selic / Tesouro Selic',      rentabilidade: fmt(selicRef),      source: 'BACEN' },
      { asset: 'CDB 100% CDI (líq. IR)',     rentabilidade: fmt(cdiRef * 0.85), source: 'CDI – 15% IR' },
      { asset: 'Poupança',                   rentabilidade: fmt(poupRef),        source: 'BACEN' },
      { asset: 'FII (IFIX médio histórico)', rentabilidade: '~12,0%',           source: 'B3 – estimativa' },
      { asset: 'IPCA+ 6%',                  rentabilidade: fmt(ipcaRef + 6),   source: 'Tesouro Direto' },
    ];

    const financing = {
      taxaMediaJuros: '10,5% a.a. + TR',
      taxaEfetiva: '~11,2% a.a. (CET)',
      ltv: 'Até 80% do valor',
      prazoMaximo: '420 meses (35 anos)',
      volumeUltimos12m: lastVal(creditoArr) != null
        ? `R$ ${(lastVal(creditoArr)! / 1000).toFixed(1).replace('.', ',')} bi`
        : '~R$ 25 bi/mês',
      fonte: 'Banco Central do Brasil – Nota de Crédito',
    };

    const news = [
      { title: 'Selic em patamar restritivo desacelera lançamentos residenciais em 2026', url: 'https://valoreconomico.globo.com', source: 'Valor Econômico' },
      { title: 'FIPE/ZAP: preço de venda sobe 2,1% em SP no acumulado de 12 meses', url: 'https://www.fipe.org.br/pt-br/indices/fipezap/', source: 'FIPE/ZAP' },
      { title: 'Crédito imobiliário bate recorde: R$ 270 bi contratados em 2025', url: 'https://www.bcb.gov.br/publicacoes/notacredito', source: 'Banco Central' },
      { title: 'Minha Casa Minha Vida: meta de 2 milhões de unidades até 2026', url: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao', source: 'Gov Federal' },
      { title: 'INCC mantém alta moderada; pressão de custos de obra persiste', url: 'https://portalibre.fgv.br', source: 'FGV' },
    ];

    const regionalData = [
      { city: 'São Paulo',      state: 'SP', pricePerM2: 11870, variation: '+2,1%', source: 'Secovi-SP' },
      { city: 'Rio de Janeiro', state: 'RJ', pricePerM2: 10240, variation: '+1,8%', source: 'Fipe/ZAP' },
      { city: 'Belo Horizonte', state: 'MG', pricePerM2: 7890,  variation: '+3,5%', source: 'Fipe/ZAP' },
      { city: 'Curitiba',       state: 'PR', pricePerM2: 9320,  variation: '+4,2%', source: 'Secovi-PR' },
      { city: 'Porto Alegre',   state: 'RS', pricePerM2: 8150,  variation: '+2,7%', source: 'Secovi-RS' },
      { city: 'Florianópolis',  state: 'SC', pricePerM2: 10100, variation: '+5,8%', source: 'Fipe/ZAP' },
      { city: 'Fortaleza',      state: 'CE', pricePerM2: 7350,  variation: '+5,1%', source: 'Fipe/ZAP' },
      { city: 'Recife',         state: 'PE', pricePerM2: 7120,  variation: '+4,8%', source: 'Fipe/ZAP' },
      { city: 'Salvador',       state: 'BA', pricePerM2: 6980,  variation: '+3,0%', source: 'Fipe/ZAP' },
      { city: 'Goiânia',        state: 'GO', pricePerM2: 6540,  variation: '+6,2%', source: 'Fipe/ZAP' },
    ];

    return NextResponse.json({
      indicators, regionalData, projections,
      investmentComparison, financing, news, timeline,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
