"use client";

import { useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileDown,
  Filter,
  RefreshCw,
} from "lucide-react";

const reportTypes = [
  { value: "clients", label: "Clientes" },
  { value: "deals", label: "Negócios" },
  { value: "units", label: "Unidades" },
  { value: "projects", label: "Projetos" },
  { value: "activities", label: "Atividades" },
];

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "LEAD", label: "Lead" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "CLIENT", label: "Cliente" },
  { value: "LOST", label: "Perdido" },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("clients");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  const inputClass =
    "px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600 transition";
  const labelClass = "block text-xs text-gray-500 mb-1.5";

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.append("type", reportType);
    if (startDate) params.append("start", startDate);
    if (endDate) params.append("end", endDate);
    if (status) params.append("status", status);
    return params.toString();
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setLoading(true);
    const query = buildQuery();
    const endpoint = `/api/export/${format}?${query}`;
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Erro ao gerar arquivo");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const extension = format === "csv" ? "csv" : format === "excel" ? "xlsx" : "pdf";
      a.download = `relatorio_${reportType}_${new Date().toISOString().slice(0, 10)}.${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      alert("Não foi possível exportar. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    setShowPreview(!showPreview);
    // Simular prévia (substitua por dados reais se desejar)
    setPreviewData([
      { id: "1", name: "Cliente A", status: "LEAD" },
      { id: "2", name: "Cliente B", status: "PROSPECT" },
      { id: "3", name: "Cliente C", status: "CLIENT" },
    ]);
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Relatórios</h1>
            <p className="text-sm text-gray-500 mt-1">Gere relatórios em CSV, Excel ou PDF</p>
          </div>
          <button
            onClick={handlePreview}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <RefreshCw size={16} strokeWidth={1.5} />
            Pré-visualizar
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Filter size={18} className="text-gray-400" strokeWidth={1.5} />
            Filtros
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tipo de relatório</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className={`w-full ${inputClass}`}
              >
                {reportTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full ${inputClass}`}
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Data inicial</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full ${inputClass}`}
              />
            </div>

            <div>
              <label className={labelClass}>Data final</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full ${inputClass}`}
              />
            </div>
          </div>
        </div>

        {/* Botões de exportação */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => handleExport("csv")}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition disabled:opacity-50"
          >
            <FileDown size={18} strokeWidth={1.5} />
            Exportar CSV
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition disabled:opacity-50"
          >
            <FileSpreadsheet size={18} strokeWidth={1.5} />
            Exportar Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition disabled:opacity-50"
          >
            <FileText size={18} strokeWidth={1.5} />
            Exportar PDF
          </button>
        </div>

        {/* Prévia (opcional) */}
        {showPreview && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a2a]">
              <h2 className="text-lg font-medium text-white">Prévia dos dados</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#222]">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">ID</th>
                    <th className="px-6 py-3 font-medium">Nome</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {previewData.map((row) => (
                    <tr key={row.id} className="hover:bg-[#2a2a2a] transition">
                      <td className="px-6 py-4 text-gray-400">{row.id}</td>
                      <td className="px-6 py-4 font-medium text-gray-200">{row.name}</td>
                      <td className="px-6 py-4 text-gray-400">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}