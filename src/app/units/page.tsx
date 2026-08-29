"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Key,
  Layers,
  BedDouble,
  Car,
  Ruler,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface Unit {
  id: string;
  unitNumber: string;
  floor: number;
  bedrooms: number;
  area: number;
  parkingSpaces: number;
  status: string;
  currentPrice: number | null;
  pricePerSquareMeter: number | null;
  typology: string | null;
  topology: string | null;
  imageUrl?: string | null;
  project: {
    name: string;
    zone?: string | null;
    deliveryDate?: string | null;
    neighborhood?: string | null;
    developer?: { name: string } | null;
    builder?: { name: string } | null;
  };
  tower: { name: string };
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  AVAILABLE: {
    label: "Disponível",
    color: "bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-500",
  },
  RESERVED: {
    label: "Reservado",
    color: "bg-amber-500/10 text-amber-400",
    dot: "bg-amber-500",
  },
  SOLD: {
    label: "Vendido",
    color: "bg-rose-500/10 text-rose-400",
    dot: "bg-rose-500",
  },
  BLOCKED: {
    label: "Bloqueado",
    color: "bg-violet-500/10 text-violet-400",
    dot: "bg-violet-500",
  },
  UNAVAILABLE: {
    label: "Indisponível",
    color: "bg-gray-500/10 text-gray-400",
    dot: "bg-gray-500",
  },
};

const tipologyOptions = [
  "Studio",
  "1 Dormitório",
  "2 Dormitórios",
  "Sala Comercial",
  "4 Dormitórios",
  "Pé Direito Alto",
  "Pé Direito Duplo",
  "Garden",
  "Loja",
];

const topologyOptions = ["HIS 1", "HIS 2", "HMP", "NR", "R2V"];

const zoneOptions = ["Zona Norte", "Zona Sul", "Zona Leste", "Zona Oeste", "Zona Central"];

