"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, Building2, Percent, BadgeDollarSign, Info } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";

const META: Record<string, { title: string; subtitle: string; color: string; icon: any; desc: string }> = {
  selic: { title: "Taxa Selic", subtitle: "Decisão do COPOM – % a.a.", color: "#60a5fa", icon: Percent,
    desc: "A Selic é a taxa básica de juros da economia brasileira, definida pelo COPOM. Ela baliza todas as outras taxas — do crédito imobiliário a CDBs. Quanto maior a Selic, mais caro fica o financiamento e mais atrativa fica a renda fixa." },
  ipca: { title: "IPCA", subtitle: "Inflação oficial – % a.m.", color: "#f87171", icon: TrendingUp,
    desc: "O IPCA é o índice oficial de inflação do Brasil, medido pelo IBGE. A meta é 3% ao ano (±1,5pp). Para o mercado imobiliário, o IPCA baliza reajustes de aluguel e contratos de longo prazo." },
  incc: { title: "INCC", subtitle: "Custo da construção – % a.m.", color: "#a78bfa", icon: Building2,
    desc: "O INCC mede a variação de custos de mão de obra e materiais da construção civil, calculado pela FGV. É usado para reajustar contratos de imóveis na planta durante a obra." },
  cdi: { title: "CDI", subtitle: "Referência de renda fixa – % a.m.", color: "#34d399", icon: BadgeDollarSign,
    desc: "O CDI é a taxa de referência para investimentos de renda fixa no Brasil, andando próximo à Selic. CDBs, LCIs, LCAs e fundos DI têm rentabilidade atrelada ao CDI." },
};

const MARCOS = [
  { ano: "2002", desc: "Selic 26% – crise eleitoral" },
  { ano: "2008", desc: "Crise subprime" },
  { ano: "2015", desc: "Recessão – Selic 14,25%" },
  { ano: "2020", desc: "COVID – Selic 2%" },
  { ano: "2022", desc: "Alta pós-pandemia" },
  { ano: "2024", desc: "Ciclo restritivo atual" },
];

export default function IndicadorDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const meta = META[id];

  const [ind, setInd] = useState<any>(null);
  const [hist, setHist] = useState<{ ano: string; valor: number }[]>([]);
  const [grafico12m, setGrafico12m] = useState<{ mes: string; valor: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"historico" | "12m">("historico");

  useEffect(() => {
    if (!id) return;
    fetch("/api/market-intelligence")
      .then(r => r.json())
      .then(d => {
        const found = (d.indicators || []).find((i: any) => i.id === id);
        const tl: { ano: string; valor: number }[] = d.timeline?.[id] || [];
        setInd(found || null);
        setHist(tl);
        setGrafico12m(found?.grafico12m || []);
        // Padrão: se tem histórico, mostra histórico; senão mostra 12m
        setTab(tl.length > 0 ? "historico" : "12m");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (!meta) return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
      <p className="text-gray-500">Indicador não encontrado.</p>
    </main>
  );

  const Icon = meta.icon;
  const chartData = tab === "historico" ? hist : grafico12m;
  const xKey = tab === "historico" ? "ano" : "mes";
  const vals = chartData.map(d => d.valor).filter(v => typeof v === "number" && !isNaN(v));
  const minVal = vals.length ? Math.floor(Math.min(...vals) * 0.85) : 0;
  const maxVal = vals.length ? Math.ceil(Math.max(...vals) * 1.1) : 30;

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-5">

        <button onClick={() => router.push("/market-intelligence")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition">
          <ArrowLeft size={15} strokeWidth={1.5} /> Voltar para Mercado
        </button>

        {/* Header com valores */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="p-3 rounded-xl bg-[#222]">
            <Icon size={22} strokeWidth={1.5} style={{ color: meta.color }} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">{meta.title}</h1>
            <p className="text-sm text-gray-500">{meta.subtitle}</p>
          </div>
          {ind ? (
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-gray-600 mb-1">No mês</p>
                <p className="text-2xl font-bold text-white">{ind.valueMes}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">No ano / a.a.</p>
                <p className="text-2xl font-bold" style={{ color: meta.color }}>{ind.valueAno}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="h-10 w-40 bg-[#222] rounded-xl animate-pulse" />
          ) : null}
        </div>

        {/* Descrição */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 flex gap-3">
          <Info size={15} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.5} />
          <p className="text-sm text-gray-400 leading-relaxed">{meta.desc}</p>
        </div>

        {/* Gráfico */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-medium text-white">Evolução histórica</h2>
              {tab === "historico" && (
                <p className="text-xs text-gray-600 mt-0.5">Dados anuais oficiais desde 2000 · BACEN/SGS</p>
              )}
            </div>
            <div className="flex gap-2">
              {(["historico", "12m"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition border"
                  style={tab === t
                    ? { backgroundColor: meta.color + "22", borderColor: meta.color + "44", color: meta.color }
                    : { backgroundColor: "transparent", borderColor: "#2a2a2a", color: "#666" }}>
                  {t === "historico" ? "Desde 2000" : "Últimos 12 meses"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#333] border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-600 text-sm">
              Dados não disponíveis para este período
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 8, right: 20, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis
                  dataKey={xKey}
                  tick={{ fontSize: 11, fill: "#555" }}
                  tickLine={false}
                  axisLine={false}
                  interval={tab === "historico"
                    ? Math.max(0, Math.floor(chartData.length / 12))
                    : 0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#555" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}%`}
                  domain={[minVal, maxVal]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: `1px solid ${meta.color}44`,
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  formatter={(v: any) => [
                    `${Number(v).toFixed(2).replace(".", ",")}%`,
                    meta.title,
                  ]}
                  labelStyle={{ color: "#888", marginBottom: 4 }}
                />
                {tab === "historico" && MARCOS.map(m => (
                  <ReferenceLine
                    key={m.ano} x={m.ano}
                    stroke="#2a2a2a" strokeDasharray="4 3"
                    label={{ value: m.ano, position: "insideTopLeft", fontSize: 9, fill: "#444" }}
                  />
                ))}
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke={meta.color}
                  strokeWidth={2}
                  dot={tab === "historico" ? { r: 3, fill: meta.color, strokeWidth: 0 } : false}
                  activeDot={{ r: 5, fill: meta.color, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {tab === "historico" && hist.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {MARCOS.map(m => (
                <span key={m.ano} className="text-[10px] px-2 py-1 bg-[#1e1e1e] rounded-md text-gray-600">
                  <strong className="text-gray-400">{m.ano}</strong> · {m.desc}
                </span>
              ))}
            </div>
          )}
        </div>

        {ind && (
          <p className="text-xs text-gray-600 px-1">
            Fonte: {ind.source} · Última atualização: {ind.lastUpdate}
          </p>
        )}
      </div>
    </main>
  );
}
