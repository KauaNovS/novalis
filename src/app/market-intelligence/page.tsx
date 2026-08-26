"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Building2,
  Percent,
  MapPin,
  ExternalLink,
  RefreshCw,
  Info,
  Newspaper,
  LineChart,
  PieChart,
  Landmark,
} from "lucide-react";

interface Indicator {
  id: string;
  title: string;
  value: string;
  change: string;
  direction: "up" | "down" | "neutral";
  source: string;
  lastUpdate: string;
}

interface RegionalData {
  city: string;
  state: string;
  pricePerM2: number;
  variation: string;
  source: string;
}

interface Projection {
  cenario: string;
  valor: string;
}

interface ComparisonItem {
  asset: string;
  rentabilidade: string;
  source: string;
}

interface Financing {
  taxaMediaJuros: string;
  volumeUltimos12m: string;
  fonte: string;
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
}

export default function MarketIntelligencePage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [projections, setProjections] = useState<Projection[]>([]);
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  const [financing, setFinancing] = useState<Financing | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/market-intelligence");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar dados");
      setIndicators(data.indicators || []);
      setRegionalData(data.regionalData || []);
      setProjections(data.projections?.cenarios || []);
      setComparison(data.investmentComparison || []);
      setFinancing(data.financing || null);
      setNews(data.news || []);
      setLastRefresh(new Date(data.lastUpdate));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-[#1a1a1a] rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-40 bg-[#1a1a1a] rounded-3xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-rose-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 hover:border-gray-600 transition"
          >
            Tentar novamente
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Inteligência de Mercado</h1>
            <p className="text-sm text-gray-500 mt-1">
              Dados econômicos e imobiliários de fontes oficiais
              {lastRefresh && ` · Última atualização: ${lastRefresh.toLocaleString("pt-BR")}`}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} strokeWidth={1.5} />
            Atualizar dados
          </button>
        </div>

        {/* Cards de indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {indicators.map((indicator) => {
            const Icon =
              indicator.id === "selic"
                ? Percent
                : indicator.id === "incc"
                ? Building2
                : indicator.id === "ipca"
                ? TrendingUp
                : Info;
            return (
              <div
                key={indicator.id}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 hover:border-gray-600 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-full bg-[#222] text-gray-300">
                    <Icon size={18} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs text-gray-500">{indicator.change}</span>
                </div>
                <h3 className="text-sm text-gray-400 mb-1">{indicator.title}</h3>
                <p className="text-2xl font-semibold text-white">{indicator.value}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-gray-600">
                  <Info size={12} />
                  <span>{indicator.source}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Atualizado: {new Date(indicator.lastUpdate).toLocaleDateString("pt-BR")}
                </p>
              </div>
            );
          })}
        </div>

        {/* Projeções e Comparativo lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Projeções */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <LineChart size={20} className="text-gray-400" strokeWidth={1.5} />
              Projeção de Valorização (12 meses)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Baseada na média das variações mensais do INCC e IPCA dos últimos 12 meses.
            </p>
            <div className="space-y-3">
              {projections.length > 0 ? (
                projections.map((proj, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{proj.cenario}</span>
                    <span className="text-sm font-semibold text-white">{proj.valor}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">Dados insuficientes para projeção.</p>
              )}
            </div>
          </div>

          {/* Comparativo de investimentos */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <PieChart size={20} className="text-gray-400" strokeWidth={1.5} />
              Rentabilidade Anual Comparada
            </h2>
            <div className="space-y-3">
              {comparison.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">{item.asset}</p>
                    <p className="text-xs text-gray-600">{item.source}</p>
                  </div>
                  <span className="text-sm font-semibold text-white">{item.rentabilidade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financiamento e Notícias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Financiamento */}
          {financing && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <Landmark size={20} className="text-gray-400" strokeWidth={1.5} />
                Financiamento Imobiliário
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Taxa média de juros</span>
                  <span className="text-sm font-semibold text-white">{financing.taxaMediaJuros}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Volume últimos 12 meses</span>
                  <span className="text-sm font-semibold text-white">{financing.volumeUltimos12m}</span>
                </div>
                <p className="text-xs text-gray-600">{financing.fonte}</p>
              </div>
            </div>
          )}

          {/* Notícias */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Newspaper size={20} className="text-gray-400" strokeWidth={1.5} />
              Notícias do Setor
            </h2>
            <div className="space-y-3">
              {news.map((item, idx) => (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <p className="text-sm text-gray-300 group-hover:text-blue-400 transition">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-600">{item.source}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela regional */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#2a2a2a]">
            <h2 className="text-lg font-medium text-white">Preço médio do m² por cidade</h2>
            <p className="text-xs text-gray-500 mt-1">
              Valores em R$/m² para imóveis residenciais – fontes Secovi e Fipe/ZAP
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#222]">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Cidade</th>
                  <th className="px-6 py-3 font-medium">UF</th>
                  <th className="px-6 py-3 font-medium">Preço médio (R$/m²)</th>
                  <th className="px-6 py-3 font-medium">Variação 12m</th>
                  <th className="px-6 py-3 font-medium">Fonte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {regionalData.map((item, index) => (
                  <tr key={index} className="hover:bg-[#2a2a2a] transition">
                    <td className="px-6 py-4 font-medium text-gray-200">{item.city}</td>
                    <td className="px-6 py-4 text-gray-400">{item.state}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {item.pricePerM2.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-6 py-4 text-emerald-400">{item.variation}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fontes */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-gray-500 mt-0.5" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Fontes e metodologia</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Os indicadores econômicos são obtidos diretamente da API do Banco Central do Brasil (SGS). Dados
                imobiliários regionais são compilados de fontes públicas como Secovi e Fipe/ZAP e podem não refletir
                atualização em tempo real. Links oficiais abaixo.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href="https://www.bcb.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  BACEN <ExternalLink size={12} />
                </a>
                <a
                  href="https://www.ibge.gov.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  IBGE <ExternalLink size={12} />
                </a>
                <a
                  href="https://www.fipe.org.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  FIPE <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}