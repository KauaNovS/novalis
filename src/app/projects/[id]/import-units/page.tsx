"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileJson } from "lucide-react";

export default function ImportUnitsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const exampleJson = `{
  "projectId": "${id}",
  "towerName": "Torre A",
  "units": [
    {
      "unitNumber": "101",
      "floor": 1,
      "typology": "2 Dormitórios",
      "topology": "Jardim",
      "bedrooms": 2,
      "area": 70,
      "parkingSpaces": 1,
      "status": "AVAILABLE",
      "currentPrice": 750000
    },
    {
      "unitNumber": "102",
      "floor": 1,
      "typology": "2 Dormitórios",
      "topology": "Jardim",
      "bedrooms": 2,
      "area": 75,
      "parkingSpaces": 1,
      "status": "AVAILABLE",
      "currentPrice": 780000
    }
  ]
}`;

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const parsed = JSON.parse(jsonText);

      const res = await fetch("/api/units/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao importar unidades");
      }

      setSuccess(`${data.imported} unidades importadas com sucesso!`);
      setJsonText("");

      setTimeout(() => {
        router.push(`/projects/${id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "JSON inválido");
    } finally {
      setLoading(false);
    }
  };

  const handleUseExample = () => {
    setJsonText(exampleJson);
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Voltar */}
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push(`/projects/${id}`);
            }
          }}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-6 transition"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Voltar
        </button>

        {/* Cabeçalho */}
        <h1 className="text-2xl font-medium text-white mb-2">
          Importar Unidades
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Cole um JSON com a lista de unidades para importar em lote.
        </p>

        {/* Card principal */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 md:p-8">
          {/* Exemplo */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium text-gray-400">
                Exemplo de JSON
              </h2>
              <button
                onClick={handleUseExample}
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition"
              >
                <FileJson size={14} strokeWidth={1.5} />
                Usar exemplo
              </button>
            </div>
            <pre className="text-xs text-gray-500 bg-[#222] border border-[#2a2a2a] rounded-xl p-4 overflow-auto max-h-64">
              {exampleJson}
            </pre>
          </div>

          {/* Feedback */}
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400">
              {success}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2">
                JSON das Unidades
              </label>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full h-80 p-4 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 font-mono focus:outline-none focus:ring-1 focus:ring-gray-600 resize-y"
                placeholder="Cole o JSON aqui..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
            >
              <Upload size={16} strokeWidth={1.5} />
              {loading ? "Importando..." : "Importar Unidades"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}