"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, ExternalLink } from "lucide-react";

interface Tower {
  id: string;
  name: string;
}

export default function NewUnitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] p-8 text-gray-500">Carregando...</div>}>
      <NewUnitForm />
    </Suspense>
  );
}

function NewUnitForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") || "";

  const [towers, setTowers] = useState<Tower[]>([]);
  const [towerId, setTowerId] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [typology, setTypology] = useState("");
  const [topology, setTopology] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [area, setArea] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [status, setStatus] = useState("AVAILABLE");
  const [currentPrice, setCurrentPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetch(`/api/towers?projectId=${projectId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTowers(data);
          if (data.length > 0) setTowerId(data[0].id);
        }
      })
      .catch(() => setError("Erro ao carregar torres"));
  }, [projectId]);

  const handleFileChange = (file: File | null) => {
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      // 1. Criar unidade
      const res = await fetch("/api/units", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          towerId,
          unitNumber,
          floor,
          typology,
          topology,
          bedrooms,
          area,
          parkingSpaces,
          status,
          currentPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar unidade");

      const createdUnit = data;

      // 2. Upload da planta (se houver)
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const imageRes = await fetch(`/api/units/${createdUnit.id}/image`, {
          method: "POST",
          body: formData,
        });

        if (!imageRes.ok) {
          const imageData = await imageRes.json();
          throw new Error(imageData.error || "Erro ao enviar imagem");
        }
      }

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">Projeto não informado.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Voltar */}
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push(`/projects/${projectId}`);
            }
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>

        {/* Card principal */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-white mb-6">
            Nova Unidade
          </h1>

          {error && (
            <p className="text-sm text-rose-400 mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Torre */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Torre*</label>
              <select
                value={towerId}
                onChange={(e) => setTowerId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                required
              >
                {towers.map((tower) => (
                  <option key={tower.id} value={tower.id}>
                    {tower.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Número e Andar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Número da Unidade*
                </label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Andar*
                </label>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  required
                />
              </div>
            </div>

            {/* Tipologia e Topologia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Tipologia
                </label>
                <input
                  type="text"
                  value={typology}
                  onChange={(e) => setTypology(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  placeholder="Ex: 2 Dormitórios"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Topologia
                </label>
                <input
                  type="text"
                  value={topology}
                  onChange={(e) => setTopology(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
            </div>

            {/* Dormitórios, Área, Vagas, Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Dormitórios
                </label>
                <input
                  type="number"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Área (m²)*
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Vagas
                </label>
                <input
                  type="number"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  <option value="AVAILABLE">Disponível</option>
                  <option value="RESERVED">Reservado</option>
                  <option value="SOLD">Vendido</option>
                  <option value="BLOCKED">Bloqueado</option>
                  <option value="UNAVAILABLE">Indisponível</option>
                </select>
              </div>
            </div>

            {/* Preço */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Preço (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
              />
            </div>

            {/* Upload da planta */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Planta da Unidade
              </label>
              {imagePreview ? (
                <div className="mb-3 bg-[#222] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Pré-visualização da planta"
                    className="w-full max-h-[300px] object-contain"
                  />
                </div>
              ) : (
                <div className="mb-3 bg-[#222] border border-[#2a2a2a] rounded-2xl p-8 text-center">
                  <p className="text-sm text-gray-600">Nenhuma planta selecionada</p>
                </div>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2a2a] text-gray-300 text-sm cursor-pointer hover:bg-[#333] transition">
                <Upload size={16} strokeWidth={1.5} />
                {imagePreview ? "Trocar planta" : "Enviar planta"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    handleFileChange(file);
                  }}
                />
              </label>
            </div>

            {/* Botão salvar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {loading ? "Salvando..." : "Salvar Unidade"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}