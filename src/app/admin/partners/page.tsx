"use client";

import { useEffect, useState } from "react";

export default function AdminPartnersPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const res = await fetch("/api/partners");
    const data = await res.json();
    if (Array.isArray(data)) setCompanies(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/partners/${id}/approve`, { method: "POST" });
    fetchCompanies();
  };

  if (loading) return <main className="p-8">Carregando...</main>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Incorporadoras Pendentes</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {companies.filter((c) => !c.active).length === 0 && (
          <p className="text-gray-500">Nenhuma pendência.</p>
        )}
        {companies
          .filter((c) => !c.active)
          .map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold">{c.name}</h2>
              <p className="text-sm text-gray-500">{c.email}</p>
              <p className="text-sm text-gray-400">{c.document || "Sem documento"}</p>
              <button
                onClick={() => handleApprove(c.id)}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Aprovar
              </button>
            </div>
          ))}
      </div>
    </main>
  );
}
