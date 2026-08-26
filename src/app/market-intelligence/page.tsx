"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, Building2, Percent, MapPin, ExternalLink,
  RefreshCw, Info, Newspaper, LineChart, PieChart,
  Landmark, BadgeDollarSign, Home,
} from "lucide-react";
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

interface Indicator {
  id: string; title: string;
  valueMes: string; valueAno: string;
  change: string; direction: "up" | "down" | "neutral";
  source: string; lastUpdate: string;
  grafico12m: { mes: string; valor: number }[];
}
interface RegionalData { city: string; state: string; pricePerM2: number; variation: string; source: string; }
interface Projection { cenario: string; valor: string; }
interface CompItem { asset: string; rentabilidade: string; source: string; }
interface Financing { taxaMediaJuros: string; taxaEfetiva: string; ltv: string; prazoMaximo: string; volumeUltimos12m: string; fonte: string; }
interface NewsItem { title: string; url: string; source: string; }
interface Timeline { selic: {ano:string;valor:number}[]; ipca: {ano:string;valor:number}[]; incc: {ano:string;valor:number}[]; }

const COLORS = { selic: "#60a5fa", ipca: "#f87171", incc: "#a78bfa" };

function MiniChart({ data }: { data: { mes: string; valor: number }[] }) {
  if (!data || data.length === 0) return <div className="h-16 flex items-center justify-center text-xs text-gray-600">Sem dados</div>;
  return (
    <ResponsiveContainer width="100%" height={56}>
      <ReLineChart data={data} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
        <Line type="monotone" dataKey="valor" stroke="#60a5fa" strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, fontSize: 11 }}
          formatter={(v: any) => [`${Number(v).toFixed(2).replace(".", ",")}%`, ""]}
          labelStyle={{ color: "#888" }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}

