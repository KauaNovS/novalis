"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditBuilderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [document, setDocument] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [active, setActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch(`/api/builders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setName(data.name || "");
          setLegalName(data.legalName || "");
          setDocument(data.document || "");
          setDescription(data.description || "");
          setWebsite(data.website || "");
          setCurrentLogoUrl(data.logo || "");
          setActive(data.active !== undefined ? data.active : true);
        }
      })
      .catch(() => setError("Erro ao carregar construtora"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/builders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          legalName,
          document,
          description,
          website,
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar construtora");

      if (logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);

        const uploadRes = await fetch(`/api/builders/${id}/logo`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json();
          throw new Error(uploadData.error || "Erro ao enviar logo");
        }
      }

      router.push("/builders");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFAFA] p-8">
        <p className="text-gray-500">Carregando...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/builders"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Voltar para construtoras
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Editar Construtora
        </h1>

        {error && <p className="mb-4 text-sm text-gray-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome*
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Razão Social
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CNPJ/CPF
              </label>
              <input
                type="text"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo Atual
              </label>
              {currentLogoUrl ? (
                <div className="mb-2">
                  <img
                    src={currentLogoUrl}
                    alt="Logo atual"
                    className="h-16 w-16 rounded-full object-cover border border-gray-200"
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-2">Nenhuma logo cadastrada.</p>
              )}
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nova Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600"
              />
              <p className="text-xs text-gray-400 mt-1">Deixe vazio para manter a logo atual.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
              />
              <span className="text-sm text-gray-700">Ativo</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-gray-900 py-3 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </main>
  );
}