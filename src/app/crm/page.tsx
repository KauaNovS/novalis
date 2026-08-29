"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Repeat,
  Calendar,
  CheckCircle2,
  XCircle,
  PhoneCall,
  Send,
  Clock,
  Ban,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  assignedUser?: { name: string } | null;
}

interface Deal {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  client: { name: string };
}

interface DashboardData {
  totals: {
    totalClients: number;
    totalLeads: number;
    totalContacted: number;
    clientsInFollowUp: number;
    meetingsScheduled: number;
    successCount: number;
    failureCount: number;
    blockedCount: number;
  };
  today: { calls: number; messages: number; followups: number };
  byStatus: { key: string; count: number }[];
  byStage: { key: string; count: number }[];
  byContactStatus: { key: string; count: number }[];
  trend: { date: string; calls: number; messages: number; followups: number }[];
  timeline: {
    id: string;
    clientId: string;
    clientName: string;
    type: string;
    contactMode: string | null;
    answered: boolean | null;
    success: boolean | null;
    blocked: boolean | null;
    reason: string | null;
    notes: string | null;
    createdAt: string;
  }[];
}

const dealStageLabels: Record<string, string> = {
  LEAD: "Lead",
  CONTACTED: "Contatado",
  VISIT_SCHEDULED: "Visita Agendada",
  PROPOSAL_SENT: "Proposta Enviada",
  NEGOTIATION: "Negociação",
  CLOSED_WON: "Fechado (Ganho)",
  CLOSED_LOST: "Fechado (Perdido)",
};

const dealStageColor: Record<string, string> = {
  LEAD: "bg-gray-500/20 text-gray-300",
  CONTACTED: "bg-blue-500/20 text-blue-400",
  VISIT_SCHEDULED: "bg-purple-500/20 text-purple-400",
  PROPOSAL_SENT: "bg-amber-500/20 text-amber-400",
  NEGOTIATION: "bg-orange-500/20 text-orange-400",
  CLOSED_WON: "bg-emerald-500/20 text-emerald-400",
  CLOSED_LOST: "bg-rose-500/20 text-rose-400",
};

const statusLabels: Record<string, string> = {
  LEAD: "Lead",
  PROSPECT: "Prospect",
  CLIENT: "Cliente",
  LOST: "Perdido",
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  VIP: "VIP",
};

const statusColor: Record<string, string> = {
  LEAD: "#9ca3af",
  PROSPECT: "#60a5fa",
  CLIENT: "#34d399",
  LOST: "#fb7185",
  ACTIVE: "#34d399",
  INACTIVE: "#9ca3af",
  VIP: "#c084fc",
};

const stageLabels: Record<string, string> = {
  COLD: "Frio",
  WARM: "Morno",
  HOT: "Quente",
};

const stageColor: Record<string, string> = {
  COLD: "#38bdf8",
  WARM: "#f59e0b",
  HOT: "#f43f5e",
};

const contactStatusLabels: Record<string, string> = {
  NAO_CONTACTADO: "Não contactado",
  CONTACTADO: "Contactado",
  AGUARDANDO_RESPOSTA: "Aguardando resposta",
  CONVERSANDO: "Conversando",
  BLOQUEADO: "Bloqueado",
  REUNIAO_AGENDADA: "Reunião agendada",
  NEGOCIACAO: "Negociação",
  VENDA: "Venda",
};

const contactStatusPalette = [
  "#9ca3af",
  "#60a5fa",
  "#facc15",
  "#38bdf8",
  "#fb7185",
  "#a78bfa",
  "#fb923c",
  "#34d399",
];

