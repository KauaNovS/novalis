"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, TrendingUp, Building2, Percent, BadgeDollarSign, Info,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";

const META = {
  selic: { title: "Taxa Selic", subtitle: "Decisão do COPOM – % a.a.", color: "#60a5fa", icon: Percent, desc: "A Selic é a taxa básica de juros da economia brasileira. Definida pelo COPOM (Banco Central), ela baliza todas as outras taxas do mercado — de crédito imobiliário a CDBs. Quanto maior a Selic, mais caro fica o financiamento e mais atrativo fica a renda fixa." },
  ipca:  { title: "IPCA", subtitle: "Inflação oficial – % a.m.", color: "#f87171", icon: TrendingUp, desc: "O IPCA (Índice Nacional de Preços ao Consumidor Amplo) é o índice oficial de inflação do Brasil, medido pelo IBGE. A meta é de 3% ao ano (±1,5pp). Para o mercado imobiliário, o IPCA baliza reajustes de aluguel e contratos de longo prazo." },
  incc:  { title: "INCC", subtitle: "Custo da construção – % a.m.", color: "#a78bfa", icon: Building2, desc: "O INCC (Índice Nacional de Custo da Construção) mede a variação de custos de mão de obra e materiais do setor de construção civil, calculado pela FGV. É usado para reajustar contratos de imóveis na planta durante a obra." },
  cdi:   { title: "CDI", subtitle: "Referência de renda fixa – % a.m.", color: "#34d399", icon: BadgeDollarSign, desc: "O CDI (Certificado de Depósito Interbancário) é a taxa de referência para investimentos de renda fixa no Brasil. Anda próximo à Selic. CDBs, LCIs, LCAs e fundos DI têm rentabilidade atrelada ao CDI." },
};

const MARCOS = [
  { ano: "2002", desc: "Crise eleitoral – Selic 26%" },
  { ano: "2008", desc: "Crise subprime" },
  { ano: "2015", desc: "Recessão – Selic 14,25%" },
  { ano: "2020", desc: "COVID – Selic 2%" },
  { ano: "2022", desc: "Alta pós-pandemia" },
  { ano: "2024", desc: "Ciclo restritivo atual" },
];

export default function IndicadorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const meta = META[id as keyof typeof META];

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"12m" | "historico">("12m");

  useEffect(() => {
    fetch("/api/market-intelligence")
      .then(r => r.json())
      .then(d => {
        const ind = (d.indicators || []).find((i: any) => i.id === id);
        const tl = d.timeline?.[id] || [];
        setData({ ind, timeline: tl });
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
  const ind = data?.ind;
  const chartData12m = ind?.grafico12m || [];
  const chartDataHist = data?.timeline || [];
  const chartData = tab === "12m" ? chartData12m : chartDataHist;
  const xKey = tab === "12m" ? "mes" : "ano";

  const vals = chartData.map((d: any) => d.valor).filter((v: any) => typeof v === "number");
  const minVal = vals.length ? Math.floor(Math.min(...vals) * 0.9) : 0;
  const maxVal = vals.length ? Math.ceil(Math.max(...vals) * 1.1) : 10;

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* Voltar */}
        <button onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition">
          <ArrowLeft size={15} strokeWidth={1.5} /> Voltar para Mercado
        </button>

        {/* Header */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-[#222]">
            <Icon size={24} strokeWidth={1.5} style={{ color: meta.color }} />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-white">{meta.title}</h1>
            <p className="text-sm text-gray-500">{meta.subtitle}</p>
          </div>
          {ind && (
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">No mês</p>
                <p className="text-2xl font-bold text-white">{ind.valueMes}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">No ano / a.a.</p>
                <p className="text-2xl font-bold" style={{ color: meta.color }}>{ind.valueAno}</p>
              </div>
            </div>
          )}
        </div>

        {/* Descrição */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 flex gap-3">
          <Info size={15} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.5} />
          <p className="text-sm text-gray-400 leading-relaxed">{meta.desc}</p>
        </div>

        {/* Gráfico */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-medium text-white">Evolução histórica</h2>
            <div className="flex gap-2">
              {(["12m", "historico"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition border ${
                    tab === t
                      ? "text-white border-transparent"
                      : "text-gray-500 border-[#2a2a2a] hover:text-gray-300"}`}
                  style={tab === t ? { backgroundColor: meta.color + "33", borderColor: meta.color + "55", color: meta.color } : {}}>
                  {t === "12m" ? "Últimos 12 meses" : "Desde 2000"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-600 text-sm">
              Dados não disponíveis
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e1e" />
                <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#555" }} tickLine={false} axisLine={false}
                  interval={tab === "historico" ? Math.max(0, Math.floor(chartData.length / 10) - 1) : 0} />
                <YAxis tick={{ fontSize: 11, fill: "#555" }} tickLine={false} axisLine={false}
                  tickFormatter={v => `${v}%`} domain={[minVal, maxVal]} />
                <Tooltip
                  contentStyle={{ background: "#111", border: `1px solid ${meta.color}33`, borderRadius: 10, fontSize: 12 }}
                  formatter={(v: any) => [`${Number(v).toFixed(2).replace(".", ",")}%`, meta.title]}
                  labelStyle={{ color: "#888", marginBottom: 4 }}
                />
                {tab === "historico" && MARCOS.map(m => (
                  <ReferenceLine key={m.ano} x={m.ano} stroke="#333" strokeDasharray="4 4"
                    label={{ value: m.ano, position: "top", fontSize: 9, fill: "#555" }} />
                ))}
                <Line type="monotone" dataKey="valor" stroke={meta.color}
                  strokeWidth={2} dot={false} activeDot={{ r: 5, fill: meta.color, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* Marcos históricos */}
          {tab === "historico" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {MARCOS.map(m => (
                <span key={m.ano} className="text-[10px] px-2 py-1 bg-[#222] rounded-md text-gray-500">
                  <strong className="text-gray-400">{m.ano}</strong> · {m.desc}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Fonte */}
        {ind && (
          <div className="text-xs text-gray-600 px-1">
            Fonte: {ind.source} · Última atualização: {ind.lastUpdate}
          </div>
        )}
      </div>
    </main>
  );
}
