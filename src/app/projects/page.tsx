"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Building2,
  HardHat,
  Home,
  MapPin,
  Layers,
  Key,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  address: string | null;
  addressNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  totalUnits: number;
  totalTowers: number;
  imageUrl?: string | null;
  developer?: { name: string } | null;
  builder?: { name: string } | null;
  _count?: { units: number; towers: number };
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  ACTIVE: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-500" },
  DRAFT: { label: "Rascunho", color: "bg-gray-500/10 text-gray-400", dot: "bg-gray-500" },
  COMPLETED: { label: "Concluído", color: "bg-blue-500/10 text-blue-400", dot: "bg-blue-500" },
  ARCHIVED: { label: "Arquivado", color: "bg-rose-500/10 text-rose-400", dot: "bg-rose-500" },
};

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [searchQuery, statusFilter]);

  const fetchProjects = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append("search", searchQuery);
    if (statusFilter) params.append("status", statusFilter);

    fetch(`/api/projects?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          setProjects(data);
        } else if (data.data) {
          setProjects(data.data);
        }
      })
      .catch(() => setError("Erro ao carregar projetos"))
      .finally(() => setLoading(false));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Projetos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie seus empreendimentos imobiliários.
            </p>
          </div>
          <Link
            href="/projects/new"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
          >
            <Plus size={16} strokeWidth={1.5} />
            Novo Projeto
          </Link>
        </div>

        {/* Busca e filtros */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="text"
              placeholder="Buscar por nome, bairro ou cidade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
          >
            <option value="">Todos status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="DRAFT">Rascunho</option>
            <option value="COMPLETED">Concluído</option>
            <option value="ARCHIVED">Arquivado</option>
          </select>

          {(searchQuery || statusFilter) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-400 hover:text-gray-200 hover:border-gray-600 transition"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden animate-pulse">
                <div className="h-48 bg-[#2a2a2a]"></div>
                <div className="p-6 space-y-3">
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
        ) : projects.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">🏗️</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhum projeto encontrado
            </h3>
            <p className="text-sm text-gray-600">
              Ajuste os filtros ou crie um novo projeto.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const status = statusConfig[project.status] || statusConfig.DRAFT;
              const unitsCount = project._count?.units ?? project.totalUnits;
              const towersCount = project._count?.towers ?? project.totalTowers;

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden cursor-pointer hover:border-gray-600 transition-all duration-200"
                >
                  {/* Capa */}
                  <div className="h-48 bg-[#222] relative overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 size={48} strokeWidth={1.5} className="text-gray-700" />
                      </div>
                    )}
                    {/* Badge de status */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-200 truncate">
                      {project.name}
                    </h2>

                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <MapPin size={14} strokeWidth={1.5} className="shrink-0" />
                      <span className="truncate">
                        {project.neighborhood || project.city
                          ? `${project.neighborhood || ""}${project.neighborhood && project.city ? ", " : ""}${project.city || ""}${project.state ? `/${project.state}` : ""}`
                          : "Localização não informada"}
                      </span>
                    </div>

                    {/* Incorporadora e construtora */}
                    <div className="flex flex-col gap-1 mt-3 text-sm text-gray-500">
                      {project.developer && (
                        <span className="flex items-center gap-1.5 truncate">
                          <HardHat size={14} strokeWidth={1.5} className="shrink-0" />
                          {project.developer.name}
                        </span>
                      )}
                      {project.builder && (
                        <span className="flex items-center gap-1.5 truncate">
                          <Home size={14} strokeWidth={1.5} className="shrink-0" />
                          {project.builder.name}
                        </span>
                      )}
                    </div>

                    {/* Métricas */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2a2a2a] text-sm text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Layers size={14} strokeWidth={1.5} />
                        {towersCount} torres
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Key size={14} strokeWidth={1.5} />
                        {unitsCount} unidades
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}