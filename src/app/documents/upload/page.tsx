"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Project {
  id: string;
  name: string;
}

export default function UploadDocumentPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <UploadDocumentForm />
    </Suspense>
  );
}

function UploadDocumentForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectIdParam = searchParams.get("projectId") || "";

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState(projectIdParam);
  const [name, setName] = useState("");
  const [type, setType] = useState("OTHER");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
          if (!projectId && data.length > 0) setProjectId(data[0].id);
        }
      })
      .catch(() => setError("Erro ao carregar projetos"));
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!file) {
      setError("Selecione um arquivo");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name || file.name);
    formData.append("type", type);
    formData.append("projectId", projectId);
    formData.append("uploadedBy", "admin@demo.com");

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao fazer upload");

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Upload de Documento</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Projeto</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-3 py-2 border rounded-md">
            {projects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nome do Documento</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Ex: Tabela de vendas - Dezembro" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-3 py-2 border rounded-md">
            <option value="OTHER">Outro</option>
            <option value="EBOOK">E-book</option>
            <option value="PRICE_TABLE">Tabela de Preços</option>
            <option value="SALES_SHEET">Ficha de Vendas</option>
            <option value="INVENTORY">Espelho de Vendas</option>
            <option value="CAMPAIGN">Campanha</option>
            <option value="PRESENTATION">Apresentação</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Arquivo</label>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full px-3 py-2 border rounded-md" required />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Enviando..." : "Enviar Documento"}
        </button>
      </form>
    </main>
  );
}
