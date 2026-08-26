"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, Building2, Percent, MapPin, ExternalLink,
  RefreshCw, Info, Newspaper, LineChart, PieChart, Landmark,
  BadgeDollarSign, Home,
} from "lucide-react";

interface Indicator {
  id: string; title: string; value: string; subtitle?: string;
  change: string; direction: "up" | "down" | "neutral";
  source: string; lastUpdate: string;
}
interface RegionalData { city: string; state: string; pricePerM2: number; variation: string; source: string; }
interface Projection { cenario: string; valor: string; }
interface ComparisonItem { asset: string; rentabilidade: string; source: string; }
interface Financing {
  taxaMediaJuros: string; taxaEfetiva: string; ltv: string;
  prazoMaximo: string; volumeUltimos12m: string; fonte: string;
}
interface NewsItem { title: string; url: string; source: string; }

export default function MarketIntelligencePage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [projections, setProjections] = useState<{ cenarios: Projection[]; metodologia: string } | null>(null);
  const [comparison, setComparison] = useState<ComparisonItem[]>([]);
  const [financing, setFinancing] = useState<Financing | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/market-intelligence");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar dados");
      setIndicators(data.indicators || []);
      setRegionalData(data.regionalData || []);
      setProjections(data.projections || null);
      setComparison(data.investmentComparison || []);
      setFinancing(data.financing || null);
      setNews(data.news || []);
      setLastRefresh(new Date(data.lastUpdate));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-[#1a1a1a] rounded w-1/3 mb-2" />
        <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-[#1a1a1a] rounded-3xl" />)}
        </div>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-[#0f0f0f] p-8 flex items-center justify-center">
      <div className="text-center">
        <p className="text-rose-400 mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 hover:border-gray-600 transition text-sm">
          Tentar novamente
        </button>
      </div>
    </main>
  );

  const iconMap: Record<string, any> = { selic: Percent, ipca: TrendingUp, incc: Building2, cdi: BadgeDollarSign };

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-medium text-white">Inteligência de Mercado</h1>
            <p className="text-sm text-gray-500 mt-1">
              Dados econômicos em tempo real via Banco Central do Brasil
              {lastRefresh && ` · Atualizado: ${lastRefresh.toLocaleString("pt-BR")}`}
            </p>
          </div>
          <button
            onClick={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} strokeWidth={1.5} />
            Atualizar dados
          </button>
        </div>

        {/* Indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((ind) => {
            const Icon = iconMap[ind.id] || Info;
            return (
              <div key={ind.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 hover:border-[#3a3a3a] transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-xl bg-[#242424]">
                    <Icon size={16} strokeWidth={1.5} className="text-gray-400" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    ind.direction === "up" ? "bg-rose-500/10 text-rose-400" :
                    ind.direction === "down" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-gray-500/10 text-gray-400"
                  }`}>{ind.change || "Atualizado"}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{ind.title}</p>
                <p className="text-2xl font-semibold text-white">{ind.value}</p>
                {ind.subtitle && <p className="text-xs text-gray-500 mt-1">{ind.subtitle}</p>}
                <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-center gap-1 text-xs text-gray-600">
                  <Info size={10} />
                  <span>{ind.source}</span>
                  {ind.lastUpdate && <span className="ml-auto">{ind.lastUpdate}</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* Projeções + Comparativo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-1 flex items-center gap-2">
              <LineChart size={18} className="text-gray-400" strokeWidth={1.5} />
              Projeção de Valorização (12 meses)
            </h2>
            {projections?.metodologia && (
              <p className="text-xs text-gray-600 mb-4">{projections.metodologia}</p>
            )}
            <div className="space-y-3">
              {(projections?.cenarios || []).map((proj, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                  <span className="text-sm text-gray-300">{proj.cenario}</span>
                  <span className="text-sm font-semibold text-emerald-400">{proj.valor}</span>
                </div>
              ))}
              {(!projections?.cenarios || projections.cenarios.length === 0) && (
                <p className="text-sm text-gray-600">Dados insuficientes para projeção.</p>
              )}
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
              <PieChart size={18} className="text-gray-400" strokeWidth={1.5} />
              Rentabilidade Anual Comparada
            </h2>
            <div className="space-y-3">
              {comparison.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                  <div>
                    <p className="text-sm text-gray-300">{item.asset}</p>
                    <p className="text-xs text-gray-600">{item.source}</p>
                  </div>
                  <span className={`text-sm font-semibold ${idx === 0 ? "text-blue-400" : "text-white"}`}>
                    {item.rentabilidade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financiamento + Notícias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {financing && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
                <Landmark size={18} className="text-gray-400" strokeWidth={1.5} />
                Financiamento Imobiliário
              </h2>
              <div className="space-y-3">
                {[
                  ["Taxa média (TR)", financing.taxaMediaJuros],
                  ["Custo efetivo total", financing.taxaEfetiva],
                  ["LTV máximo", financing.ltv],
                  ["Prazo máximo", financing.prazoMaximo],
                  ["Volume crédito", financing.volumeUltimos12m],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-white">{val}</span>
                  </div>
                ))}
                <p className="text-xs text-gray-600 pt-1">{financing.fonte}</p>
              </div>
            </div>
          )}

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
              <Newspaper size={18} className="text-gray-400" strokeWidth={1.5} />
              Notícias do Setor
            </h2>
            <div className="space-y-4">
              {news.map((item, idx) => (
                <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 group py-2 border-b border-[#2a2a2a] last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300 group-hover:text-blue-400 transition leading-snug">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{item.source}</p>
                  </div>
                  <ExternalLink size={12} className="text-gray-600 group-hover:text-blue-400 transition mt-1 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela regional */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center gap-2">
            <Home size={16} className="text-gray-400" strokeWidth={1.5} />
            <div>
              <h2 className="text-base font-medium text-white">Preço médio do m² por cidade</h2>
              <p className="text-xs text-gray-500">Valores em R$/m² para imóveis residenciais – Secovi e Fipe/ZAP</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#161616]">
                <tr className="text-left text-xs text-gray-600 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Cidade</th>
                  <th className="px-6 py-3 font-medium">UF</th>
                  <th className="px-6 py-3 font-medium">Preço médio (R$/m²)</th>
                  <th className="px-6 py-3 font-medium">Variação 12m</th>
                  <th className="px-6 py-3 font-medium">Fonte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222]">
                {regionalData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#1e1e1e] transition">
                    <td className="px-6 py-3.5 font-medium text-gray-200">{item.city}</td>
                    <td className="px-6 py-3.5 text-gray-500">{item.state}</td>
                    <td className="px-6 py-3.5 text-gray-300">
                      {item.pricePerM2.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className={`px-6 py-3.5 font-medium ${item.variation.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>
                      {item.variation}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600 text-xs">{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fontes */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">Fontes e metodologia</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Indicadores econômicos obtidos em tempo real via API pública do Banco Central do Brasil (SGS/BACEN).
                Dados regionais compilados de Secovi e Fipe/ZAP — atualizados mensalmente.
                Projeções são estimativas baseadas em dados históricos e não constituem recomendação de investimento.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {[["BACEN", "https://www.bcb.gov.br"], ["IBGE", "https://www.ibge.gov.br"], ["FGV", "https://portalibre.fgv.br"], ["Fipe/ZAP", "https://www.fipe.org.br"]].map(([label, url]) => (
                  <a key={label} href={url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">
                    {label} <ExternalLink size={10} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
