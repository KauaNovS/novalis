"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";

export default function NewTowerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] p-8 text-gray-500">Carregando...</div>}>
      <NewTowerForm />
    </Suspense>
  );
}

function NewTowerForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId") || "";

  const [name, setName] = useState("");
  const [floors, setFloors] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/towers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, name, floors }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar torre");
      }

      router.back();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">Projeto não informado.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-xl mx-auto">
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
          <div className="flex items-center gap-3 mb-6">
            <Building2 size={20} strokeWidth={1.5} className="text-gray-500" />
            <h1 className="text-2xl font-semibold text-white">Nova Torre</h1>
          </div>

          {error && (
            <p className="text-sm text-rose-400 mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Nome da Torre*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                placeholder="Ex: Torre A"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Número de Andares*
              </label>
              <input
                type="number"
                value={floors}
                onChange={(e) => setFloors(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                placeholder="Ex: 20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {loading ? "Salvando..." : "Salvar Torre"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}