export default function MarketIntelligencePage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [projections, setProjections] = useState<{ cenarios: Projection[]; metodologia: string } | null>(null);
  const [comparison, setComparison] = useState<CompItem[]>([]);
  const [financing, setFinancing] = useState<Financing | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTimeline, setActiveTimeline] = useState<"selic" | "ipca" | "incc">("selic");

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/market-intelligence");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setIndicators(data.indicators || []);
      setRegionalData(data.regionalData || []);
      setProjections(data.projections || null);
      setComparison(data.investmentComparison || []);
      setFinancing(data.financing || null);
      setNews(data.news || []);
      setTimeline(data.timeline || null);
      setLastRefresh(new Date(data.lastUpdate));
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-[#1a1a1a] rounded w-1/3" />
        <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-[#1a1a1a] rounded-2xl" />)}
        </div>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-[#0f0f0f] p-8 flex items-center justify-center">
      <div className="text-center">
        <p className="text-rose-400 mb-4">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-sm">Tentar novamente</button>
      </div>
    </main>
  );

  const iconMap: Record<string, any> = { selic: Percent, ipca: TrendingUp, incc: Building2, cdi: BadgeDollarSign };
  const timelineData = timeline?.[activeTimeline] || [];
  const timelineLabel = { selic: "Selic % a.a.", ipca: "IPCA % a.m.", incc: "INCC % a.m." };

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium text-white">Inteligência de Mercado</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Dados em tempo real via Banco Central do Brasil (SGS/BACEN)
              {lastRefresh && ` · Atualizado: ${lastRefresh.toLocaleString("pt-BR")}`}
            </p>
          </div>
          <button onClick={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-[#3a3a3a] transition disabled:opacity-50 self-start">
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} strokeWidth={1.5} />
            Atualizar
          </button>
        </div>

        {/* Cards indicadores com mini gráfico */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((ind) => {
            const Icon = iconMap[ind.id] || Info;
            return (
              <div key={ind.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 hover:border-[#3a3a3a] transition flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#222]">
                      <Icon size={14} strokeWidth={1.5} className="text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-500">{ind.title}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    ind.direction === "up" ? "bg-rose-500/10 text-rose-400" :
                    ind.direction === "down" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-gray-500/10 text-gray-500"}`}>{ind.change}</span>
                </div>

                {/* Valores mês / ano */}
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">No mês</p>
                    <p className="text-xl font-semibold text-white">{ind.valueMes}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600 mb-0.5">No ano / a.a.</p>
                    <p className="text-xl font-semibold text-blue-400">{ind.valueAno}</p>
                  </div>
                </div>

                {/* Mini gráfico 12 meses */}
                <MiniChart data={ind.grafico12m} />

                <div className="flex items-center gap-1 text-[10px] text-gray-600 pt-1 border-t border-[#222]">
                  <Info size={9} />
                  <span>{ind.source}</span>
                  <span className="ml-auto">{ind.lastUpdate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline histórica desde 2000 */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <LineChart size={17} className="text-gray-400" strokeWidth={1.5} />
                Histórico desde 2000
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">Evolução anual dos principais índices econômicos</p>
            </div>
            <div className="flex gap-2">
              {(["selic", "ipca", "incc"] as const).map(key => (
                <button key={key} onClick={() => setActiveTimeline(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    activeTimeline === key
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "bg-[#222] text-gray-500 border border-[#2a2a2a] hover:text-gray-300"}`}>
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <ReLineChart data={timelineData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="ano" tick={{ fontSize: 11, fill: "#555" }} tickLine={false} axisLine={false}
                interval={Math.max(0, Math.floor(timelineData.length / 12) - 1)} />
              <YAxis tick={{ fontSize: 11, fill: "#555" }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 10, fontSize: 12 }}
                formatter={(v: any) => [`${Number(v).toFixed(2).replace(".", ",")}%`, timelineLabel[activeTimeline]]}
                labelStyle={{ color: "#aaa", marginBottom: 4 }}
              />
              <Line type="monotone" dataKey="valor" stroke={COLORS[activeTimeline]}
                strokeWidth={2} dot={false} activeDot={{ r: 4, fill: COLORS[activeTimeline] }} />
            </ReLineChart>
          </ResponsiveContainer>
          {/* Marcos históricos */}
          <div className="mt-4 flex flex-wrap gap-3 text-[10px] text-gray-600">
            {[["2002", "Crise eleitoral – Selic 26%"], ["2008", "Crise subprime"], ["2015", "Recessão – Selic 14,25%"], ["2020", "COVID – Selic 2%"], ["2022", "Alta pós-pandemia"], ["2024", "Ciclo restritivo atual"]].map(([ano, desc]) => (
              <span key={ano} className="px-2 py-1 bg-[#222] rounded-md"><strong className="text-gray-400">{ano}</strong> · {desc}</span>
            ))}
          </div>
        </div>

        {/* Projeções + Comparativo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-1 flex items-center gap-2">
              <LineChart size={16} className="text-gray-400" strokeWidth={1.5} />
              Projeção de Valorização (12 meses)
            </h2>
            <p className="text-xs text-gray-600 mb-4">{projections?.metodologia}</p>
            <div className="space-y-1">
              {(projections?.cenarios || []).map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#222] last:border-0">
                  <span className="text-sm text-gray-300">{p.cenario}</span>
                  <span className="text-sm font-semibold text-emerald-400">{p.valor}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
              <PieChart size={16} className="text-gray-400" strokeWidth={1.5} />
              Rentabilidade Anual Comparada
            </h2>
            <div className="space-y-1">
              {comparison.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#222] last:border-0">
                  <div>
                    <p className="text-sm text-gray-300">{item.asset}</p>
                    <p className="text-[10px] text-gray-600">{item.source}</p>
                  </div>
                  <span className={`text-sm font-semibold ${i === 0 ? "text-blue-400" : "text-white"}`}>{item.rentabilidade}</span>
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
                <Landmark size={16} className="text-gray-400" strokeWidth={1.5} />
                Financiamento Imobiliário
              </h2>
              <div className="space-y-1">
                {([["Taxa média (TR)", financing.taxaMediaJuros], ["Custo efetivo total", financing.taxaEfetiva], ["LTV máximo", financing.ltv], ["Prazo máximo", financing.prazoMaximo], ["Volume crédito", financing.volumeUltimos12m]] as [string,string][]).map(([l, v]) => (
                  <div key={l} className="flex justify-between py-2.5 border-b border-[#222] last:border-0">
                    <span className="text-sm text-gray-400">{l}</span>
                    <span className="text-sm font-medium text-white">{v}</span>
                  </div>
                ))}
                <p className="text-[10px] text-gray-600 pt-2">{financing.fonte}</p>
              </div>
            </div>
          )}

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
              <Newspaper size={16} className="text-gray-400" strokeWidth={1.5} />
              Notícias do Setor
            </h2>
            <div className="space-y-1">
              {news.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 group py-2.5 border-b border-[#222] last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 group-hover:text-blue-400 transition leading-snug">{item.title}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{item.source}</p>
                  </div>
                  <ExternalLink size={11} className="text-gray-600 group-hover:text-blue-400 transition mt-1 shrink-0" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Tabela regional */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center gap-2">
            <Home size={15} className="text-gray-400" strokeWidth={1.5} />
            <div>
              <h2 className="text-base font-medium text-white">Preço médio do m² por cidade</h2>
              <p className="text-xs text-gray-500">Secovi e Fipe/ZAP – atualização mensal</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#161616]">
                <tr className="text-left text-[10px] text-gray-600 uppercase tracking-wider">
                  {["Cidade","UF","Preço médio (R$/m²)","Variação 12m","Fonte"].map(h => (
                    <th key={h} className="px-6 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {regionalData.map((item, i) => (
                  <tr key={i} className="hover:bg-[#1e1e1e] transition">
                    <td className="px-6 py-3.5 font-medium text-gray-200">{item.city}</td>
                    <td className="px-6 py-3.5 text-gray-500">{item.state}</td>
                    <td className="px-6 py-3.5 text-gray-300">{item.pricePerM2.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className={`px-6 py-3.5 font-medium ${item.variation.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{item.variation}</td>
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
            <MapPin size={15} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Indicadores econômicos obtidos em tempo real via API pública do Banco Central do Brasil (SGS/BACEN).
                Dados regionais compilados de Secovi e Fipe/ZAP. Projeções são estimativas e não constituem recomendação de investimento.
              </p>
              <div className="mt-2 flex flex-wrap gap-3">
                {[["BACEN","https://www.bcb.gov.br"],["IBGE","https://www.ibge.gov.br"],["FGV","https://portalibre.fgv.br"],["Fipe/ZAP","https://www.fipe.org.br"]].map(([l,u]) => (
                  <a key={l} href={u} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">
                    {l} <ExternalLink size={10} />
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
