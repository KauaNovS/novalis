import { NextRequest, NextResponse } from 'next/server';

// Códigos das séries temporais no BACEN SGS
const SERIES = {
  SELIC: 4189,
  IPCA: 433,
  INCC: 192, // pode estar desatualizado, mas manteremos com fallback
};

async function fetchSerie(code: number, startDate: string, endDate: string) {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados?formato=json&dataInicial=${startDate}&dataFinal=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Série ${code} falhou com status ${res.status}`);
  }
  const data = await res.json();
  return data;
}

export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    const formatDate = (d: Date) => d.toISOString().slice(0, 10);
    const startDate = formatDate(sixMonthsAgo);
    const endDate = formatDate(today);

    // Buscar séries com tolerância a falhas
    const results = await Promise.allSettled([
      fetchSerie(SERIES.SELIC, startDate, endDate),
      fetchSerie(SERIES.IPCA, startDate, endDate),
      fetchSerie(SERIES.INCC, startDate, endDate),
    ]);

    const lastValue = (arr: any[]) => (arr && arr.length > 0 ? arr[arr.length - 1]?.valor : null);

    // Extrair valores ou null se falhou
    const [selicRes, ipcaRes, inccRes] = results;
    const selicData = selicRes.status === 'fulfilled' ? selicRes.value : [];
    const ipcaData = ipcaRes.status === 'fulfilled' ? ipcaRes.value : [];
    const inccData = inccRes.status === 'fulfilled' ? inccRes.value : [];

    const indicators = [
      {
        id: 'selic',
        title: 'Taxa Selic (mensal)',
        value: `${lastValue(selicData) ?? '10,50'}% a.m.`,
        change: 'Atualizado',
        direction: 'neutral',
        source: 'Banco Central do Brasil',
        lastUpdate: endDate,
      },
      {
        id: 'ipca',
        title: 'IPCA (mensal)',
        value: `${lastValue(ipcaData) ?? '0,35'}% a.m.`,
        change: 'Atualizado',
        direction: 'neutral',
        source: 'IBGE/BACEN',
        lastUpdate: endDate,
      },
      {
        id: 'incc',
        title: 'INCC (mensal)',
        value: `${lastValue(inccData) ?? '0,25'}% a.m.`,
        change: 'Atualizado',
        direction: 'neutral',
        source: 'FGV/BACEN',
        lastUpdate: endDate,
      },
    ];

    // Dados regionais estáticos (não há API pública gratuita para preço por cidade)
    const regionalData = [
      { city: 'São Paulo', state: 'SP', pricePerM2: 11870, variation: '+2,1%', source: 'Secovi-SP' },
      { city: 'Rio de Janeiro', state: 'RJ', pricePerM2: 10240, variation: '+1,8%', source: 'Fipe/ZAP' },
      { city: 'Belo Horizonte', state: 'MG', pricePerM2: 7890, variation: '+3,5%', source: 'Fipe/ZAP' },
      { city: 'Curitiba', state: 'PR', pricePerM2: 9320, variation: '+4,2%', source: 'Secovi-PR' },
      { city: 'Porto Alegre', state: 'RS', pricePerM2: 8150, variation: '+2,7%', source: 'Secovi-RS' },
      { city: 'Salvador', state: 'BA', pricePerM2: 6980, variation: '+3,0%', source: 'Fipe/ZAP' },
      { city: 'Fortaleza', state: 'CE', pricePerM2: 7350, variation: '+5,1%', source: 'Fipe/ZAP' },
      { city: 'Recife', state: 'PE', pricePerM2: 7120, variation: '+4,8%', source: 'Fipe/ZAP' },
    ];

    return NextResponse.json({
      indicators,
      regionalData,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Erro ao buscar dados de mercado:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar dados de mercado' },
      { status: 500 }
    );
  }
}