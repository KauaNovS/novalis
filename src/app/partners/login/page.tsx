"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/partners/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("partnerToken", data.token);
      localStorage.setItem("partnerCompany", JSON.stringify(data.company));

      router.push("/partners/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login da Incorporadora</h1>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
          <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md">{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          <a href="/partners/register" className="text-blue-600 hover:underline">Cadastrar empresa</a>
        </p>
      </div>
    </main>
  );
}
