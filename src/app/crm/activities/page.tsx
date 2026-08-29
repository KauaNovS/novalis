"use client";

import { useEffect, useState } from "react";

interface Activity {
  id: string;
  type: string;
  subject: string;
  dueDate: string | null;
  status: string;
  client?: { name: string } | null;
  deal?: { title: string } | null;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setActivities(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="p-8">Carregando atividades...</main>;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Atividades</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Tipo</th>
              <th className="px-4 py-3 text-left">Assunto</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Negócio</th>
              <th className="px-4 py-3 text-left">Prazo</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">Nenhuma atividade.</td>
              </tr>
            ) : (
              activities.map((a) => (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-3 text-sm">{a.type}</td>
                  <td className="px-4 py-3 text-sm">{a.subject}</td>
                  <td className="px-4 py-3 text-sm">{a.client?.name || "-"}</td>
                  <td className="px-4 py-3 text-sm">{a.deal?.title || "-"}</td>
                  <td className="px-4 py-3 text-sm">{a.dueDate ? new Date(a.dueDate).toLocaleDateString("pt-BR") : "-"}</td>
                  <td className="px-4 py-3 text-sm">{a.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
