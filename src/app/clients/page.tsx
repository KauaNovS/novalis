"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  ChevronDown,
  X,
  Flame,
  Snowflake,
  ThermometerSun,
  Check,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  stage: string;
  contactStatus: string | null;
  source: string | null;
  profile: string | null;
  interestType: string | null;
  investorProfile: string | null;
  createdAt: string;
  assignedUser?: { name: string } | null;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  LEAD: {
    label: "Lead",
    color: "bg-gray-500/10 text-gray-400",
    dot: "bg-gray-500",
  },
  PROSPECT: {
    label: "Prospect",
    color: "bg-blue-500/10 text-blue-400",
    dot: "bg-blue-500",
  },
  CLIENT: {
    label: "Cliente",
    color: "bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-500",
  },
  LOST: {
    label: "Perdido",
    color: "bg-rose-500/10 text-rose-400",
    dot: "bg-rose-500",
  },
};

const stageConfig: Record<string, { label: string; icon: any; color: string }> = {
  COLD: {
    label: "Frio",
    icon: Snowflake,
    color: "text-blue-400",
  },
  WARM: {
    label: "Morno",
    icon: ThermometerSun,
    color: "text-yellow-400",
  },
  HOT: {
    label: "Quente",
    icon: Flame,
    color: "text-orange-400",
  },
};

const contactStatusConfig: Record<string, { label: string; color: string }> = {
  NAO_CONTACTADO: { label: "Não contactado", color: "text-gray-400" },
  CONTACTADO: { label: "Contactado", color: "text-blue-400" },
  AGUARDANDO_RESPOSTA: { label: "Aguardando resposta", color: "text-yellow-400" },
  CONVERSANDO: { label: "Conversando", color: "text-green-400" },
  BLOQUEADO: { label: "Bloqueado", color: "text-red-400" },
  REUNIAO_AGENDADA: { label: "Reunião agendada", color: "text-purple-400" },
  NEGOCIACAO: { label: "Negociação", color: "text-emerald-400" },
  VENDA: { label: "Venda", color: "text-emerald-500" },
};

const contactStatusCycle = [
  "NAO_CONTACTADO",
  "CONTACTADO",
  "AGUARDANDO_RESPOSTA",
  "CONVERSANDO",
  "BLOQUEADO",
  "REUNIAO_AGENDADA",
  "NEGOCIACAO",
  "VENDA",
];

const profileOptions = [
  { value: "DOMINANTE", label: "Dominante" },
  { value: "INFLUENTE", label: "Influente" },
  { value: "ESTAVEL", label: "Estável" },
  { value: "CONFORME", label: "Conforme" },
];

const interestOptions = [
  { value: "SEM_INTERESSE", label: "Sem interesse" },
  { value: "INTERESSADO", label: "Interessado" },
  { value: "INTERESSE_FUTURO", label: "Interesse futuro" },
  { value: "CONVERSANDO", label: "Conversando" },
];

const investorProfileOptions = [
  { value: "COMPRADOR", label: "Comprador" },
  { value: "INVESTIDOR", label: "Investidor" },
  { value: "POSSIVEL_INVESTIDOR", label: "Possível investidor" },
  { value: "PESQUISADOR", label: "Pesquisador" },
];

const sourceOptions = ["Indicação", "RD Station", "Site", "Outro"];

