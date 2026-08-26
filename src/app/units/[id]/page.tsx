"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, Pencil, ExternalLink, Eye, Save } from "lucide-react";

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
  imageUrl: string | null;
  project?: { name: string } | null;
  tower?: { name: string } | null;
}

export default function UnitDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Aba ativa
  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");

  // Campos editáveis
  const [unitNumber, setUnitNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [typology, setTypology] = useState("");
  const [topology, setTopology] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [area, setArea] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [currentPrice, setCurrentPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/units/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUnit(data);
          // Preencher formulário
          setUnitNumber(data.unitNumber || "");
          setFloor(data.floor ? String(data.floor) : "");
          setTypology(data.typology || "");
          setTopology(data.topology || "");
          setBedrooms(data.bedrooms ? String(data.bedrooms) : "");
          setArea(data.area ? String(data.area) : "");
          setParkingSpaces(data.parkingSpaces ? String(data.parkingSpaces) : "");
          setStatus(data.status || "AVAILABLE");
          setCurrentPrice(data.currentPrice ? String(data.currentPrice) : "");
          setImageUrl(data.imageUrl || "");
        }
      })
      .catch(() => setError("Erro ao carregar unidade"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/units/${id}/image`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar imagem");
      setImageUrl(data.imageUrl || "");
      setUnit(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/units/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          unitNumber,
          floor,
          typology,
          topology,
          bedrooms,
          area,
          parkingSpaces,
          status,
          currentPrice,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar unidade");

      setUnit(data);
      setActiveTab("view");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 animate-pulse">
            <div className="h-6 bg-[#2a2a2a] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-2/3"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error && !unit) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">{error || "Unidade não encontrada"}</p>
          </div>
        </div>
      </main>
    );
  }

  const statusColor =
    unit.status === "AVAILABLE"
      ? "#34d399"
      : unit.status === "SOLD"
      ? "#f87171"
      : unit.status === "RESERVED"
      ? "#fbbf24"
      : "#94a3b8";

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Topo: voltar e abas */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/units");
              }
            }}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Voltar
          </button>

          {/* Abas */}
          <div className="flex gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1">
            <button
              onClick={() => setActiveTab("view")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "view"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Eye size={14} strokeWidth={1.5} />
              Visualizar
            </button>
            <button
              onClick={() => setActiveTab("edit")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "edit"
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Pencil size={14} strokeWidth={1.5} />
              Editar
            </button>
          </div>
        </div>

        {/* Conteúdo da aba */}
        {activeTab === "view" ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8">
            {/* Planta */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-gray-400 mb-3">Planta da Unidade</h2>
              <div className="bg-[#222] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                {unit.imageUrl ? (
                  <img
                    src={unit.imageUrl}
                    alt={`Planta da unidade ${unit.unitNumber}`}
                    className="w-full max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="p-12 text-center text-gray-600">
                    <p className="text-sm">Nenhuma planta cadastrada</p>
                  </div>
                )}
                <div className="p-4 border-t border-[#2a2a2a] flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2a2a] text-gray-300 text-sm cursor-pointer hover:bg-[#333] transition">
                    <Upload size={16} strokeWidth={1.5} />
                    {unit.imageUrl ? "Trocar planta" : "Enviar planta"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                    />
                  </label>
                  {unit.imageUrl && (
                    <a
                      href={unit.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition"
                    >
                      <ExternalLink size={14} strokeWidth={1.5} />
                      Ver ampliada
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-white">
                  Unidade {unit.unitNumber}
                </h1>
                <p className="text-gray-400 mt-1">{unit.typology || "Sem tipologia"}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {unit.project?.name || "Projeto"} · {unit.tower?.name || "Torre"} · {unit.floor}º andar
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold uppercase"
                style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
              >
                {unit.status}
              </span>
            </div>

            <div className="border-t border-[#2a2a2a] my-6" />

            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Área</p>
                <p className="text-lg font-semibold text-white mt-1">{unit.area.toFixed(2)} m²</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dormitórios</p>
                <p className="text-lg font-semibold text-white mt-1">{unit.bedrooms}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Vagas</p>
                <p className="text-lg font-semibold text-white mt-1">{unit.parkingSpaces}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Preço/m²</p>
                <p className="text-lg font-semibold text-white mt-1">
                  {unit.pricePerSquareMeter ? `R$ ${unit.pricePerSquareMeter.toLocaleString("pt-BR")}` : "—"}
                </p>
              </div>
            </div>

            {/* Preço total */}
            <div className="mt-6 bg-[#222] border border-[#2a2a2a] rounded-2xl p-6 text-center">
              <p className="text-xs text-gray-500">Preço total</p>
              <p className="text-2xl md:text-3xl font-bold text-white mt-1">
                {unit.currentPrice ? `R$ ${unit.currentPrice.toLocaleString("pt-BR")}` : "Sob consulta"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8">
            <h1 className="text-2xl font-semibold text-white mb-6">Editar Unidade</h1>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Número da Unidade*</label>
                  <input type="text" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Andar*</label>
                  <input type="number" value={floor} onChange={(e) => setFloor(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tipologia</label>
                  <input type="text" value={typology} onChange={(e) => setTypology(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Topologia</label>
                  <input type="text" value={topology} onChange={(e) => setTopology(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dormitórios</label>
                  <input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Área (m²)*</label>
                  <input type="number" step="0.01" value={area} onChange={(e) => setArea(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600" required />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Vagas</label>
                  <input type="number" value={parkingSpaces} onChange={(e) => setParkingSpaces(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600">
                    <option value="AVAILABLE">Disponível</option>
                    <option value="RESERVED">Reservado</option>
                    <option value="SOLD">Vendido</option>
                    <option value="BLOCKED">Bloqueado</option>
                    <option value="UNAVAILABLE">Indisponível</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Preço (R$)</label>
                <input type="number" step="0.01" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600" />
              </div>

              <button type="submit" disabled={saving} className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition">
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}