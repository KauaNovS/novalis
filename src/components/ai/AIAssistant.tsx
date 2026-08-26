"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente da plataforma. Posso ajudar com:\n\n" +
        "• Ir para Dashboard\n" +
        "• Mostrar projetos\n" +
        "• Mostrar unidades disponíveis\n" +
        "• Mostrar clientes\n" +
        "• Abrir CRM",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim().toLowerCase();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const response = await generateResponse(text);
    const assistantMessage: Message = { role: "assistant", content: response };
    setMessages((prev) => [...prev, assistantMessage]);
    setLoading(false);
  };

  const generateResponse = async (text: string): Promise<string> => {
    if (text.includes("dashboard") || text.includes("início") || text.includes("inicio")) {
      window.location.href = "/dashboard";
      return "Abrindo o Dashboard...";
    }

    if (
      text.includes("projeto") &&
      (text.includes("mostrar") || text.includes("ir") || text.includes("abrir"))
    ) {
      window.location.href = "/projects";
      return "Abrindo a página de Projetos...";
    }

    if (
      text.includes("unidade") &&
      (text.includes("dispon") || text.includes("mostrar") || text.includes("ver"))
    ) {
      window.location.href = "/units";
      return "Abrindo a listagem de Unidades...";
    }

    if (
      text.includes("cliente") &&
      (text.includes("mostrar") || text.includes("ir") || text.includes("abrir"))
    ) {
      window.location.href = "/clients";
      return "Abrindo a página de Clientes...";
    }

    if (
      text.includes("crm") ||
      text.includes("negócio") ||
      text.includes("negocio") ||
      text.includes("funil")
    ) {
      window.location.href = "/crm";
      return "Abrindo o CRM...";
    }

    if (text.includes("quantos projeto") || text.includes("total de projeto")) {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (Array.isArray(data)) {
          return `Atualmente temos ${data.length} projetos cadastrados.`;
        }
      } catch {
        return "Não consegui buscar os projetos agora.";
      }
    }

    if (text.includes("quantas unidade") || text.includes("total de unidade")) {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        return `Temos ${data.totalUnits} unidades no total, sendo ${data.availableUnits} disponíveis e ${data.soldUnits} vendidas.`;
      } catch {
        return "Não consegui buscar as unidades agora.";
      }
    }

    if (text.includes("quantos cliente") || text.includes("total de cliente")) {
      try {
        const res = await fetch("/api/dashboard");
        const data = await res.json();
        return `Temos ${data.totalClients} clientes cadastrados.`;
      } catch {
        return "Não consegui buscar os clientes agora.";
      }
    }

    return (
      "Ainda estou aprendendo. Tente:\n\n" +
      "• Ir para Dashboard\n" +
      "• Mostrar projetos\n" +
      "• Mostrar unidades disponíveis\n" +
      "• Mostrar clientes\n" +
      "• Abrir CRM"
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
        title="Assistente IA"
      >
        {isOpen ? "✕" : "🤖"}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[400px] max-w-[90vw] h-[550px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
            <h3 className="font-semibold">Assistente IA</h3>
            <p className="text-xs text-blue-100">Online</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none shadow-sm border"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-500 p-3 rounded-2xl rounded-bl-none text-sm shadow-sm border">
                  Analisando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite uma pergunta ou comando..."
                className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
