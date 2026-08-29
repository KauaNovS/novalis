"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.resetUrl) setResetUrl(data.resetUrl);
      setMessage("Se o email existir, um link de recuperação foi enviado.");
    } catch {
      setMessage("Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Recuperar Senha</h1>

        {message && <p className="mb-4 text-sm text-green-600">{message}</p>}

        {resetUrl && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p>Link de desenvolvimento:</p>
            <a href={resetUrl} className="text-blue-600 underline break-all">{resetUrl}</a>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md">
            {loading ? "Enviando..." : "Enviar"}
          </button>
        </form>
      </div>
    </main>
  );
}
