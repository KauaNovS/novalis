"use client";

import { useEffect, useState, useRef } from "react";
import { ExternalLink, RefreshCw, Info, Newspaper, LineChart as LineIcon, PieChart as PieIcon, Landmark, BadgeDollarSign, Home, MapPin, TrendingUp, Building2, Percent, ArrowLeft } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";

interface Indicator { id:string; title:string; valueMes:string; valueAno:string; change:string; direction:"up"|"down"|"neutral"; source:string; lastUpdate:string; grafico12m:{mes:string;valor:number}[]; }
interface RegionalData { city:string; state:string; pricePerM2:number; variation:string; source:string; }
interface Projection { cenario:string; valor:string; }
interface CompItem { asset:string; rentabilidade:string; source:string; }
interface Financing { taxaMediaJuros:string; taxaEfetiva:string; ltv:string; prazoMaximo:string; volumeUltimos12m:string; fonte:string; }
interface NewsItem { title:string; url:string; source:string; }
interface Timeline { selic:{ano:string;valor:number}[]; ipca:{ano:string;valor:number}[]; incc:{ano:string;valor:number}[]; }

const CARD_COLORS: Record<string,string> = { selic:"#60a5fa", ipca:"#f87171", incc:"#a78bfa", cdi:"#34d399" };
const iconMap: Record<string,any> = { selic:Percent, ipca:TrendingUp, incc:Building2, cdi:BadgeDollarSign };
const MARCOS = [
  { ano:"2002", label:"Crise eleitoral\nSelic 26%" },
  { ano:"2008", label:"Crise subprime" },
  { ano:"2015", label:"Recessão\nSelic 14,25%" },
  { ano:"2020", label:"COVID\nSelic 2%" },
  { ano:"2022", label:"Alta pós-pandemia" },
];

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{Number(payload[0].value).toFixed(2).replace(".",",")}%</p>
    </div>
  );
}

