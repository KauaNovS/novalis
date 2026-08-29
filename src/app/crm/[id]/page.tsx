"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Client {
  id: string;
  name: string;
}

export default function EditDealPage() {
  const { id } = useParams();
  const router = useRouter();

  const [clients, setClients] = useState<Client[]>([]);
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [stage, setStage] = useState("LEAD");
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      })
      .catch(() => setError("Erro ao carregar clientes"));

    fetch(`/api/deals/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setTitle(data.title || "");
          setClientId(data.client?.id || "");
          setStage(data.stage || "LEAD");
          setValue(data.value ? String(data.value) : "");
        }
      })
      .catch(() => setError("Erro ao carregar negócio"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/deals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, clientId, stage, value }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar negócio");

      router.push("/crm");
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
      <h1 className="text-3xl font-bold mb-6">Editar Negócio</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Título*</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cliente*</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="w-full px-3 py-2 border rounded-md" required>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estágio</label>
            <select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              <option value="LEAD">Lead</option>
              <option value="CONTACTED">Contatado</option>
              <option value="VISIT_SCHEDULED">Visita Agendada</option>
              <option value="PROPOSAL_SENT">Proposta Enviada</option>
              <option value="NEGOTIATION">Negociação</option>
              <option value="CLOSED_WON">Fechado (Ganho)</option>
              <option value="CLOSED_LOST">Fechado (Perdido)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Valor (R$)</label>
            <input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </main>
  );
}