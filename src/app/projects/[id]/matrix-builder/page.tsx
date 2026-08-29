"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Tower {
  id: string;
  name: string;
}

const typologyOptions = [
  "1 Dorm",
  "2 Dorm",
  "3 Dorms",
  "4 Dorms",
  "Loft",
  "Studio",
  "Pé Direito Alto",
  "Pé Direito Duplo",
];

const topologyOptions = [
  "NR",
  "HIS",
  "HIS2",
  "R2V",
  "HMP",
  "Sala Comercial",
  "Loja",
];

export default function MatrixBuilderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [towers, setTowers] = useState<Tower[]>([]);
  const [towerId, setTowerId] = useState("");

  const [startFloor, setStartFloor] = useState("1");
  const [endFloor, setEndFloor] = useState("1");
  const [unitsPerFloor, setUnitsPerFloor] = useState("4");
  const [prefix, setPrefix] = useState("");
  const [startNumber, setStartNumber] = useState("1");

  const [typology, setTypology] = useState("");
  const [topology, setTopology] = useState("");
  const [status, setStatus] = useState("AVAILABLE");

  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [parkingSpaces, setParkingSpaces] = useState("0");
  const [parkingSize, setParkingSize] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/towers?projectId=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTowers(data);
          if (data.length > 0) setTowerId(data[0].id);
        }
      })
      .catch(() => setError("Erro ao carregar torres"));
  }, [id]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    const units = [];

    const start = parseInt(startFloor);
    const end = parseInt(endFloor);
    const perFloor = parseInt(unitsPerFloor);
    const startNum = parseInt(startNumber) || 1;

    for (let floor = start; floor <= end; floor++) {
      for (let i = 0; i < perFloor; i++) {
        const currentNum = startNum + i;
        const unitNumber = `${prefix || ""}${floor}${String(currentNum).padStart(2, "0")}`;

        units.push({
          unitNumber,
          floor,
          typology: typology || null,
          topology: topology || null,
          bedrooms: 0,
          area: parseFloat(area),
          parkingSpaces: parseInt(parkingSpaces) || 0,
          status,
          currentPrice: price ? parseFloat(price) : null,
        });
      }
    }

    try {
      const res = await fetch("/api/units/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: id,
          towerId,
          units,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar unidades");

      setSuccess(`${data.imported} unidades criadas com sucesso!`);
      setTimeout(() => {
        router.push(`/projects/${id}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Gerar Matriz de Unidades
        </h1>

        {error && <p className="mb-4 text-sm text-gray-600">{error}</p>}
        {success && <p className="mb-4 text-sm text-gray-600">{success}</p>}

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Torre
              </label>
              <select
                value={towerId}
                onChange={(e) => setTowerId(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-white"
              >
                {towers.map((tower) => (
                  <option key={tower.id} value={tower.id}>
                    {tower.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Andar Inicial
                </label>
                <input
                  type="number"
                  value={startFloor}
                  onChange={(e) => setStartFloor(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Andar Final
                </label>
                <input
                  type="number"
                  value={endFloor}
                  onChange={(e) => setEndFloor(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidades por Andar
                </label>
                <input
                  type="number"
                  value={unitsPerFloor}
                  onChange={(e) => setUnitsPerFloor(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prefixo
                </label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número Inicial
                </label>
                <input
                  type="number"
                  value={startNumber}
                  onChange={(e) => setStartNumber(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipologia
                </label>
                <select
                  value={typology}
                  onChange={(e) => setTypology(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-white"
                >
                  <option value="">Selecione...</option>
                  {typologyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topologia
                </label>
                <select
                  value={topology}
                  onChange={(e) => setTopology(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-white"
                >
                  <option value="">Selecione...</option>
                  {topologyOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm bg-white"
                >
                  <option value="AVAILABLE">Disponível</option>
                  <option value="RESERVED">Reservado</option>
                  <option value="SOLD">Vendido</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Área (m²)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vagas
                </label>
                <input
                  type="number"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(e.target.value)}
                  className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tamanho da Vaga (m²)
              </label>
              <input
                type="number"
                step="0.01"
                value={parkingSize}
                onChange={(e) => setParkingSize(e.target.value)}
                className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gray-900 py-3 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Matriz"}
          </button>
        </form>
      </div>
    </main>
  );
}