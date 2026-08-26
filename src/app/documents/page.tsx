"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Download,
  Trash2,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  status: string;
  path: string;
  projectId?: string | null;
  project?: { name: string } | null;
  uploadedAt: string;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  UPLOADED: { label: "Enviado", icon: Clock, color: "text-gray-400" },
  PROCESSING: { label: "Processando", icon: Loader2, color: "text-yellow-400" },
  PROCESSED: { label: "Concluído", icon: CheckCircle2, color: "text-emerald-400" },
  ERROR: { label: "Erro", icon: XCircle, color: "text-rose-400" },
};

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [search, filterStatus]);

  const fetchDocuments = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (filterStatus) params.append("status", filterStatus);

    try {
      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setDocuments(data);
      else if (data.data) setDocuments(data.data);
      else setDocuments([]);
    } catch {
      setError("Erro ao carregar documentos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este documento?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
      } else {
        setError("Erro ao excluir documento");
      }
    } catch {
      setError("Erro ao excluir documento");
    } finally {
      setDeletingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredDocs = documents.filter((doc) => {
    if (filterStatus && doc.status !== filterStatus) return false;
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Documentos</h1>
            <p className="text-sm text-gray-500 mt-1">
              Total: {documents.length} documento{documents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/documents/upload"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
          >
            <Plus size={16} strokeWidth={1.5} />
            Enviar Documento
          </Link>
        </div>

        {/* Busca e filtro */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition"
            />
          </div>
          <select
            value={filterStatus || ""}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600 transition"
          >
            <option value="">Todos os status</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 animate-pulse">
            <div className="h-6 bg-[#2a2a2a] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-2/3"></div>
          </div>
        ) : error ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">{error}</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <div className="text-5xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Nenhum documento encontrado</h3>
            <p className="text-sm text-gray-600">Envie um novo documento ou ajuste os filtros.</p>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#222]">
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3 font-medium">Nome</th>
                    <th className="px-6 py-3 font-medium">Tipo</th>
                    <th className="px-6 py-3 font-medium">Projeto</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Tamanho</th>
                    <th className="px-6 py-3 font-medium">Enviado em</th>
                    <th className="px-6 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {filteredDocs.map((doc) => {
                    const status = statusConfig[doc.status] || statusConfig.UPLOADED;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={doc.id} className="hover:bg-[#2a2a2a] transition">
                        <td className="px-6 py-4 font-medium text-gray-200">{doc.name}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{doc.type || doc.mimeType}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {doc.project?.name || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs ${status.color}`}>
                            <StatusIcon size={14} className={doc.status === "PROCESSING" ? "animate-spin" : ""} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{formatSize(doc.size)}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">
                          {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <a
                              href={doc.path}
                              download
                              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-[#2a2a2a] transition"
                              title="Baixar"
                            >
                              <Download size={16} />
                            </a>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              disabled={deletingId === doc.id}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-[#2a2a2a] transition disabled:opacity-50"
                              title="Excluir"
                            >
                              {deletingId === doc.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}