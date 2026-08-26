"use client";

import { useEffect, useState } from "react";

export default function PartnerDashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    const companyStr = localStorage.getItem("partnerCompany");
    if (companyStr) setCompany(JSON.parse(companyStr));

    const token = localStorage.getItem("partnerToken");
    fetch("/api/partners/projects", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      });
  }, []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard da Incorporadora</h1>
      {company && <p className="text-lg text-gray-600 mb-4">Bem-vindo, {company.name}</p>}

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Meus Projetos</h2>
        {projects.length === 0 ? (
          <p className="text-gray-500">Nenhum projeto submetido.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => (
              <li key={p.id} className="flex justify-between items-center border-b py-2">
                <span>{p.name}</span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{p.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <a href="/partners/submit-project" className="px-6 py-2 bg-blue-600 text-white rounded-md inline-block">
        Submeter Novo Projeto
      </a>
    </main>
  );
}
