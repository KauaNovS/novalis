"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp, Building2, Percent, MapPin, ExternalLink,
  RefreshCw, Info, Newspaper, LineChart, PieChart,
  Landmark, BadgeDollarSign, Home, ChevronRight,
} from "lucide-react";
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
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

const IND_COLORS: Record<string, string> = {
  selic: "#60a5fa", ipca: "#f87171", incc: "#a78bfa", cdi: "#34d399"
};
const IND_ICONS: Record<string, any> = {
  selic: Percent, ipca: TrendingUp, incc: Building2, cdi: BadgeDollarSign
};

function MiniChart({ data, color }: { data: { mes: string; valor: number }[]; color: string }) {
  if (!data || data.length === 0) return (
    <div className="h-14 flex items-center justify-center text-xs text-gray-700">Sem dados</div>
  );
  return (
    <ResponsiveContainer width="100%" height={56}>
      <ReLineChart data={data} margin={{ top: 4, right: 0, left: -40, bottom: 0 }}>
        <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip
          contentStyle={{ background: "#111", border: `1px solid ${color}33`, borderRadius: 8, fontSize: 11 }}
          formatter={(v: any) => [`${Number(v).toFixed(2).replace(".", ",")}%`, ""]}
          labelStyle={{ color: "#666" }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  );
}

export default function MarketIntelligencePage() {
  const router = useRouter();
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
      <div className="max-w-7xl mx-auto space-y-5 animate-pulse">
        <div className="h-7 bg-[#1a1a1a] rounded w-1/3" />
        <div className="h-4 bg-[#1a1a1a] rounded w-1/2" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-[#1a1a1a] rounded-2xl" />)}
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

  const timelineData = timeline?.[activeTimeline] || [];

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium text-white">Inteligência de Mercado</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Dados em tempo real · Banco Central do Brasil (SGS/BACEN)
              {lastRefresh && ` · ${lastRefresh.toLocaleString("pt-BR")}`}
            </p>
          </div>
          <button onClick={async () => { setRefreshing(true); await fetchData(); setRefreshing(false); }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-[#3a3a3a] transition disabled:opacity-50 self-start">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} strokeWidth={1.5} />
            Atualizar
          </button>
        </div>

        {/* Cards clicáveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((ind) => {
            const Icon = IND_ICONS[ind.id] || Info;
            const color = IND_COLORS[ind.id] || "#60a5fa";
            return (
              <button key={ind.id}
                onClick={() => router.push(`/market-intelligence/${ind.id}`)}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 hover:border-[#3a3a3a] hover:bg-[#1e1e1e] transition text-left flex flex-col gap-3 group cursor-pointer w-full">

                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-[#242424]">
                      <Icon size={13} strokeWidth={1.5} style={{ color }} />
                    </div>
                    <span className="text-xs text-gray-500">{ind.title}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      ind.direction === "up" ? "bg-rose-500/10 text-rose-400" :
                      ind.direction === "down" ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-gray-500/10 text-gray-500"}`}>{ind.change}</span>
                    <ChevronRight size={12} className="text-gray-700 group-hover:text-gray-500 transition" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Valores */}
                <div className="flex items-end gap-5">
                  <div>
                    <p className="text-[9px] text-gray-600 mb-0.5 uppercase tracking-wider">No mês</p>
                    <p className="text-lg font-semibold text-white leading-none">{ind.valueMes}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-600 mb-0.5 uppercase tracking-wider">No ano</p>
                    <p className="text-lg font-semibold leading-none" style={{ color }}>{ind.valueAno}</p>
                  </div>
                </div>

                {/* Mini gráfico */}
                <div className="w-full">
                  <MiniChart data={ind.grafico12m} color={color} />
                </div>

                {/* Footer */}
                <div className="flex items-center gap-1 text-[9px] text-gray-700 pt-1 border-t border-[#222]">
                  <Info size={8} />
                  <span>{ind.source}</span>
                  <span className="ml-auto">{ind.lastUpdate}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Timeline histórica */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <LineChart size={16} className="text-gray-400" strokeWidth={1.5} />
                Histórico desde 2000
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">Clique num indicador acima para ver o gráfico detalhado</p>
            </div>
            <div className="flex gap-2">
              {(["selic", "ipca", "incc"] as const).map(key => (
                <button key={key} onClick={() => setActiveTimeline(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${
                    activeTimeline === key ? "border-transparent" : "border-[#2a2a2a] text-gray-500 hover:text-gray-300"}`}
                  style={activeTimeline === key ? { backgroundColor: IND_COLORS[key] + "22", borderColor: IND_COLORS[key] + "44", color: IND_COLORS[key] } : {}}>
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <ReLineChart data={timelineData} margin={{ top: 4, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
              <XAxis dataKey="ano" tick={{ fontSize: 11, fill: "#444" }} tickLine={false} axisLine={false}
                interval={Math.max(0, Math.floor(timelineData.length / 10) - 1)} />
              <YAxis tick={{ fontSize: 11, fill: "#444" }} tickLine={false} axisLine={false}
                tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "#111", border: `1px solid ${IND_COLORS[activeTimeline]}33`, borderRadius: 10, fontSize: 12 }}
                formatter={(v: any) => [`${Number(v).toFixed(2).replace(".", ",")}%`, activeTimeline.toUpperCase()]}
                labelStyle={{ color: "#888" }}
              />
              <Line type="monotone" dataKey="valor" stroke={IND_COLORS[activeTimeline]}
                strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </ReLineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-2">
            {[["2002","Selic 26% – crise eleitoral"],["2008","Crise subprime"],["2016","Impeachment"],["2020","COVID – Selic 2%"],["2022","Alta pós-pandemia"],["2024","Ciclo restritivo atual"]].map(([a,d]) => (
              <span key={a} className="text-[10px] px-2 py-1 bg-[#1e1e1e] rounded-md text-gray-600">
                <strong className="text-gray-500">{a}</strong> · {d}
              </span>
            ))}
          </div>
        </div>

        {/* Projeções + Comparativo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-1 flex items-center gap-2">
              <LineChart size={15} className="text-gray-400" strokeWidth={1.5} />
              Projeção de Valorização (12 meses)
            </h2>
            <p className="text-[11px] text-gray-600 mb-4">{projections?.metodologia}</p>
            {(projections?.cenarios || []).map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#1e1e1e] last:border-0">
                <span className="text-sm text-gray-300">{p.cenario}</span>
                <span className="text-sm font-semibold text-emerald-400">{p.valor}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
              <PieChart size={15} className="text-gray-400" strokeWidth={1.5} />
              Rentabilidade Anual Comparada
            </h2>
            {comparison.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#1e1e1e] last:border-0">
                <div>
                  <p className="text-sm text-gray-300">{item.asset}</p>
                  <p className="text-[10px] text-gray-600">{item.source}</p>
                </div>
                <span className={`text-sm font-semibold ${i === 0 ? "text-blue-400" : "text-white"}`}>{item.rentabilidade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financiamento + Notícias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {financing && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
                <Landmark size={15} className="text-gray-400" strokeWidth={1.5} />
                Financiamento Imobiliário
              </h2>
              {([["Taxa média (TR)", financing.taxaMediaJuros],["Custo efetivo (CET)", financing.taxaEfetiva],["LTV máximo", financing.ltv],["Prazo máximo", financing.prazoMaximo],["Volume crédito", financing.volumeUltimos12m]] as [string,string][]).map(([l,v]) => (
                <div key={l} className="flex justify-between py-2.5 border-b border-[#1e1e1e] last:border-0">
                  <span className="text-sm text-gray-400">{l}</span>
                  <span className="text-sm font-medium text-white">{v}</span>
                </div>
              ))}
              <p className="text-[10px] text-gray-600 pt-2">{financing.fonte}</p>
            </div>
          )}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-4 flex items-center gap-2">
              <Newspaper size={15} className="text-gray-400" strokeWidth={1.5} />
              Notícias do Setor
            </h2>
            {news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2 group py-2.5 border-b border-[#1e1e1e] last:border-0">
                <div className="w-1 h-1 rounded-full bg-blue-500 mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 group-hover:text-blue-400 transition leading-snug">{item.title}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{item.source}</p>
                </div>
                <ExternalLink size={10} className="text-gray-700 group-hover:text-blue-400 transition mt-1 shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Tabela regional */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center gap-2">
            <Home size={14} className="text-gray-400" strokeWidth={1.5} />
            <div>
              <h2 className="text-base font-medium text-white">Preço médio do m² por cidade</h2>
              <p className="text-xs text-gray-500">Secovi e Fipe/ZAP · atualização mensal</p>
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
              <tbody className="divide-y divide-[#1a1a1a]">
                {regionalData.map((item, i) => (
                  <tr key={i} className="hover:bg-[#1e1e1e] transition">
                    <td className="px-6 py-3.5 font-medium text-gray-200">{item.city}</td>
                    <td className="px-6 py-3.5 text-gray-500">{item.state}</td>
                    <td className="px-6 py-3.5 text-gray-300">{item.pricePerM2.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td>
                    <td className={`px-6 py-3.5 font-medium text-sm ${item.variation.startsWith("+") ? "text-emerald-400" : "text-rose-400"}`}>{item.variation}</td>
                    <td className="px-6 py-3.5 text-gray-600 text-xs">{item.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fontes */}
        <div className="flex items-start gap-3 px-1 pb-4">
          <MapPin size={13} className="text-gray-600 mt-0.5 shrink-0" strokeWidth={1.5} />
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Dados econômicos via API pública BACEN/SGS. Dados regionais: Secovi e Fipe/ZAP. Projeções são estimativas — não constituem recomendação de investimento.
            {" "}{[["BACEN","https://www.bcb.gov.br"],["IBGE","https://www.ibge.gov.br"],["FGV","https://portalibre.fgv.br"],["Fipe/ZAP","https://www.fipe.org.br"]].map(([l,u]) => (
              <a key={l} href={u} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-400 inline-flex items-center gap-0.5">
                {l} <ExternalLink size={9} />
              </a>
            ))}
          </p>
        </div>

      </div>
    </main>
  );
}
