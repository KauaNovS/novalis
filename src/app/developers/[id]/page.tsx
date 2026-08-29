"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  HardHat,
  FileText,
  Globe,
  Layers,
  MapPin,
  Building2,
  Pencil,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  status: string;
  totalUnits: number;
  totalTowers: number;
  imageUrl?: string | null;
}

interface Developer {
  id: string;
  name: string;
  legalName: string | null;
  document: string | null;
  description: string | null;
  website: string | null;
  logo: string | null;
  active: boolean;
  projects: Project[];
}

export default function DeveloperDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/developers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setDeveloper(data);
      })
      .catch(() => setError("Erro ao carregar incorporadora"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 animate-pulse">
            <div className="h-6 bg-[#2a2a2a] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-2/3"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !developer) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">{error || "Incorporadora não encontrada"}</p>
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white mt-4 inline-block"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Voltar */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>

        {/* Cabeçalho da incorporadora */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden mb-8">
          <div className="h-48 bg-[#222] relative">
            {developer.logo ? (
              <img
                src={developer.logo}
                alt={developer.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <HardHat size={64} strokeWidth={1.5} className="text-gray-700" />
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-white">
                  {developer.name}
                </h1>
                {developer.legalName && (
                  <p className="text-gray-400 mt-1">{developer.legalName}</p>
                )}
              </div>
              <Link
                href={`/developers/${developer.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
              >
                <Pencil size={16} strokeWidth={1.5} />
                Editar
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
              {developer.document && (
                <span className="flex items-center gap-1.5">
                  <FileText size={14} strokeWidth={1.5} />
                  {developer.document}
                </span>
              )}
              {developer.website && (
                <a
                  href={developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-gray-200 transition"
                >
                  <Globe size={14} strokeWidth={1.5} />
                  {developer.website}
                </a>
              )}
              <span className="flex items-center gap-1.5">
                <Layers size={14} strokeWidth={1.5} />
                {developer.projects.length} projetos
              </span>
            </div>

            {developer.description && (
              <p className="text-sm text-gray-400 mt-4">{developer.description}</p>
            )}
          </div>
        </div>

        {/* Projetos vinculados */}
        <h2 className="text-xl font-medium text-white mb-4">Projetos</h2>
        {developer.projects.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <Building2 size={32} strokeWidth={1.5} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum projeto vinculado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {developer.projects.map((project) => (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}`)}
                className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden cursor-pointer hover:border-gray-600 transition-all duration-200"
              >
                <div className="h-40 bg-[#222] relative overflow-hidden">
                  {project.imageUrl ? (
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 size={40} strokeWidth={1.5} className="text-gray-700" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-base font-medium text-gray-200 truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {project.neighborhood || ""} {project.city ? `· ${project.city}` : ""}{" "}
                    {project.state ? `/ ${project.state}` : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                    <span>{project.totalTowers} torres</span>
                    <span>{project.totalUnits} unidades</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}