"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  HardHat,
  FileText,
  Globe,
  Layers,
  MapPin,
} from "lucide-react";

interface Developer {
  id: string;
  name: string;
  legalName: string | null;
  document: string | null;
  description: string | null;
  website: string | null;
  logo: string | null;
  active: boolean;
  _count?: { projects: number };
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "Ativo", color: "bg-emerald-500/10 text-emerald-400", dot: "bg-emerald-500" },
  inactive: { label: "Inativo", color: "bg-gray-500/10 text-gray-400", dot: "bg-gray-500" },
};

export default function DevelopersPage() {
  const router = useRouter();

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDevelopers();
  }, [searchQuery]);

  const fetchDevelopers = () => {
    setLoading(true);
    const params = searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : "";
    fetch(`/api/developers${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDevelopers(data);
        else setError(data.error || "Erro ao carregar incorporadoras");
      })
      .catch(() => setError("Erro ao carregar incorporadoras"))
      .finally(() => setLoading(false));
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Incorporadoras</h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie as incorporadoras parceiras.
            </p>
          </div>
          <Link
            href="/developers/new"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
          >
            <Plus size={16} strokeWidth={1.5} />
            Nova Incorporadora
          </Link>
        </div>

        {/* Busca */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="text"
              placeholder="Buscar incorporadora..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition"
            />
          </div>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
        ) : developers.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhuma incorporadora encontrada
            </h3>
            <p className="text-sm text-gray-600">
              Crie uma nova incorporadora para começar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developers.map((developer) => {
              const isActive = developer.active;
              const status = isActive ? statusConfig.active : statusConfig.inactive;

              return (
                <div
                  key={developer.id}
                  onClick={() => router.push(`/developers/${developer.id}`)}
                  className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden cursor-pointer hover:border-gray-600 transition-all duration-200"
                >
                  {/* Capa/logo grande */}
                  <div className="h-48 bg-[#222] relative overflow-hidden">
                    {developer.logo ? (
                      <img
                        src={developer.logo}
                        alt={developer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HardHat size={48} strokeWidth={1.5} className="text-gray-700" />
                      </div>
                    )}
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
                      {developer.name}
                    </h2>
                    {developer.legalName && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {developer.legalName}
                      </p>
                    )}

                    <div className="flex flex-col gap-1 mt-3 text-sm text-gray-500">
                      {developer.document && (
                        <span className="flex items-center gap-1.5 truncate">
                          <FileText size={14} strokeWidth={1.5} className="shrink-0" />
                          {developer.document}
                        </span>
                      )}
                      {developer.website && (
                        <span className="flex items-center gap-1.5 truncate">
                          <Globe size={14} strokeWidth={1.5} className="shrink-0" />
                          {developer.website}
                        </span>
                      )}
                    </div>

                    {/* Projetos */}
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex items-center gap-2 text-sm text-gray-500">
                      <Layers size={14} strokeWidth={1.5} />
                      {developer._count?.projects || 0} projetos
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