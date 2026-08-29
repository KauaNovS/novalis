"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2, HardHat } from "lucide-react";

export default function NewDeveloperPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [document, setDocument] = useState("");
  const [creci, setCreci] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (file: File | null) => {
    setLogoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setLogoPreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      // 1. Criar incorporadora
      const res = await fetch("/api/developers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          legalName,
          document,
          creci,
          description,
          website,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar incorporadora");

      // 2. Upload da logo, se houver
      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const logoRes = await fetch(`/api/developers/${data.id}/logo`, {
          method: "POST",
          body: formData,
        });

        if (!logoRes.ok) {
          const logoData = await logoRes.json();
          throw new Error(logoData.error || "Erro ao enviar logo");
        }
      }

      router.push("/developers");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
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
            Nova Incorporadora
          </h1>

          {error && (
            <p className="text-sm text-rose-400 mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nome*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                placeholder="Ex: Cyrela"
                required
              />
            </div>

            {/* Razão social */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
              />
            </div>

            {/* CNPJ e CRECI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  CNPJ/CPF
                </label>
                <input
                  type="text"
                  value={document}
                  onChange={(e) => setDocument(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  CRECI
                </label>
                <input
                  type="text"
                  value={creci}
                  onChange={(e) => setCreci(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
            </div>

            {/* Site */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Site
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                placeholder="https://..."
              />
            </div>

            {/* Logo upload */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                Logo
              </label>
              {logoPreview ? (
                <div className="mb-3 w-24 h-24 rounded-2xl bg-[#222] border border-[#2a2a2a] overflow-hidden">
                  <img
                    src={logoPreview}
                    alt="Pré-visualização da logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="mb-3 w-24 h-24 rounded-2xl bg-[#222] border border-[#2a2a2a] flex items-center justify-center">
                  <HardHat size={32} strokeWidth={1.5} className="text-gray-600" />
                </div>
              )}

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2a2a2a] text-gray-300 text-sm cursor-pointer hover:bg-[#333] transition">
                <Upload size={16} strokeWidth={1.5} />
                {logoPreview ? "Trocar logo" : "Enviar logo"}
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

            {/* Botão salvar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {loading && (
                <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              )}
              {loading ? "Salvando..." : "Salvar Incorporadora"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}