export default function UnitsPage() {
  const router = useRouter();
  const topRef = useRef<HTMLDivElement>(null);

  const [units, setUnits] = useState<Unit[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [builders, setBuilders] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [developerFilter, setDeveloperFilter] = useState("");
  const [builderFilter, setBuilderFilter] = useState("");
  const [tipologyFilter, setTipologyFilter] = useState("");
  const [topologyFilter, setTopologyFilter] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [priceOrder, setPriceOrder] = useState("");
  const [deliveryMonth, setDeliveryMonth] = useState("");
  const [deliveryYear, setDeliveryYear] = useState("");

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [pagination, setPagination] = useState({ totalPages: 0, total: 0 });

  const currentYear = new Date().getFullYear();
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  const deliveryYears = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const activeFiltersCount = [
    statusFilter,
    projectFilter,
    developerFilter,
    builderFilter,
    tipologyFilter,
    topologyFilter,
    neighborhoodFilter,
    zoneFilter,
    minArea,
    maxArea,
    priceOrder,
    deliveryMonth,
    deliveryYear,
  ].filter(Boolean).length;

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
          const bairros = [...new Set(data.map((p: any) => p.neighborhood).filter(Boolean))] as string[];
          setNeighborhoods(bairros);
        }
      })
      .catch(() => {});

    fetch("/api/developers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDevelopers(data);
      })
      .catch(() => {});

    fetch("/api/builders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBuilders(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchUnits();
  }, [
    page,
    itemsPerPage,
    statusFilter,
    projectFilter,
    developerFilter,
    builderFilter,
    searchQuery,
    tipologyFilter,
    topologyFilter,
    neighborhoodFilter,
    zoneFilter,
    minArea,
    maxArea,
    priceOrder,
    deliveryMonth,
    deliveryYear,
  ]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const fetchUnits = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.append("status", statusFilter);
    if (projectFilter) params.append("projectId", projectFilter);
    if (developerFilter) params.append("developerId", developerFilter);
    if (builderFilter) params.append("builderId", builderFilter);
    if (searchQuery) params.append("search", searchQuery);
    if (tipologyFilter) params.append("tipology", tipologyFilter);
    if (topologyFilter) params.append("topology", topologyFilter);
    if (neighborhoodFilter) params.append("neighborhood", neighborhoodFilter);
    if (zoneFilter) params.append("zone", zoneFilter);
    if (minArea) params.append("minArea", minArea);
    if (maxArea) params.append("maxArea", maxArea);
    if (priceOrder) params.append("priceOrder", priceOrder);
    if (deliveryMonth) params.append("deliveryMonth", deliveryMonth);
    if (deliveryYear) params.append("deliveryYear", deliveryYear);

    params.append("page", String(page));
    params.append("limit", String(itemsPerPage));

    fetch(`/api/units?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (data.data) {
          setUnits(data.data);
          setPagination(data.pagination || { totalPages: 0, total: 0 });
        } else if (Array.isArray(data)) {
          setUnits(data);
          setPagination({ totalPages: Math.ceil(data.length / itemsPerPage), total: data.length });
        }
      })
      .catch(() => setError("Erro ao carregar unidades"))
      .finally(() => setLoading(false));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setProjectFilter("");
    setDeveloperFilter("");
    setBuilderFilter("");
    setTipologyFilter("");
    setTopologyFilter("");
    setNeighborhoodFilter("");
    setZoneFilter("");
    setMinArea("");
    setMaxArea("");
    setPriceOrder("");
    setDeliveryMonth("");
    setDeliveryYear("");
    setPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setPage(1);
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-400 hover:text-gray-200 disabled:opacity-50 hover:border-gray-600 transition"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        Anterior
      </button>
      <span className="text-sm text-gray-500">
        Página {page} de {pagination.totalPages}
      </span>
      <button
        onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
        disabled={page === pagination.totalPages}
        className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-400 hover:text-gray-200 disabled:opacity-50 hover:border-gray-600 transition"
      >
        Próxima
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto" ref={topRef}>
        {/* Cabeçalho */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-white">Unidades</h1>
          <p className="text-sm text-gray-500 mt-1">
            Explore e gerencie todas as unidades da sua carteira.
          </p>
        </div>

        {/* Busca + botão funil */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Buscar por unidade, projeto ou torre..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <Filter size={16} strokeWidth={1.5} />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {showFilters ? (
              <ChevronUp size={16} strokeWidth={1.5} />
            ) : (
              <ChevronDown size={16} strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Painel de filtros expansível */}
        {showFilters && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-medium text-white flex items-center gap-2">
                <Filter size={18} strokeWidth={1.5} className="text-gray-500" />
                Filtros
              </h2>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-400 hover:text-gray-200 hover:border-gray-600 transition"
              >
                <X size={14} strokeWidth={1.5} />
                Limpar filtros
              </button>
            </div>

            {/* Seção: Busca e Status */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Busca e Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Buscar</label>
                  <div className="relative">
                    <Search size={16} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="text"
                      placeholder="Buscar por unidade, projeto ou torre..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Todos</option>
                    <option value="AVAILABLE">Disponível</option>
                    <option value="RESERVED">Reservado</option>
                    <option value="SOLD">Vendido</option>
                    <option value="BLOCKED">Bloqueado</option>
                    <option value="UNAVAILABLE">Indisponível</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Seção: Projeto e Empresas */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Projeto e Empresas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Projeto</label>
                  <select
                    value={projectFilter}
                    onChange={(e) => {
                      setProjectFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Todos</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Incorporadora</label>
                  <select
                    value={developerFilter}
                    onChange={(e) => {
                      setDeveloperFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Todas</option>
                    {developers.map((developer) => (
                      <option key={developer.id} value={developer.id}>{developer.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Construtora</label>
                  <select
                    value={builderFilter}
                    onChange={(e) => {
                      setBuilderFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Todas</option>
                    {builders.map((builder) => (
                      <option key={builder.id} value={builder.id}>{builder.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Seção: Características */}
            <div className="mb-5">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Características</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tipologia</label>
                  <select
                    value={tipologyFilter}
                    onChange={(e) => {
                      setTipologyFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Todas</option>
                    {tipologyOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Topologia</label>
                  <select
                    value={topologyFilter}
                    onChange={(e) => {
                      setTopologyFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Todas</option>
                    {topologyOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Zona</label>
                  <select
                    value={zoneFilter}
                    onChange={(e) => {
                      setZoneFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Todas</option>
                    {zoneOptions.map((zone) => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Bairro</label>
                  <select
                    value={neighborhoodFilter}
                    onChange={(e) => {
                      setNeighborhoodFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Todos</option>
                    {neighborhoods.map((neighborhood) => (
                      <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Seção: Área, Valor e Entrega */}
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Área, Valor e Entrega</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Metragem (m²)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="De"
                      value={minArea}
                      onChange={(e) => {
                        setMinArea(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
                    />
                    <span className="text-gray-500">a</span>
                    <input
                      type="number"
                      placeholder="Até"
                      value={maxArea}
                      onChange={(e) => {
                        setMaxArea(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Valor</label>
                  <select
                    value={priceOrder}
                    onChange={(e) => {
                      setPriceOrder(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value="">Ordenar</option>
                    <option value="asc">Menor preço</option>
                    <option value="desc">Maior preço</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Entrega</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={deliveryMonth}
                      onChange={(e) => {
                        setDeliveryMonth(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                    >
                      <option value="">Mês</option>
                      {months.map((month) => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                    <select
                      value={deliveryYear}
                      onChange={(e) => {
                        setDeliveryYear(e.target.value);
                        setPage(1);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                    >
                      <option value="">Ano</option>
                      {deliveryYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Exibir</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  >
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={90}>90</option>
                    <option value={120}>120</option>
                    <option value={150}>150</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paginação superior */}
        {pagination.totalPages > 1 && (
          <div className="mb-6">
            <PaginationControls />
          </div>
        )}

        {/* Conteúdo */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden animate-pulse">
                <div className="h-40 bg-[#2a2a2a]"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-[#2a2a2a] rounded w-3/4"></div>
                  <div className="h-4 bg-[#2a2a2a] rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">{error}</p>
          </div>
        ) : units.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">🔑</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhuma unidade encontrada</h3>
            <p className="text-sm text-gray-600">Ajuste os filtros para encontrar o que procura.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => {
              const status = statusConfig[unit.status] || statusConfig.UNAVAILABLE;
              return (
                <div
                  key={unit.id}
                  onClick={() => router.push(`/units/${unit.id}`)}
                  className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden cursor-pointer hover:border-gray-600 transition-all duration-200"
                >
                  <div className="h-40 bg-[#222] relative overflow-hidden">
                    {unit.imageUrl ? (
                      <img src={unit.imageUrl} alt={`Unidade ${unit.unitNumber}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Key size={40} strokeWidth={1.5} className="text-gray-700" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-200">Unidade {unit.unitNumber}</h2>
                      <span className="text-sm text-gray-500">{unit.typology || "—"}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Building2 size={14} strokeWidth={1.5} className="shrink-0" />
                      <span className="truncate">{unit.project.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Layers size={14} strokeWidth={1.5} className="shrink-0" />
                      <span>{unit.tower.name} · {unit.floor}º andar</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#2a2a2a] text-sm">
                      <div className="flex items-center gap-1.5">
                        <Ruler size={14} strokeWidth={1.5} className="text-gray-500" />
                        <span className="text-gray-400">{unit.area.toFixed(0)} m²</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BedDouble size={14} strokeWidth={1.5} className="text-gray-500" />
                        <span className="text-gray-400">{unit.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Car size={14} strokeWidth={1.5} className="text-gray-500" />
                        <span className="text-gray-400">{unit.parkingSpaces}</span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">R$/m²</span>
                        <span className="text-gray-400">
                          {unit.pricePerSquareMeter
                            ? `R$ ${unit.pricePerSquareMeter.toLocaleString("pt-BR")}`
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Preço total</span>
                        <span className="text-gray-200 font-semibold">
                          {unit.currentPrice
                            ? `R$ ${unit.currentPrice.toLocaleString("pt-BR")}`
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Paginação inferior */}
        {pagination.totalPages > 1 && (
          <div className="mt-8">
            <PaginationControls />
          </div>
        )}
      </div>
    </main>
  );
}