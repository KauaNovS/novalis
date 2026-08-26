"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Key,
  CheckCircle2,
  CircleDollarSign,
  Users,
  Briefcase,
  TrendingUp,
  Activity,
} from "lucide-react";

interface UnitsByStatus {
  status: string;
  _count: number;
}

interface DashboardData {
  totalProjects: number;
  totalUnits: number;
  availableUnits: number;
  soldUnits: number;
  totalClients: number;
  totalDeals: number;
  totalPipelineValue: number;
  unitsByStatus: UnitsByStatus[];
  recentProjects?: Array<{ id: string; name: string }>;
  recentClients?: Array<{ id: string; name: string }>;
  recentDeals?: Array<{ id: string; title: string; client?: { name: string } }>;
}

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponíveis",
  RESERVED: "Reservadas",
  SOLD: "Vendidas",
  BLOCKED: "Bloqueadas",
  UNAVAILABLE: "Indisponíveis",
};

const statusBarColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/80",
  RESERVED: "bg-amber-500/80",
  SOLD: "bg-rose-500/80",
  BLOCKED: "bg-violet-500/80",
  UNAVAILABLE: "bg-gray-500/80",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
      })
      .catch(() => setError("Erro ao carregar dados"));
  }, []);

  if (error) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 text-center">
            <p className="text-rose-400">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 animate-pulse">
              <div className="h-3 bg-[#2a2a2a] rounded w-24 mb-3"></div>
              <div className="h-7 bg-[#2a2a2a] rounded w-16"></div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  const metrics = [
    { label: "Projetos", value: data.totalProjects, icon: Building2 },
    { label: "Unidades", value: data.totalUnits, icon: Key },
    { label: "Disponíveis", value: data.availableUnits, icon: CheckCircle2 },
    { label: "Vendidas", value: data.soldUnits, icon: Briefcase },
    { label: "Clientes", value: data.totalClients, icon: Users },
    { label: "Negócios", value: data.totalDeals, icon: Activity },
  ];

  const totalUnits = data.unitsByStatus.reduce((acc, item) => acc + item._count, 0);

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visão geral da sua carteira imobiliária.
          </p>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Icon size={14} strokeWidth={1.5} className="text-gray-500" />
                  <span className="text-xs text-gray-500">{metric.label}</span>
                </div>
                <p className="text-2xl font-semibold text-gray-200">
                  {metric.value.toLocaleString("pt-BR")}
                </p>
              </div>
            );
          })}
        </div>

        {/* Funil e Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Valor no funil */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <CircleDollarSign size={16} strokeWidth={1.5} className="text-gray-500" />
              <h2 className="text-sm font-medium text-gray-300">Valor no Funil</h2>
            </div>
            <p className="text-3xl font-semibold text-emerald-400">
              R$ {data.totalPipelineValue.toLocaleString("pt-BR")}
            </p>
            <p className="text-xs text-gray-600 mt-2">Negócios não perdidos</p>
          </div>

          {/* Unidades por status */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} strokeWidth={1.5} className="text-gray-500" />
              <h2 className="text-sm font-medium text-gray-300">Unidades por Status</h2>
            </div>
            <div className="space-y-3">
              {data.unitsByStatus.length === 0 ? (
                <p className="text-xs text-gray-600">Nenhuma unidade cadastrada.</p>
              ) : (
                data.unitsByStatus.map((item) => {
                  const percentage = totalUnits > 0 ? (item._count / totalUnits) * 100 : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">
                          {statusLabels[item.status] || item.status}
                        </span>
                        <span className="text-gray-400">
                          {item._count} · {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${statusBarColors[item.status] || "bg-gray-500"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Atividades recentes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Últimos Projetos
            </h3>
            <div className="space-y-2">
              {data.recentProjects?.length === 0 && <p className="text-xs text-gray-600">Nenhum projeto.</p>}
              {data.recentProjects?.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2a2a2a] transition-colors"
                >
                  <Building2 size={14} strokeWidth={1.5} className="text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{project.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Últimos Clientes
            </h3>
            <div className="space-y-2">
              {data.recentClients?.length === 0 && <p className="text-xs text-gray-600">Nenhum cliente.</p>}
              {data.recentClients?.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2a2a2a] transition-colors"
                >
                  <Users size={14} strokeWidth={1.5} className="text-gray-500 shrink-0" />
                  <span className="text-sm text-gray-300 truncate">{client.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Últimos Negócios
            </h3>
            <div className="space-y-2">
              {data.recentDeals?.length === 0 && <p className="text-xs text-gray-600">Nenhum negócio.</p>}
              {data.recentDeals?.map((deal) => (
                <Link
                  key={deal.id}
                  href={`/crm/${deal.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#2a2a2a] transition-colors"
                >
                  <Briefcase size={14} strokeWidth={1.5} className="text-gray-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300 truncate">{deal.title}</p>
                    {deal.client && <p className="text-xs text-gray-600 truncate">{deal.client.name}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}