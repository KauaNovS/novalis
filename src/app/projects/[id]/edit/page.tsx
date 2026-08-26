"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Developer {
  id: string;
  name: string;
}

interface Builder {
  id: string;
  name: string;
}

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();

  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [builders, setBuilders] = useState<Builder[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [projectStage, setProjectStage] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [totalTowers, setTotalTowers] = useState("");
  const [developerId, setDeveloperId] = useState("");
  const [builderId, setBuilderId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    fetch("/api/developers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDevelopers(data);
      })
      .catch(() => {});

    fetch("/api/builders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBuilders(data);
      })
      .catch(() => {});

    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setName(data.name || "");
          setDescription(data.description || "");
          setNeighborhood(data.neighborhood || "");
          setCity(data.city || "");
          setState(data.state || "");
          setZipCode(data.zipCode || "");
          setAddress(data.address || "");
          setAddressNumber(data.addressNumber || "");
          setZone(data.zone || "");
          setStatus(data.status || "ACTIVE");
          setProjectStage(data.projectStage || "");
          setDeliveryDate(data.deliveryDate ? data.deliveryDate.slice(0, 7) : "");
          setTotalUnits(data.totalUnits ? String(data.totalUnits) : "");
          setTotalTowers(data.totalTowers ? String(data.totalTowers) : "");
          setDeveloperId(data.developerId || "");
          setBuilderId(data.builderId || "");
          setCurrentImageUrl(data.imageUrl || "");
        }
      })
      .catch(() => setError("Erro ao carregar projeto"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          neighborhood,
          city,
          state,
          zipCode,
          address,
          addressNumber,
          zone,
          status,
          projectStage,
          deliveryDate: deliveryDate ? `${deliveryDate}-01` : null,
          totalUnits,
          totalTowers,
          developerId: developerId || null,
          builderId: builderId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar projeto");

      if (image) {
        const formData = new FormData();
        formData.append("file", image);
        await fetch(`/api/projects/${id}/image`, {
          method: "POST",
          body: formData,
        });
      }

      router.push(`/projects/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="p-8">Carregando...</main>;

  return (
    <main className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href={`/projects/${id}`} className="text-sm text-gray-600 hover:text-gray-900">
            ← Voltar para detalhes
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Projeto</h1>

        {error && <p className="mb-4 text-sm text-gray-600">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-gray-900" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Incorporadora</label>
                <select value={developerId} onChange={(e) => setDeveloperId(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-white">
                  <option value="">Selecione...</option>
                  {developers.map((dev) => (
                    <option key={dev.id} value={dev.id}>{dev.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Construtora</label>
                <select value={builderId} onChange={(e) => setBuilderId(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-white">
                  <option value="">Selecione...</option>
                  {builders.map((builder) => (
                    <option key={builder.id} value={builder.id}>{builder.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                <input type="text" value={addressNumber} onChange={(e) => setAddressNumber(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona</label>
                <input type="text" value={zone} onChange={(e) => setZone(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rua / Endereço</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input type="text" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade*</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado*</label>
                <input type="text" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estágio do Projeto</label>
                <select value={projectStage} onChange={(e) => setProjectStage(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-white">
                  <option value="">Selecione...</option>
                  <option value="PRE_LAUNCH">Pré-lançamento</option>
                  <option value="LAUNCHING">Lançamento</option>
                  <option value="UNDER_CONSTRUCTION">Em construção</option>
                  <option value="KEYS_DELIVERY">Entrega de chaves</option>
                  <option value="READY">Pronto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega (mês/ano)</label>
                <input type="month" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total de Unidades</label>
                <input type="number" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total de Torres</label>
                <input type="number" value={totalTowers} onChange={(e) => setTotalTowers(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-white">
                  <option value="ACTIVE">Ativo</option>
                  <option value="DRAFT">Rascunho</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="ARCHIVED">Arquivado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Capa</label>
              {currentImageUrl && <img src={currentImageUrl} alt="Capa atual" className="h-40 w-full object-cover rounded-md mb-2" />}
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-600" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm" rows={3} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full rounded-full bg-gray-900 py-3 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </form>
      </div>
    </main>
  );
}