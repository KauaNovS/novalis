"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const companyStr = localStorage.getItem("partnerCompany");
    if (!companyStr) return;
    const company = JSON.parse(companyStr);
    const token = localStorage.getItem("partnerToken");

    try {
      const res = await fetch("/api/partners/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId: company.id, name, description }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      router.push("/partners/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Submeter Projeto</h1>
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Nome do Projeto*</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md" rows={4} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md">{loading ? "Enviando..." : "Enviar"}</button>
      </form>
    </main>
  );
}
