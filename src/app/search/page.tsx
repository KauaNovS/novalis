"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SearchResults />
    </Suspense>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<any>({
    projects: [],
    units: [],
    clients: [],
    documents: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then(setResults)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Buscar: {q}</h1>
      {loading && <p>Carregando...</p>}

      <div className="space-y-8">
        <Section title="Projetos" items={results.projects} render={(p: any) => (
          <a href={`/projects/${p.id}`} className="text-blue-600 hover:underline">
            {p.name} - {p.city}/{p.state}
          </a>
        )} />

        <Section title="Unidades" items={results.units} render={(u: any) => (
          <a href={`/projects/${u.projectId}`} className="text-blue-600 hover:underline">
            {u.unitNumber} - {u.project?.name}
          </a>
        )} />

        <Section title="Clientes" items={results.clients} render={(c: any) => (
          <a href={`/clients/${c.id}`} className="text-blue-600 hover:underline">
            {c.name} - {c.email || "Sem email"}
          </a>
        )} />

        <Section title="Documentos" items={results.documents} render={(d: any) => (
          <a href={d.path} target="_blank" className="text-blue-600 hover:underline">
            {d.name}
          </a>
        )} />
      </div>
    </main>
  );
}

function Section({ title, items, render }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      {items.length === 0 ? (
        <p className="text-gray-500">Nenhum resultado</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item: any, i: number) => (
            <li key={i}>{render(item)}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
