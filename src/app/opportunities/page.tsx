"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, ChevronRight, X } from "lucide-react";
import StepperFlow, { StepItem } from "@/components/ui/StepperFlow";

interface Opportunity {
  id: string;
  title: string;
  stage: string;
  value: number | null;
  probability: number;
  clientName: string;
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar oportunidades da API
    fetch("/api/deals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOpportunities(data);
        else if (data.data) setOpportunities(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const steps: StepItem[] = [
    { label: "Lead", status: "done" },
    { label: "Prospect", status: "current" },
    { label: "Cliente", status: "upcoming" },
    { label: "Perdido", status: "upcoming" },
  ];

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Oportunidades</h1>
          <Link
            href="/opportunities/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
          >
            <Plus size={16} />
            Nova Oportunidade
          </Link>
        </div>

        {/* Stepper com etapas fixas */}
        <StepperFlow steps={steps} terminalState={{ label: "Cancelar" }} />

        {/* Conteúdo da página */}
        {loading ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 animate-pulse">
            <div className="h-5 bg-[#2a2a2a] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-2/3"></div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <p className="text-gray-500">Nenhuma oportunidade encontrada.</p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#222]">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Título</th>
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Etapa</th>
                  <th className="px-6 py-3 font-medium">Valor</th>
                  <th className="px-6 py-3 font-medium">Probabilidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-[#2a2a2a] transition">
                    <td className="px-6 py-4 font-medium text-gray-200">{opp.title}</td>
                    <td className="px-6 py-4 text-gray-400">{opp.clientName}</td>
                    <td className="px-6 py-4 text-gray-400">{opp.stage}</td>
                    <td className="px-6 py-4 text-gray-400">
                      {opp.value ? `R$ ${opp.value.toLocaleString("pt-BR")}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{opp.probability}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}