const badgeClass: Record<string, string> = {
  ACTIVE: "bg-emerald-500/20 text-emerald-400",
  INACTIVE: "bg-rose-500/20 text-rose-400",
  PROSPECT: "bg-blue-500/20 text-blue-400",
  VIP: "bg-purple-500/20 text-purple-400",
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  href,
}: {
  icon: any;
  label: string;
  value: number | string;
  accent: string;
  href?: string;
}) {
  const content = (
    <div
      className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 flex items-center gap-3 ${
        href ? "hover:border-gray-600 transition cursor-pointer" : ""
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-semibold text-white leading-tight">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function DistributionBar({
  title,
  data,
  labels,
  colors,
}: {
  title: string;
  data: { key: string; count: number }[];
  labels: Record<string, string>;
  colors: Record<string, string> | string[];
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0) || 1;
  const getColor = (key: string, index: number) =>
    Array.isArray(colors) ? colors[index % colors.length] : colors[key] || "#6b7280";

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">{title}</h3>
      {data.length === 0 ? (
        <p className="text-sm text-gray-600">Sem dados ainda.</p>
      ) : (
        <div className="space-y-3">
          {data
            .sort((a, b) => b.count - a.count)
            .map((d, index) => {
              const pct = Math.round((d.count / total) * 100);
              const color = getColor(d.key, index);
              return (
                <div key={d.key}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300">{labels[d.key] || d.key}</span>
                    <span className="text-gray-500">
                      {d.count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#141414] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

function TrendChart({ trend }: { trend: DashboardData["trend"] }) {
  const max = Math.max(1, ...trend.flatMap((t) => [t.calls, t.messages, t.followups]));
  const barWidth = 14;
  const gap = 8;
  const groupWidth = barWidth * 3 + gap * 2;
  const groupGap = 22;
  const chartHeight = 120;
  const width = trend.length * (groupWidth + groupGap);

  const series: { key: "calls" | "messages" | "followups"; color: string; label: string }[] = [
    { key: "calls", color: "#60a5fa", label: "Ligações" },
    { key: "messages", color: "#34d399", label: "Mensagens" },
    { key: "followups", color: "#fbbf24", label: "Followups" },
  ];

  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Últimos 7 dias</h3>
        <div className="flex gap-3">
          {series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg width={Math.max(width, 280)} height={chartHeight + 30} className="min-w-full">
          {trend.map((t, i) => {
            const groupX = i * (groupWidth + groupGap);
            const date = new Date(t.date + "T00:00:00");
            const label = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
            return (
              <g key={t.date}>
                {series.map((s, si) => {
                  const value = t[s.key];
                  const barHeight = (value / max) * chartHeight;
                  const x = groupX + si * (barWidth + gap);
                  const y = chartHeight - barHeight;
                  return (
                    <g key={s.key}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={Math.max(barHeight, value > 0 ? 2 : 0)}
                        rx={3}
                        fill={s.color}
                      >
                        <title>{`${s.label}: ${value}`}</title>
                      </rect>
                      {value > 0 && (
                        <text
                          x={x + barWidth / 2}
                          y={y - 4}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#9ca3af"
                        >
                          {value}
                        </text>
                      )}
                    </g>
                  );
                })}
                <text
                  x={groupX + groupWidth / 2}
                  y={chartHeight + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6b7280"
                  className="capitalize"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

const interactionTypeLabels: Record<string, string> = {
  CALL: "Ligação",
  WHATSAPP_CALL: "Ligação WhatsApp",
  WHATSAPP_MSG: "Mensagem WhatsApp",
};

const interactionTypeIcon: Record<string, any> = {
  CALL: PhoneCall,
  WHATSAPP_CALL: PhoneCall,
  WHATSAPP_MSG: Send,
};

function Timeline({ items }: { items: DashboardData["timeline"] }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
      <h3 className="text-sm font-medium text-gray-400 mb-4">Timeline de interações</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-600">Nenhuma interação registrada ainda.</p>
      ) : (
        <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = interactionTypeIcon[item.type] || PhoneCall;
            const outcomeLabel = item.blocked
              ? "Bloqueou"
              : item.answered === false
              ? item.type === "WHATSAPP_MSG"
                ? "Não respondeu"
                : "Não atendeu"
              : item.success
              ? "Sucesso"
              : "Sem sucesso";
            const outcomeColor = item.blocked
              ? "bg-rose-500/20 text-rose-400"
              : item.answered === false
              ? "bg-gray-500/20 text-gray-400"
              : item.success
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-rose-500/20 text-rose-400";
            return (
              <Link
                key={item.id}
                href={`/clients/${item.clientId}`}
                className="flex items-start gap-3 p-3 rounded-2xl bg-[#141414] border border-[#232323] hover:border-gray-600 transition"
              >
                <div className="mt-0.5 p-2 rounded-full bg-[#1f1f1f] text-gray-400 shrink-0">
                  <Icon size={14} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-gray-200 font-medium truncate">{item.clientName}</p>
                    <span className="text-xs text-gray-500">
                      {interactionTypeLabels[item.type] || item.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${outcomeColor}`}>{outcomeLabel}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {new Date(item.createdAt).toLocaleString("pt-BR")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CRMPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "deals">("overview");

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [clients, setClients] = useState<Client[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setDashboardLoading(true);
    fetch("/api/crm-dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setDashboard(data);
      })
      .finally(() => setDashboardLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "overview") return;
    setLoading(true);
    if (activeTab === "clients") {
      fetch("/api/clients")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setClients(data);
        })
        .finally(() => setLoading(false));
    } else {
      fetch("/api/deals")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setDeals(data);
        })
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  const filteredClients = clients.filter((client) => {
    if (statusFilter && client.status !== statusFilter) return false;
    if (
      searchQuery &&
      !client.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const filteredDeals = deals.filter((deal) => {
    if (searchQuery) {
      return (
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const inputClass =
    "px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600";

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">CRM</h1>
            <p className="text-sm text-gray-500 mt-1">Visão geral de clientes, contatos e negócios.</p>
          </div>
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
          >
            + Novo Cliente
          </Link>
        </div>

        {/* Abas */}
        <div className="flex w-fit rounded-full bg-[#141414] border border-[#2a2a2a] p-1 gap-1">
          {[
            { key: "overview", label: "Visão Geral" },
            { key: "clients", label: "Clientes" },
            { key: "deals", label: "Negócios" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key as any);
                setStatusFilter("");
                setSearchQuery("");
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                activeTab === t.key ? "bg-blue-500/20 text-blue-300" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ---------- VISÃO GERAL ---------- */}
        {activeTab === "overview" &&
          (dashboardLoading || !dashboard ? (
            <p className="text-center py-16 text-gray-600">Carregando dashboard...</p>
          ) : (
            <div className="space-y-6">
              {/* Cards principais */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard
                  icon={Users}
                  label="Leads"
                  value={dashboard.totals.totalLeads}
                  accent="bg-gray-500/15 text-gray-300"
                  href="/clients?status=LEAD"
                />
                <StatCard
                  icon={UserCheck}
                  label="Contactados"
                  value={dashboard.totals.totalContacted}
                  accent="bg-blue-500/15 text-blue-300"
                  href="/clients?tab=INTERAGIDO"
                />
                <StatCard
                  icon={Repeat}
                  label="Em Follow-up"
                  value={dashboard.totals.clientsInFollowUp}
                  accent="bg-amber-500/15 text-amber-300"
                  href="/clients?followUp=1"
                />
                <StatCard
                  icon={Calendar}
                  label="Reuniões agendadas"
                  value={dashboard.totals.meetingsScheduled}
                  accent="bg-purple-500/15 text-purple-300"
                  href="/clients?contactStatus=REUNIAO_AGENDADA"
                />
                <StatCard
                  icon={CheckCircle2}
                  label="Sucesso"
                  value={dashboard.totals.successCount}
                  accent="bg-emerald-500/15 text-emerald-300"
                  href="/clients?outcome=success"
                />
                <StatCard
                  icon={XCircle}
                  label="Falha"
                  value={dashboard.totals.failureCount}
                  accent="bg-rose-500/15 text-rose-300"
                  href="/clients?outcome=failure"
                />
              </div>

              {/* Cards do dia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <StatCard
                  icon={PhoneCall}
                  label="Ligações hoje (por cliente)"
                  value={dashboard.today.calls}
                  accent="bg-blue-500/15 text-blue-300"
                  href="/clients?todayType=CALL_ANY"
                />
                <StatCard
                  icon={Send}
                  label="Mensagens hoje (por cliente)"
                  value={dashboard.today.messages}
                  accent="bg-emerald-500/15 text-emerald-300"
                  href="/clients?todayType=WHATSAPP_MSG"
                />
                <StatCard
                  icon={Clock}
                  label="Followups hoje (por cliente)"
                  value={dashboard.today.followups}
                  accent="bg-amber-500/15 text-amber-300"
                  href="/clients?todayType=FUP"
                />
              </div>

              {dashboard.totals.blockedCount > 0 && (
                <Link
                  href="/clients?blocked=1"
                  className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400 flex items-center gap-2 hover:border-rose-500/60 transition"
                >
                  <Ban size={14} />
                  {dashboard.totals.blockedCount} cliente(s) bloquearam contato ao longo do histórico.
                </Link>
              )}

              {/* Tendência */}
              <TrendChart trend={dashboard.trend} />

              {/* Distribuições */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DistributionBar
                  title="Por status"
                  data={dashboard.byStatus}
                  labels={statusLabels}
                  colors={statusColor}
                />
                <DistributionBar
                  title="Por temperatura"
                  data={dashboard.byStage}
                  labels={stageLabels}
                  colors={stageColor}
                />
                <DistributionBar
                  title="Por status de contato"
                  data={dashboard.byContactStatus}
                  labels={contactStatusLabels}
                  colors={contactStatusPalette}
                />
              </div>

              {/* Timeline */}
              <Timeline items={dashboard.timeline} />
            </div>
          ))}

        {/* ---------- CLIENTES ---------- */}
        {activeTab === "clients" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                className={`flex-1 min-w-[200px] ${inputClass}`}
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className={inputClass}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos status</option>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="PROSPECT">Prospect</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            {loading ? (
              <p className="text-center py-16 text-gray-600">Carregando...</p>
            ) : filteredClients.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center text-gray-500">
                Nenhum cliente encontrado.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => router.push(`/clients/${client.id}`)}
                    className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-gray-600 cursor-pointer transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{client.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {client.email || "—"} · {client.phone || "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${badgeClass[client.status] || "bg-blue-500/20 text-blue-400"}`}>
                        {client.status}
                      </span>
                      <span className="text-xs text-gray-500">{client.assignedUser?.name || "Não atribuído"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---------- NEGÓCIOS ---------- */}
        {activeTab === "deals" && (
          <div className="space-y-4">
            <input
              className={`w-full ${inputClass}`}
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {loading ? (
              <p className="text-center py-16 text-gray-600">Carregando...</p>
            ) : filteredDeals.length === 0 ? (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center text-gray-500">
                Nenhum negócio encontrado.
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDeals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => router.push(`/crm/${deal.id}`)}
                    className="flex items-center justify-between px-5 py-3.5 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-gray-600 cursor-pointer transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{deal.title}</p>
                      <p className="text-xs text-gray-500 truncate">{deal.client?.name}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${dealStageColor[deal.stage] || "bg-blue-500/20 text-blue-400"}`}>
                        {dealStageLabels[deal.stage] || deal.stage}
                      </span>
                      <span className="text-sm text-gray-300">
                        {deal.value ? `R$ ${deal.value.toLocaleString("pt-BR")}` : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}