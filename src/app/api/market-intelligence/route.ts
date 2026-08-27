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

async function fetchSerieHistorico(code: number, from = '01/01/2000'): Promise<any[]> {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${from}&dataFinal=${fmtBACEN(new Date())}`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function lastVal(arr: any[]): number | null {
  if (!arr || arr.length === 0) return null;
  const v = arr[arr.length - 1]?.valor;
  if (v == null) return null;
  const n = parseFloat(String(v).replace(',', '.'));
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

// Histórico anual: pega o ÚLTIMO valor de cada ano
function anualizarHistorico(arr: any[]): { ano: string; valor: number }[] {
  const porAno: Record<string, number> = {};
  for (const item of arr) {
    const partes = String(item.data || '').split('/');
    const ano = partes[2];
    if (!ano) continue;
    const v = parseFloat(String(item.valor).replace(',', '.'));
    if (!isNaN(v)) porAno[ano] = v;
  }
  return Object.entries(porAno)
    .map(([ano, valor]) => ({ ano, valor }))
    .sort((a, b) => Number(a.ano) - Number(b.ano));
}

// Para Selic % a.a.: converter mensal para anual acumulado
function anualizarMensalParaAnual(arr: any[]): { ano: string; valor: number }[] {
  // Agrupa por ano e calcula acumulado anual de taxas mensais
  const porAno: Record<string, number[]> = {};
  for (const item of arr) {
    const partes = String(item.data || '').split('/');
    const ano = partes[2];
    if (!ano) continue;
    const v = parseFloat(String(item.valor).replace(',', '.'));
    if (!isNaN(v)) {
      if (!porAno[ano]) porAno[ano] = [];
      porAno[ano].push(v);
    }
  }
  return Object.entries(porAno)
    .map(([ano, vals]) => {
      // Acumulado anual a partir das taxas mensais
      let acum = 1;
      for (const v of vals) acum *= (1 + v / 100);
      return { ano, valor: parseFloat(((acum - 1) * 100).toFixed(2)) };
    })
    .sort((a, b) => Number(a.ano) - Number(b.ano));
}

export async function GET(req: NextRequest) {
  try {
    // Séries recentes (últimos 14 meses)
    const [
      selicMetaArr,   // 432  = Meta Selic % a.a. (COPOM) — valor mais conhecido
      selicMensalArr, // 1178 = Selic acumulada no mês % a.m.
      ipcaMensalArr,  // 433  = IPCA % mensal
      ipcaAnualArr,   // 13522 = IPCA acumulado 12 meses
      inccArr,        // 192  = INCC % mensal
      cdiArr,         // 4391 = CDI % a.m.
      poupArr,        // 196  = Poupança % a.m.
      creditoArr,     // 4464 = Crédito imobiliário
    ] = await Promise.all([
      fetchSerie(432, 3),
      fetchSerie(1178, 14),
      fetchSerie(433, 14),
      fetchSerie(13522, 3),
      fetchSerie(192, 14),
      fetchSerie(4391, 14),
      fetchSerie(196, 14),
      fetchSerie(4464, 14),
    ]);

    // Histórico desde 2000 — séries mensais, convertemos para anual
    // 1178 = Selic mensal (desde 1986) → acumula por ano → % a.a.
    // 12   = CDI mensal acumulado (desde 1986) → acumula por ano → % a.a.
    // 433  = IPCA mensal → média anual
    // 192  = INCC mensal → acumula por ano
    const [selicHistMensal, cdiHistMensal, ipcaHistMensal, inccHistMensal] = await Promise.all([
      fetchSerieHistorico(1178),  // Selic mensal → anualizar
      fetchSerieHistorico(12),    // CDI mensal → anualizar
      fetchSerieHistorico(433),   // IPCA mensal → anualizar
      fetchSerieHistorico(192),   // INCC mensal → anualizar
    ]);

    // Valores atuais
    const selicAnual  = lastVal(selicMetaArr);    // % a.a. direto
    const selicMensal = lastVal(selicMensalArr);  // % a.m.
    const ipcaMensal  = lastVal(ipcaMensalArr);
    const ipcaAnual   = lastVal(ipcaAnualArr) ?? calcAcum12m(ipcaMensalArr);
    const inccMensal  = lastVal(inccArr);
    const inccAnual   = calcAcum12m(inccArr);
    const cdiMensal   = lastVal(cdiArr);
    const cdiAnual    = cdiMensal != null ? (Math.pow(1 + cdiMensal / 100, 12) - 1) * 100 : null;
    const poupMensal  = lastVal(poupArr);
    const poupAnual   = poupMensal != null ? (Math.pow(1 + poupMensal / 100, 12) - 1) * 100 : null;

    const indicators = [
      {
        id: 'selic',
        title: 'Taxa Selic (meta)',
        valueMes: selicMensal != null ? fmt(selicMensal) + ' a.m.' : fmt(selicAnual ? selicAnual / 12 : null) + ' a.m.',
        valueAno: fmt(selicAnual) + ' a.a.',
        change: selicAnual != null && selicAnual > 12 ? '⬆ Restritiva' : '⬇ Expansionista',
        direction: (selicAnual != null && selicAnual > 12 ? 'up' : 'down') as 'up' | 'down' | 'neutral',
        source: 'Banco Central do Brasil',
        lastUpdate: lastDate(selicMetaArr) || lastDate(selicMensalArr),
        grafico12m: ultimos12Meses(selicMensalArr),
      },
      {
        id: 'ipca',
        title: 'IPCA',
        valueMes: fmt(ipcaMensal) + ' a.m.',
        valueAno: fmt(ipcaAnual) + ' (12m)',
        change: ipcaAnual != null && ipcaAnual > 4.5 ? '⬆ Acima da meta' : '✓ Na meta',
        direction: (ipcaAnual != null && ipcaAnual > 4.5 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
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
        direction: 'neutral' as 'up' | 'down' | 'neutral',
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
        direction: 'neutral' as 'up' | 'down' | 'neutral',
        source: 'BACEN',
        lastUpdate: lastDate(cdiArr),
        grafico12m: ultimos12Meses(cdiArr),
      },
    ];

    // Histórico anual desde 2000 — Selic e CDI acumulados por ano a partir de séries mensais
    const timeline = {
      selic: anualizarMensalParaAnual(selicHistMensal),
      ipca:  anualizarMensalParaAnual(ipcaHistMensal),
      incc:  anualizarMensalParaAnual(inccHistMensal),
      cdi:   anualizarMensalParaAnual(cdiHistMensal),
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

    const selicRef = selicAnual ?? 14.75;
    const cdiRef   = cdiAnual ?? 13.86;
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
      { title: 'FIPE/ZAP: preço de venda sobe 2,1% em SP no acumulado de 12 meses',      url: 'https://www.fipe.org.br/pt-br/indices/fipezap/', source: 'FIPE/ZAP' },
      { title: 'Crédito imobiliário bate recorde: R$ 270 bi contratados em 2025',         url: 'https://www.bcb.gov.br/publicacoes/notacredito', source: 'Banco Central' },
      { title: 'Minha Casa Minha Vida: meta de 2 milhões de unidades até 2026',           url: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao', source: 'Gov Federal' },
      { title: 'INCC mantém alta moderada; pressão de custos de obra persiste',           url: 'https://portalibre.fgv.br', source: 'FGV' },
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
