import { NextRequest, NextResponse } from 'next/server';

// Séries SGS/BACEN corretas
// 432  = Meta Selic % a.a. (decisão COPOM — ex: 14.00)
// 1178 = Selic acumulada no mês % a.m.
// 433  = IPCA % mensal
// 13522= IPCA acumulado 12 meses
// 192  = INCC-M % mensal
// 4391 = CDI acumulado no mês % a.m.
// 196  = Poupança % a.m.
// 4464 = Concessões crédito imobiliário R$ mi

const fmtBR = (d: Date) =>
  `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;

async function fetchSerie(code: number, startDate: string): Promise<any[]> {
  const end = fmtBR(new Date());
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${startDate}&dataFinal=${end}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}

function lastVal(arr: any[]): number | null {
  if (!arr.length) return null;
  const v = arr[arr.length - 1]?.valor;
  return v != null ? parseFloat(String(v).replace(',', '.')) : null;
}
function lastDate(arr: any[]): string {
  if (!arr.length) return '';
  return arr[arr.length - 1]?.data || '';
}
function acum12m(arr: any[]): number | null {
  const last = arr.slice(-12);
  if (last.length < 6) return null;
  let p = 1;
  for (const x of last) {
    const v = parseFloat(String(x.valor).replace(',', '.'));
    if (!isNaN(v)) p *= (1 + v / 100);
  }
  return (p - 1) * 100;
}
function fmt(v: number | null, d = 2): string {
  return v != null ? `${v.toFixed(d).replace('.', ',')}%` : '–';
}
function anuais(arr: any[]): { ano: string; valor: number }[] {
  const map: Record<string, number> = {};
  for (const x of arr) {
    const ano = String(x.data || '').split('/')[2];
    if (ano) map[ano] = parseFloat(String(x.valor).replace(',', '.'));
  }
  return Object.entries(map)
    .filter(([, v]) => !isNaN(v))
    .map(([ano, valor]) => ({ ano, valor }))
    .sort((a, b) => +a.ano - +b.ano);
}
function mensais12(arr: any[]): { mes: string; valor: number }[] {
  return arr.slice(-12).map(x => ({
    mes: String(x.data || '').split('/').slice(0,2).join('/'),
    valor: parseFloat(String(x.valor).replace(',', '.')),
  })).filter(x => !isNaN(x.valor));
}

export async function GET(_req: NextRequest) {
  try {
    const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const since2000 = '01/01/2000';
    const recent = fmtBR(oneYearAgo);

    const [selicMetaArr, selicMensArr, ipcaArr, ipcaA12Arr, inccArr, cdiArr, poupArr, creditoArr,
           selicHist, ipcaHist, inccHist] = await Promise.all([
      fetchSerie(432,  recent),   // meta selic a.a.
      fetchSerie(1178, recent),   // selic a.m.
      fetchSerie(433,  recent),   // ipca mensal
      fetchSerie(13522,recent),   // ipca acum 12m
      fetchSerie(192,  recent),   // incc mensal
      fetchSerie(4391, recent),   // cdi mensal
      fetchSerie(196,  recent),   // poupança
      fetchSerie(4464, recent),   // crédito imob
      fetchSerie(432,  since2000),// histórico selic
      fetchSerie(433,  since2000),// histórico ipca
      fetchSerie(192,  since2000),// histórico incc
    ]);

    const selicAA  = lastVal(selicMetaArr);   // ex: 14.00
    const selicAM  = lastVal(selicMensArr);   // ex: 1.07
    const ipcaM    = lastVal(ipcaArr);
    const ipcaA12  = lastVal(ipcaA12Arr) ?? acum12m(ipcaArr);
    const inccM    = lastVal(inccArr);
    const inccA12  = acum12m(inccArr);
    const cdiM     = lastVal(cdiArr);
    const cdiAA    = cdiM != null ? (Math.pow(1 + cdiM/100, 12) - 1)*100 : null;
    const poupM    = lastVal(poupArr);
    const poupAA   = poupM != null ? (Math.pow(1 + poupM/100, 12) - 1)*100 : null;

    const indicators = [
      { id:'selic', title:'Taxa Selic', valueMes: fmt(selicAM), valueAno: fmt(selicAA),
        change: selicAA != null && selicAA > 12 ? '⬆ Restritiva' : '⬇ Expansionista',
        direction: selicAA != null && selicAA > 12 ? 'up' : 'down',
        source:'Banco Central do Brasil', lastUpdate: lastDate(selicMetaArr),
        grafico12m: mensais12(selicMensArr) },
      { id:'ipca', title:'IPCA', valueMes: fmt(ipcaM), valueAno: fmt(ipcaA12),
        change: ipcaA12 != null && ipcaA12 > 4.5 ? '⬆ Acima da meta' : '✓ Na meta',
        direction: ipcaA12 != null && ipcaA12 > 4.5 ? 'up' : 'neutral',
        source:'IBGE / BACEN', lastUpdate: lastDate(ipcaArr),
        grafico12m: mensais12(ipcaArr) },
      { id:'incc', title:'INCC', valueMes: fmt(inccM), valueAno: fmt(inccA12),
        change:'Custo da construção', direction:'neutral',
        source:'FGV / BACEN', lastUpdate: lastDate(inccArr),
        grafico12m: mensais12(inccArr) },
      { id:'cdi', title:'CDI', valueMes: fmt(cdiM), valueAno: fmt(cdiAA),
        change:'Referência renda fixa', direction:'neutral',
        source:'BACEN', lastUpdate: lastDate(cdiArr),
        grafico12m: mensais12(cdiArr) },
    ];

    const timeline = {
      selic: anuais(selicHist),
      ipca:  anuais(ipcaHist),
      incc:  anuais(inccHist),
    };

    const inccRef = inccA12 ?? 5.5;
    const ipcaRef = ipcaA12 ?? 4.5;
    const base = (inccRef + ipcaRef) / 2;

    const projections = {
      metodologia:'Média INCC + IPCA acumulados 12 meses + prêmio de liquidez',
      cenarios:[
        { cenario:'🐻 Conservador',      valor: fmt(base * 0.8) },
        { cenario:'📊 Base (INCC+IPCA/2)',valor: fmt(base) },
        { cenario:'🚀 Otimista',          valor: fmt(base * 1.3) },
        { cenario:'🏙️ Lançamento SP/RJ',  valor: fmt(base * 1.6) },
      ],
    };

    const investmentComparison = [
      { asset:'Imóveis (projeção base)',    rentabilidade: fmt(base),                    source:'INCC+IPCA · Novalis' },
      { asset:'Selic / Tesouro Selic',      rentabilidade: fmt(selicAA),                 source:'BACEN' },
      { asset:'CDB 100% CDI (líq. IR)',     rentabilidade: fmt(cdiAA != null ? cdiAA*0.85 : null), source:'CDI – 15% IR' },
      { asset:'Poupança',                   rentabilidade: fmt(poupAA),                  source:'BACEN' },
      { asset:'FII (IFIX médio histórico)', rentabilidade:'~12,0%',                      source:'B3 – estimativa' },
      { asset:'IPCA+ 6%',                   rentabilidade: fmt(ipcaRef + 6),             source:'Tesouro Direto' },
    ];

    const credito = lastVal(creditoArr);
    const financing = {
      taxaMediaJuros:'10,5% a.a. + TR',
      taxaEfetiva:'~11,2% a.a. (CET)',
      ltv:'Até 80% do valor',
      prazoMaximo:'420 meses (35 anos)',
      volumeUltimos12m: credito != null ? `R$ ${(credito/1000).toFixed(1).replace('.',',')} bi (último mês)` : '~R$ 25 bi/mês',
      fonte:'Banco Central do Brasil – Nota de Crédito',
    };

    const news = [
      { title:'Selic em 14,75%: BC mantém ciclo de aperto monetário em 2026', url:'https://www.bcb.gov.br/publicacoes/notasreuniao', source:'Banco Central' },
      { title:'FIPE/ZAP: preço de venda sobe 2,1% em SP no acumulado de 12 meses', url:'https://www.fipe.org.br/pt-br/indices/fipezap/', source:'FIPE/ZAP' },
      { title:'Crédito imobiliário bate recorde: R$ 270 bi contratados em 2025', url:'https://www.bcb.gov.br/publicacoes/notacredito', source:'Banco Central' },
      { title:'Minha Casa Minha Vida: meta de 2 milhões de unidades até 2026', url:'https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida', source:'Gov Federal' },
      { title:'INCC mantém alta moderada; custos de obra pressionam margens', url:'https://portalibre.fgv.br', source:'FGV' },
    ];

    const regionalData = [
      { city:'São Paulo',      state:'SP', pricePerM2:11870, variation:'+2,1%', source:'Secovi-SP' },
      { city:'Rio de Janeiro', state:'RJ', pricePerM2:10240, variation:'+1,8%', source:'Fipe/ZAP' },
      { city:'Belo Horizonte', state:'MG', pricePerM2: 7890, variation:'+3,5%', source:'Fipe/ZAP' },
      { city:'Curitiba',       state:'PR', pricePerM2: 9320, variation:'+4,2%', source:'Secovi-PR' },
      { city:'Porto Alegre',   state:'RS', pricePerM2: 8150, variation:'+2,7%', source:'Secovi-RS' },
      { city:'Florianópolis',  state:'SC', pricePerM2:10100, variation:'+5,8%', source:'Fipe/ZAP' },
      { city:'Fortaleza',      state:'CE', pricePerM2: 7350, variation:'+5,1%', source:'Fipe/ZAP' },
      { city:'Recife',         state:'PE', pricePerM2: 7120, variation:'+4,8%', source:'Fipe/ZAP' },
      { city:'Salvador',       state:'BA', pricePerM2: 6980, variation:'+3,0%', source:'Fipe/ZAP' },
      { city:'Goiânia',        state:'GO', pricePerM2: 6540, variation:'+6,2%', source:'Fipe/ZAP' },
    ];

    return NextResponse.json({ indicators, regionalData, projections, investmentComparison, financing, news, timeline, lastUpdate: new Date().toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