export default function MarketIntelligencePage() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalData[]>([]);
  const [projections, setProjections] = useState<{cenarios:Projection[];metodologia:string}|null>(null);
  const [comparison, setComparison] = useState<CompItem[]>([]);
  const [financing, setFinancing] = useState<Financing|null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [timeline, setTimeline] = useState<Timeline|null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date|null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCard, setActiveCard] = useState<string|null>(null);
  const [activeTimeline, setActiveTimeline] = useState<"selic"|"ipca"|"incc">("selic");
  const detailRef = useRef<HTMLDivElement>(null);

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
    } catch (err:any) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCardClick = (id: string) => {
    const tl = id === "cdi" ? "selic" : id as any;
    setActiveCard(id);
    setActiveTimeline(tl in (timeline||{}) ? tl : "selic");
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  if (loading) return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5 animate-pulse">
        <div className="h-7 bg-[#1a1a1a] rounded w-64" />
        <div className="h-4 bg-[#1a1a1a] rounded w-96" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[...Array(4)].map((_,i) => <div key={i} className="h-48 bg-[#1a1a1a] rounded-2xl" />)}
        </div>
      </div>
    </main>
  );

  if (error) return (
    <main className="min-h-screen bg-[#0f0f0f] p-8 flex items-center justify-center">
      <div className="text-center">
        <p className="text-rose-400 mb-3">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300">Tentar novamente</button>
      </div>
    </main>
  );

  const activeInd = indicators.find(x => x.id === activeCard);
  const tlData = activeTimeline && timeline ? (timeline as any)[activeTimeline] || [] : [];
  const tlColor = CARD_COLORS[activeTimeline] || "#60a5fa";

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium text-white">Inteligência de Mercado</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Dados em tempo real via BACEN/SGS
              {lastRefresh && ` · Atualizado: ${lastRefresh.toLocaleString("pt-BR")}`}
            </p>
          </div>
          <button onClick={async()=>{setRefreshing(true);await fetchData();setRefreshing(false);}} disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-[#3a3a3a] transition disabled:opacity-50 self-start">
            <RefreshCw size={14} className={refreshing?"animate-spin":""} strokeWidth={1.5} />
            Atualizar
          </button>
        </div>

        {/* Cards clicáveis */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map(ind => {
            const Icon = iconMap[ind.id] || Info;
            const color = CARD_COLORS[ind.id];
            const isActive = activeCard === ind.id;
            return (
              <button key={ind.id} onClick={() => handleCardClick(ind.id)}
                className={`text-left bg-[#1a1a1a] border rounded-2xl p-5 transition cursor-pointer w-full flex flex-col gap-3
                  ${isActive ? `border-[${color}]/40 shadow-lg` : "border-[#2a2a2a] hover:border-[#3a3a3a]"}`}
                style={isActive ? { borderColor: color + "66" } : {}}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg" style={{ background: color + "18" }}>
                      <Icon size={14} strokeWidth={1.5} style={{ color }} />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{ind.title}</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    ind.direction==="up" ? "bg-rose-500/10 text-rose-400" :
                    ind.direction==="down" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-gray-500/10 text-gray-500"}`}>{ind.change}</span>
                </div>

                <div className="flex items-end gap-5">
                  <div>
                    <p className="text-[9px] text-gray-600 uppercase tracking-wide mb-0.5">No mês</p>
                    <p className="text-2xl font-bold text-white">{ind.valueMes}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-600 uppercase tracking-wide mb-0.5">No ano / a.a.</p>
                    <p className="text-2xl font-bold" style={{ color }}>{ind.valueAno}</p>
                  </div>
                </div>

                {/* Mini gráfico 12m */}
                {ind.grafico12m.length > 0 && (
                  <ResponsiveContainer width="100%" height={52}>
                    <LineChart data={ind.grafico12m} margin={{top:2,right:2,left:-40,bottom:0}}>
                      <Line type="monotone" dataKey="valor" stroke={color} strokeWidth={1.5} dot={false} />
                      <Tooltip content={<CustomTooltip />} />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                <div className="flex items-center gap-1 text-[9px] text-gray-600 pt-1 border-t border-[#222]">
                  <Info size={9} /><span>{ind.source}</span>
                  <span className="ml-auto">{ind.lastUpdate}</span>
                </div>
                <p className="text-[9px] text-gray-600 -mt-2">Clique para ver o histórico completo →</p>
              </button>
            );
          })}
        </div>

        {/* Painel de detalhe (aparece ao clicar no card) */}
        {activeCard && (
          <div ref={detailRef} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <button onClick={()=>setActiveCard(null)} className="text-gray-500 hover:text-gray-300 transition">
                    <ArrowLeft size={16} strokeWidth={1.5} />
                  </button>
                  <h2 className="text-base font-medium text-white">
                    {activeInd?.title} — Histórico & Gráfico Anual
                  </h2>
                </div>
                <p className="text-xs text-gray-600 ml-7">Dados anuais desde 2000 via BACEN/SGS</p>
              </div>
              {activeCard !== "cdi" && (
                <div className="flex gap-2">
                  {(["selic","ipca","incc"] as const).map(k => (
                    <button key={k} onClick={()=>setActiveTimeline(k)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${
                        activeTimeline===k
                          ? "text-white border-transparent"
                          : "bg-transparent text-gray-500 border-[#2a2a2a] hover:text-gray-300"
                      }`}
                      style={activeTimeline===k ? {background: CARD_COLORS[k]+"33", borderColor: CARD_COLORS[k]+"55", color: CARD_COLORS[k]} : {}}>
                      {k.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Gráfico histórico grande */}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tlData} margin={{top:8,right:16,left:-16,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis dataKey="ano" tick={{fontSize:11,fill:"#555"}} tickLine={false} axisLine={false}
                  interval={Math.max(0, Math.floor(tlData.length/14)-1)} />
                <YAxis tick={{fontSize:11,fill:"#555"}} tickLine={false} axisLine={false}
                  tickFormatter={v=>`${v}%`} />
                <Tooltip content={<CustomTooltip />} />
                {MARCOS.map(m => (
                  <ReferenceLine key={m.ano} x={m.ano} stroke="#333" strokeDasharray="4 2"
                    label={{value:m.ano, position:"insideTopRight", fontSize:9, fill:"#555"}} />
                ))}
                <Line type="monotone" dataKey="valor" stroke={tlColor} strokeWidth={2}
                  dot={false} activeDot={{r:5, fill:tlColor, stroke:"#111", strokeWidth:2}} />
              </LineChart>
            </ResponsiveContainer>

            {/* Marcos históricos */}
            <div className="flex flex-wrap gap-2">
              {MARCOS.map(m => (
                <span key={m.ano} className="px-2.5 py-1 bg-[#222] rounded-lg text-[10px] text-gray-500">
                  <strong className="text-gray-400">{m.ano}</strong> · {m.label.replace('\n',' ')}
                </span>
              ))}
            </div>

            {/* Gráfico 12 meses */}
            {activeInd && activeInd.grafico12m.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-3 font-medium">Últimos 12 meses — {activeInd.title}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={activeInd.grafico12m} margin={{top:4,right:8,left:-16,bottom:0}}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                    <XAxis dataKey="mes" tick={{fontSize:10,fill:"#555"}} tickLine={false} axisLine={false} />
                    <YAxis tick={{fontSize:10,fill:"#555"}} tickLine={false} axisLine={false} tickFormatter={v=>`${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="valor" stroke={CARD_COLORS[activeCard]||"#60a5fa"}
                      strokeWidth={2} dot={{r:3, fill:CARD_COLORS[activeCard]||"#60a5fa", stroke:"#111", strokeWidth:1.5}}
                      activeDot={{r:5}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Projeções + Comparativo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-1 flex items-center gap-2">
              <LineIcon size={15} className="text-gray-400" strokeWidth={1.5} />Projeção de Valorização (12 meses)
            </h2>
            <p className="text-[11px] text-gray-600 mb-4">{projections?.metodologia}</p>
            {(projections?.cenarios||[]).map((p,i)=>(
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#222] last:border-0">
                <span className="text-sm text-gray-300">{p.cenario}</span>
                <span className="text-sm font-bold text-emerald-400">{p.valor}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <PieIcon size={15} className="text-gray-400" strokeWidth={1.5} />Rentabilidade Anual Comparada
            </h2>
            {comparison.map((item,i)=>(
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#222] last:border-0">
                <div><p className="text-sm text-gray-300">{item.asset}</p><p className="text-[10px] text-gray-600">{item.source}</p></div>
                <span className={`text-sm font-bold ${i===0?"text-blue-400":"text-white"}`}>{item.rentabilidade}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financiamento + Notícias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {financing && (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
              <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                <Landmark size={15} className="text-gray-400" strokeWidth={1.5} />Financiamento Imobiliário
              </h2>
              {([["Taxa média (TR)",financing.taxaMediaJuros],["CET",financing.taxaEfetiva],["LTV máx.",financing.ltv],["Prazo máx.",financing.prazoMaximo],["Volume crédito",financing.volumeUltimos12m]] as [string,string][]).map(([l,v])=>(
                <div key={l} className="flex justify-between py-2.5 border-b border-[#222] last:border-0">
                  <span className="text-sm text-gray-400">{l}</span>
                  <span className="text-sm font-medium text-white">{v}</span>
                </div>
              ))}
              <p className="text-[10px] text-gray-600 pt-2">{financing.fonte}</p>
            </div>
          )}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
              <Newspaper size={15} className="text-gray-400" strokeWidth={1.5} />Notícias do Setor
            </h2>
            {news.map((item,i)=>(
              <a key={i} href={item.url} target="_blank" rel="noopener noreferrer"
                className="flex items-start gap-2 group py-2.5 border-b border-[#222] last:border-0">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"/>
                <div className="flex-1"><p className="text-sm text-gray-300 group-hover:text-blue-400 transition leading-snug">{item.title}</p><p className="text-[10px] text-gray-600 mt-0.5">{item.source}</p></div>
                <ExternalLink size={11} className="text-gray-600 group-hover:text-blue-400 transition mt-1 shrink-0"/>
              </a>
            ))}
          </div>
        </div>

        {/* Tabela regional */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center gap-2">
            <Home size={14} className="text-gray-400" strokeWidth={1.5}/>
            <div>
              <h2 className="text-sm font-medium text-white">Preço médio do m² por cidade</h2>
              <p className="text-[11px] text-gray-500">Secovi e Fipe/ZAP – atualização mensal</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#161616]">
                <tr className="text-left text-[10px] text-gray-600 uppercase tracking-wider">
                  {["Cidade","UF","Preço médio (R$/m²)","Variação 12m","Fonte"].map(h=><th key={h} className="px-6 py-3 font-medium">{h}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {regionalData.map((item,i)=>(
                  <tr key={i} className="hover:bg-[#1e1e1e] transition">
                    <td className="px-6 py-3.5 font-medium text-gray-200">{item.city}</td>
                    <td className="px-6 py-3.5 text-gray-500">{item.state}</td>
                    <td className="px-6 py-3.5 text-gray-300">{item.pricePerM2.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
                    <td className={`px-6 py-3.5 font-medium ${item.variation.startsWith("+")?"text-emerald-400":"text-rose-400"}`}>{item.variation}</td>
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
            <MapPin size={14} className="text-gray-600 mt-0.5 shrink-0" strokeWidth={1.5}/>
            <div>
              <p className="text-xs text-gray-600 leading-relaxed">Indicadores em tempo real via API pública BACEN/SGS. Dados regionais: Secovi e Fipe/ZAP (mensal). Projeções são estimativas — não constituem recomendação de investimento.</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {[["BACEN","https://www.bcb.gov.br"],["IBGE","https://www.ibge.gov.br"],["FGV","https://portalibre.fgv.br"],["Fipe/ZAP","https://www.fipe.org.br"]].map(([l,u])=>(
                  <a key={l} href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition">{l} <ExternalLink size={10}/></a>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
