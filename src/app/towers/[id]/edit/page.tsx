"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditTowerPage() {
  const { id } = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [floors, setFloors] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/towers/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setName(data.name || "");
          setFloors(data.floors ? String(data.floors) : "");
        }
      })
      .catch(() => setError("Erro ao carregar torre"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/towers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, floors }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao atualizar torre");

      router.back();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="p-8">Carregando...</main>;

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Editar Torre</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Nome da Torre*</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Número de Andares*</label>
          <input type="number" value={floors} onChange={(e) => setFloors(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </main>
  );
}
