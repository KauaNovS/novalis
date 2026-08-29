"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";

interface Developer {
  id: string;
  name: string;
}

interface Builder {
  id: string;
  name: string;
}

export default function NewProjectPage() {
  const router = useRouter();

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [developerId, setDeveloperId] = useState("");
  const [builderId, setBuilderId] = useState("");

  // Endereço
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [zone, setZone] = useState("");

  // Outros
  const [totalUnits, setTotalUnits] = useState("");
  const [totalTowers, setTotalTowers] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
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
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          developerId: developerId || null,
          builderId: builderId || null,
          address,
          addressNumber,
          neighborhood,
          city,
          state,
          zipCode,
          zone,
          totalUnits,
          totalTowers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar projeto");

      // Upload da imagem de capa
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const imageRes = await fetch(`/api/projects/${data.id}/image`, {
          method: "POST",
          body: formData,
        });

        if (!imageRes.ok) {
          const imageData = await imageRes.json();
          throw new Error(imageData.error || "Erro ao enviar imagem");
        }
      }

      router.push(`/projects/${data.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Voltar */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>

        {/* Card principal */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-white mb-6">
            Novo Projeto
          </h1>

          {error && (
            <p className="text-sm text-rose-400 mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nome do Projeto*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600 resize-y"
                rows={3}
              />
            </div>

            {/* Incorporadora e Construtora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Incorporadora
                </label>
                <select
                  value={developerId}
                  onChange={(e) => setDeveloperId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  <option value="">Selecione...</option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Construtora
                </label>
                <select
                  value={builderId}
                  onChange={(e) => setBuilderId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  <option value="">Selecione...</option>
                  {builders.map((builder) => (
                    <option key={builder.id} value={builder.id}>
                      {builder.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  placeholder="Rua/Avenida"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={addressNumber}
                  onChange={(e) => setAddressNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Cidade*
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Estado*
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  maxLength={2}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Zona
                </label>
                <input
                  type="text"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
            </div>

            {/* Total de unidades e torres */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Total de Unidades
                </label>
                <input
                  type="number"
                  value={totalUnits}
                  onChange={(e) => setTotalUnits(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Total de Torres
                </label>
                <input
                  type="number"
                  value={totalTowers}
                  onChange={(e) => setTotalTowers(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
            </div>

            {/* Imagem de capa */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Imagem de Capa
              </label>
              {imagePreview ? (
                <div className="mb-3 bg-[#222] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Pré-visualização da capa"
                    className="w-full max-h-[300px] object-cover"
                  />
                </div>
              ) : (
                <div className="mb-3 bg-[#222] border border-[#2a2a2a] rounded-2xl p-8 text-center">
                  <p className="text-sm text-gray-600">Nenhuma imagem selecionada</p>
                </div>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2a2a] text-gray-300 text-sm cursor-pointer hover:bg-[#333] transition">
                <Upload size={16} strokeWidth={1.5} />
                {imagePreview ? "Trocar imagem" : "Enviar imagem"}
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
              {loading ? (
                <Loader2 size={16} strokeWidth={1.5} className="animate-spin inline mr-2" />
              ) : null}
              {loading ? "Salvando..." : "Salvar Projeto"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}