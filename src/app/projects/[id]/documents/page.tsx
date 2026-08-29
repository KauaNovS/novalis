"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Loader2,
  X,
  FileText,
  File,
  Table,
  BookOpen,
  Presentation,
} from "lucide-react";

interface ProjectDocument {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  path: string;
  status: string;
  uploadedAt: string;
}

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  EBOOK: { label: "E-book", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-500/10" },
  PRICE_TABLE: { label: "Tabela de Preços", icon: Table, color: "text-blue-400", bg: "bg-blue-500/10" },
  SALES_SHEET: { label: "Ficha de Vendas", icon: FileText, color: "text-green-400", bg: "bg-green-500/10" },
  INVENTORY: { label: "Espelho de Vendas", icon: File, color: "text-amber-400", bg: "bg-amber-500/10" },
  CAMPAIGN: { label: "Campanha", icon: Presentation, color: "text-rose-400", bg: "bg-rose-500/10" },
  PRESENTATION: { label: "Apresentação", icon: Presentation, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  OTHER: { label: "Outro", icon: File, color: "text-gray-400", bg: "bg-gray-500/10" },
};

function getDocumentType(mimeType: string, fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (mimeType.includes("pdf") || ext === "pdf") return "PRICE_TABLE";
  if (ext === "xlsx" || ext === "xls" || ext === "csv") return "PRICE_TABLE";
  if (ext === "docx" || ext === "doc") return "SALES_SHEET";
  if (mimeType.startsWith("image/")) return "PRESENTATION";
  if (ext === "pptx" || ext === "ppt") return "PRESENTATION";
  return "OTHER";
}

export default function ProjectDocumentsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchDocuments();
  }, [id]);

  const fetchDocuments = () => {
    setLoading(true);
    fetch(`/api/documents?projectId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDocuments(data);
        else setError(data.error || "Erro ao carregar documentos");
      })
      .catch(() => setError("Erro ao carregar documentos"))
      .finally(() => setLoading(false));
  };

  const handleFileSelect = (file: File | null) => {
    setFile(file);
    if (file) {
      setDocName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Selecione um arquivo");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", docName || file.name);
    formData.append("type", getDocumentType(file.type, file.name));
    formData.append("projectId", id as string);
    formData.append("uploadedBy", "admin@demo.com");

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao enviar documento");

      setFile(null);
      setDocName("");
      setShowUpload(false);
      fetchDocuments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Excluir documento "${docName}"?`)) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao excluir documento");
      }

      setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const isPdf = (doc: ProjectDocument) =>
    doc.mimeType.includes("pdf") || doc.path.endsWith(".pdf");

  const isImage = (doc: ProjectDocument) => doc.mimeType.startsWith("image/");

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Topo */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push(`/projects/${id}`);
              }
            }}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Voltar
          </button>

          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
          >
            <Upload size={16} strokeWidth={1.5} />
            Enviar Documento
          </button>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-semibold text-white mb-2">
          Documentos do Projeto
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Clique em um documento para abrir.
        </p>

        {/* Erro */}
        {error && !showUpload && (
          <p className="text-sm text-rose-400 mb-4">{error}</p>
        )}

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 animate-pulse">
                <div className="h-48 bg-[#2a2a2a] rounded-2xl mb-4"></div>
                <div className="h-4 bg-[#2a2a2a] rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <FileText size={32} strokeWidth={1.5} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum documento cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => {
              const config = typeConfig[doc.type] || typeConfig.OTHER;
              const Icon = config.icon;
              return (
                <div
                  key={doc.id}
                  onClick={() => window.open(doc.path, "_blank")}
                  className="group bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 cursor-pointer hover:border-gray-600 transition-all duration-200 relative overflow-hidden"
                >
                  {/* Botão excluir */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(doc.id, doc.name);
                    }}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-[#2a2a2a] transition z-10 bg-black/50 backdrop-blur-sm"
                    title="Excluir"
                  >
                    <Trash2 size={16} strokeWidth={1.5} />
                  </button>

                  {/* Capa */}
                  <div className="h-48 rounded-2xl overflow-hidden bg-[#222] mb-4 flex items-center justify-center">
                    {isImage(doc) ? (
                      <img
                        src={doc.path}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                      />
                    ) : isPdf(doc) ? (
                      <iframe
                        src={doc.path}
                        title={doc.name}
                        className="w-full h-full"
                        style={{ border: "none" }}
                      />
                    ) : (
                      <Icon size={48} strokeWidth={1.5} className={config.color} />
                    )}
                  </div>

                  {/* Nome e tipo */}
                  <h3 className="text-base font-medium text-gray-200 truncate">
                    {doc.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {config.label} · {(doc.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(doc.uploadedAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Enviar Documento</h2>
              <button
                onClick={() => {
                  setShowUpload(false);
                  setFile(null);
                  setDocName("");
                }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a] transition"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {error && <p className="text-sm text-rose-400 mb-4">{error}</p>}

            <div className="space-y-4">
              <label className="block w-full">
                <div className="border-2 border-dashed border-[#2a2a2a] rounded-2xl p-8 text-center cursor-pointer hover:border-gray-600 transition">
                  <Upload size={24} strokeWidth={1.5} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    {file ? file.name : "Clique para selecionar arquivo"}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                />
              </label>

              {file && (
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Nome do Documento
                  </label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  />
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {uploading ? (
                  <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
                ) : (
                  <Upload size={16} strokeWidth={1.5} />
                )}
                {uploading ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}