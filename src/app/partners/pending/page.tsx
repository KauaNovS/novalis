"use client";

export default function PendingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Cadastro Enviado!</h1>
      <p className="text-gray-600">Sua empresa está aguardando aprovação da administração.</p>
      <a href="/partners/login" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md">Ir para Login</a>
    </main>
  );
}