export default function ClientsPage() {
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filtros
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [contactStatusFilter, setContactStatusFilter] = useState<string[]>([]);
  const [profileFilter, setProfileFilter] = useState<string[]>([]);
  const [interestFilter, setInterestFilter] = useState<string[]>([]);
  const [investorFilter, setInvestorFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("");

  // UI state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "name" | "status">("recent");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [interactionTab, setInteractionTab] = useState<"NAO_INTERAGIDO" | "INTERAGIDO" | "TODOS">("TODOS");

  const fetchClients = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (searchQuery) params.append("search", searchQuery);
    if (dateFilter) params.append("date", dateFilter);
    if (statusFilter.length > 0) params.append("status", statusFilter.join(","));
    if (stageFilter.length > 0) params.append("stage", stageFilter.join(","));
    if (contactStatusFilter.length > 0) params.append("contactStatus", contactStatusFilter.join(","));
    if (profileFilter.length > 0) params.append("profile", profileFilter.join(","));
    if (interestFilter.length > 0) params.append("interestType", interestFilter.join(","));
    if (investorFilter.length > 0) params.append("investorProfile", investorFilter.join(","));
    if (sourceFilter.length > 0) params.append("source", sourceFilter.join(","));

    fetch(`/api/clients?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setClients([]);
        } else if (Array.isArray(data)) {
          setClients(data);
        } else if (data.data) {
          setClients(data.data);
        }
      })
      .catch(() => setError("Erro ao carregar clientes"))
      .finally(() => setLoading(false));
  }, [
    searchQuery,
    statusFilter,
    stageFilter,
    contactStatusFilter,
    profileFilter,
    interestFilter,
    investorFilter,
    sourceFilter,
    dateFilter,
  ]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const updateContactStatus = async (clientId: string, newStatus: string) => {
    setUpdatingId(clientId);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ contactStatus: newStatus }),
      });

      if (res.ok) {
        const updatedClient = await res.json();
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? { ...c, ...updatedClient } : c))
        );
      } else {
        setError("Erro ao atualizar status de contato");
      }
    } catch (err) {
      setError("Erro ao atualizar status de contato");
    } finally {
      setUpdatingId(null);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter([]);
    setStageFilter([]);
    setContactStatusFilter([]);
    setProfileFilter([]);
    setInterestFilter([]);
    setInvestorFilter([]);
    setSourceFilter([]);
    setDateFilter("");
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter.length > 0 ||
    stageFilter.length > 0 ||
    contactStatusFilter.length > 0 ||
    profileFilter.length > 0 ||
    interestFilter.length > 0 ||
    investorFilter.length > 0 ||
    sourceFilter.length > 0 ||
    dateFilter;

  const toggleFilter = (value: string, filter: string[], setFilter: (v: string[]) => void) => {
    if (filter.includes(value)) {
      setFilter(filter.filter((f) => f !== value));
    } else {
      setFilter([...filter, value]);
    }
  };

  const isInteracted = (c: Client) =>
    !!c.contactStatus && c.contactStatus !== "NAO_CONTACTADO";

  const tabFilteredClients = clients.filter((c) => {
    if (interactionTab === "NAO_INTERAGIDO") return !isInteracted(c);
    if (interactionTab === "INTERAGIDO") return isInteracted(c);
    return true;
  });

  const naoInteragidoCount = clients.filter((c) => !isInteracted(c)).length;
  const interagidoCount = clients.filter((c) => isInteracted(c)).length;

  const sortedClients = [...tabFilteredClients].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Clientes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total: {clients.length} cliente{clients.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/clients/new"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
          >
            <Plus size={16} strokeWidth={1.5} />
            Novo Cliente
          </Link>
        </div>

        {/* Abas: não interagi / já interagi / todos */}
        <div className="flex gap-2 mb-6 border-b border-[#2a2a2a]">
          {[
            { key: "NAO_INTERAGIDO" as const, label: "Não interagi", count: naoInteragidoCount },
            { key: "INTERAGIDO" as const, label: "Já interagi", count: interagidoCount },
            { key: "TODOS" as const, label: "Todos", count: clients.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setInteractionTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition -mb-px ${
                interactionTab === tab.key
                  ? "border-blue-500 text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-xs rounded-full px-1.5 py-0.5 ${
                  interactionTab === tab.key
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-[#2a2a2a] text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Busca principal */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition"
            />
          </div>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-4 py-2.5 rounded-xl border transition ${
              showAdvancedFilters
                ? "bg-[#1a1a1a] border-gray-600 text-gray-200"
                : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
            }`}
          >
            <ChevronDown size={16} className={showAdvancedFilters ? "rotate-180" : ""} />
          </button>
        </div>

        {/* Filtros rápidos — sempre visíveis */}
        <div className="flex flex-wrap gap-2 mb-6">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
            title="Filtrar por data de entrada"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "recent" | "name" | "status")}
            className="px-3 py-2 rounded-lg text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
          >
            <option value="recent">Mais recentes</option>
            <option value="name">Nome (A-Z)</option>
            <option value="status">Status</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 rounded-lg text-xs bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:text-gray-200 hover:border-gray-600 transition inline-flex items-center gap-1"
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>

        {/* Filtros avançados — expansível */}
        {showAdvancedFilters && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 mb-6 space-y-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Status</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key, statusFilter, setStatusFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      statusFilter.includes(key)
                        ? `${color} border-opacity-40 bg-opacity-20`
                        : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperatura (Stage) */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Temperatura</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stageConfig).map(([key, { label, icon: Icon }]) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key, stageFilter, setStageFilter)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition ${
                      stageFilter.includes(key)
                        ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                        : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status de contato */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Status de contato</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(contactStatusConfig).map(([key, { label }]) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter(key, contactStatusFilter, setContactStatusFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      contactStatusFilter.includes(key)
                        ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Perfil DISC */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Perfil DISC</label>
              <div className="flex flex-wrap gap-2">
                {profileOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleFilter(value, profileFilter, setProfileFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      profileFilter.includes(value)
                        ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                        : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Interesse */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Nível de interesse</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleFilter(value, interestFilter, setInterestFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      interestFilter.includes(value)
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Perfil de investidor */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Perfil de investidor</label>
              <div className="flex flex-wrap gap-2">
                {investorProfileOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => toggleFilter(value, investorFilter, setInvestorFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      investorFilter.includes(value)
                        ? "bg-pink-500/20 border-pink-500/40 text-pink-300"
                        : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fonte */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Fonte</label>
              <div className="flex flex-wrap gap-2">
                {sourceOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => toggleFilter(option, sourceFilter, setSourceFilter)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition ${
                      sourceFilter.includes(option)
                        ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                        : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabela de clientes */}
        {loading ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 animate-pulse">
            <div className="h-5 bg-[#2a2a2a] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-2/3"></div>
          </div>
        ) : error ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">{error}</p>
          </div>
        ) : sortedClients.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum cliente encontrado</h3>
            <p className="text-sm text-gray-600">Ajuste os filtros ou crie um novo cliente.</p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-[#222]">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">Nome</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Temperatura</th>
                    <th className="px-6 py-3 font-medium">Contato</th>
                    <th className="px-6 py-3 font-medium">Perfil</th>
                    <th className="px-6 py-3 font-medium">Interesse</th>
                    <th className="px-6 py-3 font-medium">Investidor</th>
                    <th className="px-6 py-3 font-medium">Fonte</th>
                    <th className="px-6 py-3 font-medium">Telefone</th>
                    <th className="px-6 py-3 font-medium">Entrada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {sortedClients.map((client) => {
                    const status = statusConfig[client.status] || statusConfig.LEAD;
                    const stage = stageConfig[client.stage] || stageConfig.COLD;
                    const contactStatus = contactStatusConfig[client.contactStatus || "NAO_CONTACTADO"];
                    const profile = profileOptions.find((p) => p.value === client.profile);
                    const interest = interestOptions.find((o) => o.value === client.interestType);
                    const investor = investorProfileOptions.find((o) => o.value === client.investorProfile);
                    const StageIcon = stage.icon;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-[#2a2a2a] transition"
                      >
                        <td
                          className="px-6 py-4 font-medium text-gray-200 cursor-pointer"
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          {client.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-sm ${stage.color}`}>
                            <StageIcon size={14} />
                            {stage.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              const current = client.contactStatus || "NAO_CONTACTADO";
                              const idx = contactStatusCycle.indexOf(current);
                              const next = contactStatusCycle[(idx === -1 ? 0 : idx + 1) % contactStatusCycle.length];
                              updateContactStatus(client.id, next);
                            }}
                            disabled={updatingId === client.id}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition ${
                              updatingId === client.id
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:opacity-80 cursor-pointer"
                            } ${contactStatus.color}`}
                            title="Clique para avançar o status de contato"
                          >
                            {updatingId === client.id && <span className="w-3 h-3 border-2 border-transparent border-t-current rounded-full animate-spin"></span>}
                            {!updatingId && <Check size={12} />}
                            {contactStatus.label}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {profile?.label || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {interest?.label || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {investor?.label || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {client.source || "—"}
                        </td>
                        <td
                          className="px-6 py-4 text-gray-400 text-xs truncate cursor-pointer"
                          onClick={() => router.push(`/clients/${client.id}`)}
                        >
                          {client.phone || "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(client.createdAt).toLocaleDateString("pt-BR")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}