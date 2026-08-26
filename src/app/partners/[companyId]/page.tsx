"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  email: string;
  document: string | null;
  projects: Array<{ id: string; name: string; description: string | null; status: string }>;
}

export default function PublicPartnerPage() {
  const { companyId } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!companyId) return;
    fetch(`/api/partners/${companyId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setCompany(data);
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return <main className="p-8">Carregando...</main>;
  if (!company) return <main className="p-8">Empresa não encontrada</main>;

  return (
    <main className="p-8">
      <Link href="/" className="text-sm text-blue-600 hover:underline mb-4 inline-block">← Voltar</Link>
      <h1 className="text-3xl font-bold">{company.name}</h1>
      <p className="text-gray-600 mt-1">{company.email}</p>
      {company.document && <p className="text-gray-500 text-sm mt-1">CNPJ: {company.document}</p>}

      <h2 className="text-2xl font-semibold mt-8 mb-4">Projetos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {company.projects.length === 0 && <p className="text-gray-500">Nenhum projeto público.</p>}
        {company.projects.map((p) => (
          <div key={p.id} className="bg-white p-6 rounded-lg shadow">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-gray-600 mt-2">{p.description}</p>
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs mt-4 inline-block">{p.status}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
