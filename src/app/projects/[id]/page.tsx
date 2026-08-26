"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  HardHat,
  Home,
  MapPin,
  Layers,
  Key,
  FileText,
  Plus,
  Grid3X3,
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
}

interface Tower {
  id: string;
  name: string;
  floors: number;
  units: Unit[];
}

interface ProjectDetail {
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
  zipCode: string | null;
  zone: string | null;
  latitude: number | null;
  longitude: number | null;
  deliveryDate: string | null;
  totalUnits: number;
  totalTowers: number;
  imageUrl?: string | null;
  developer?: { name: string } | null;
  builder?: { name: string } | null;
  towers: Tower[];
  units: Unit[];
  documents?: any[];
}

const statusBadge: Record<string, string> = {
  AVAILABLE: "bg-emerald-500/10 text-emerald-400",
  RESERVED: "bg-amber-500/10 text-amber-400",
  SOLD: "bg-rose-500/10 text-rose-400",
  BLOCKED: "bg-violet-500/10 text-violet-400",
  UNAVAILABLE: "bg-gray-500/10 text-gray-400",
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setProject(data);
      })
      .catch(() => setError("Erro ao carregar projeto"))
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

  if (error || !project) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">{error || "Projeto não encontrado"}</p>
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/projects");
                }
              }}
              className="text-gray-400 hover:text-white mt-4 inline-block"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  const fullAddress = [
    project.address,
    project.addressNumber ? `, ${project.addressNumber}` : "",
    project.neighborhood ? ` - ${project.neighborhood}` : "",
    project.city ? ` - ${project.city}` : "",
    project.state ? `/${project.state}` : "",
    project.zipCode ? ` - CEP: ${project.zipCode}` : "",
    project.zone ? ` - Zona: ${project.zone}` : "",
  ]
    .filter(Boolean)
    .join("");

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Voltar com histórico */}
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/projects");
            }
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>

        {/* Cabeçalho */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden mb-6">
          {project.imageUrl && (
            <div className="h-64 w-full">
              <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-white">{project.name}</h1>

            {/* Endereço completo */}
            <div className="flex items-start gap-2 mt-3 text-sm text-gray-400">
              <MapPin size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              <p>{fullAddress || "Endereço não cadastrado"}</p>
            </div>

            {project.deliveryDate && (
              <p className="text-sm text-gray-500 mt-2">
                Entrega prevista: {new Date(project.deliveryDate).toLocaleDateString("pt-BR")}
              </p>
            )}

            {project.description && (
              <p className="text-sm text-gray-400 mt-3">{project.description}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-400">
              {project.developer && (
                <span className="flex items-center gap-1.5">
                  <HardHat size={14} strokeWidth={1.5} />
                  {project.developer.name}
                </span>
              )}
              {project.builder && (
                <span className="flex items-center gap-1.5">
                  <Home size={14} strokeWidth={1.5} />
                  {project.builder.name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Layers size={14} strokeWidth={1.5} />
                {project.towers.length} torres
              </span>
              <span className="flex items-center gap-1.5">
                <Key size={14} strokeWidth={1.5} />
                {project.units.length} unidades
              </span>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Link
            href={`/projects/${project.id}/matrix`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <Grid3X3 size={16} strokeWidth={1.5} />
            Matriz
          </Link>
          <Link
            href={`/projects/${project.id}/documents`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <FileText size={16} strokeWidth={1.5} />
            Documentos
          </Link>
          <Link
            href={`/towers/new?projectId=${project.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <Plus size={16} strokeWidth={1.5} />
            Nova Torre
          </Link>
          <Link
            href={`/units/new?projectId=${project.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <Plus size={16} strokeWidth={1.5} />
            Nova Unidade
          </Link>
          <Link
            href={`/projects/${project.id}/import-units`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <FileText size={16} strokeWidth={1.5} />
            Importar Unidades
          </Link>
          <Link
            href={`/projects/${project.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            Editar
          </Link>
        </div>

        {/* Torres e unidades */}
        {project.towers.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-gray-500">Nenhuma torre cadastrada.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {project.towers.map((tower) => (
              <div key={tower.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-5">
                <h3 className="text-base font-medium text-gray-200 mb-4">
                  {tower.name}
                  <span className="text-sm text-gray-600 ml-2">({tower.floors} andares)</span>
                </h3>

                {tower.units.length === 0 ? (
                  <p className="text-sm text-gray-600">Sem unidades.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-gray-500 border-b border-[#2a2a2a]">
                          <th className="pb-2 pr-4 font-medium">Unidade</th>
                          <th className="pb-2 pr-4 font-medium">Tipologia</th>
                          <th className="pb-2 pr-4 font-medium">Andar</th>
                          <th className="pb-2 pr-4 font-medium">Área (m²)</th>
                          <th className="pb-2 pr-4 font-medium">Vagas</th>
                          <th className="pb-2 pr-4 font-medium">R$/m²</th>
                          <th className="pb-2 pr-4 font-medium">Preço</th>
                          <th className="pb-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tower.units.map((unit) => (
                          <tr
                            key={unit.id}
                            onClick={() => router.push(`/units/${unit.id}`)}
                            className="border-b border-[#2a2a2a] hover:bg-[#2a2a2a] cursor-pointer transition"
                          >
                            <td className="py-3 pr-4 font-medium text-gray-300">{unit.unitNumber}</td>
                            <td className="py-3 pr-4 text-gray-400">{unit.typology || "—"}</td>
                            <td className="py-3 pr-4 text-gray-400">{unit.floor}º</td>
                            <td className="py-3 pr-4 text-gray-400">{unit.area.toFixed(2)}</td>
                            <td className="py-3 pr-4 text-gray-400">{unit.parkingSpaces}</td>
                            <td className="py-3 pr-4 text-gray-400">
                              {unit.pricePerSquareMeter ? `R$ ${unit.pricePerSquareMeter.toLocaleString("pt-BR")}` : "—"}
                            </td>
                            <td className="py-3 pr-4 text-gray-200 font-medium">
                              {unit.currentPrice ? `R$ ${unit.currentPrice.toLocaleString("pt-BR")}` : "—"}
                            </td>
                            <td className="py-3">
                              <span className={`text-xs px-2 py-1 rounded-full ${statusBadge[unit.status] || statusBadge.UNAVAILABLE}`}>
                                {unit.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}