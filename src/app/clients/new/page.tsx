"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, User, X, Check, ArrowLeft } from "lucide-react";

interface ImportRow {
  name: string;
  phone: string;
}

function parseCSV(text: string): ImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];

  const rows = lines.map((line) => {
    const delimiter = line.includes(";") && !line.includes(",") ? ";" : ",";
    return line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
  });

  let startIndex = 0;
  const first = rows[0];
  if (first.length >= 1 && /nome/i.test(first[0])) {
    startIndex = 1;
  }

  const result: ImportRow[] = [];
  for (let i = startIndex; i < rows.length; i++) {
    const [name, phone] = rows[i];
    if (name) result.push({ name: name.trim(), phone: (phone || "").trim() });
  }
  return result;
}

function normalizePhone(phone: string): string | null {
  if (!phone || phone.toLowerCase().includes("sem telefone")) return null;
  // Remove tudo que não for dígito
  let digits = phone.replace(/\D/g, "");
  // Remove o código do país (55) se tiver mais de 11 dígitos
  if (digits.startsWith("55") && digits.length > 11) {
    digits = digits.slice(2);
  }
  // Remove zeros à esquerda do DDD se começar com 0
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

export default function NewClientPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"single" | "csv">("single");

  // ---- Cadastro individual ----
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("LEAD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const normalizedPhone = normalizePhone(phone);

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone: normalizedPhone,
          notes,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Sua sessão expirou. Faça login novamente.");
        }
        throw new Error(data.error || "Erro ao criar cliente");
      }

      router.push("/clients");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("Sessão expirou")) {
        setTimeout(() => router.push("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  // ---- Importação via CSV ----
  const [csvRows, setCsvRows] = useState<ImportRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setCsvError("");
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setCsvError("Não encontramos nenhuma linha válida no arquivo. Formato esperado: nome,telefone");
        setCsvRows([]);
        return;
      }
      setCsvRows(parsed);
    };
    reader.onerror = () => setCsvError("Erro ao ler o arquivo.");
    reader.readAsText(file, "utf-8");
  };

  const removeRow = (index: number) => {
    setCsvRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImport = async () => {
    if (csvRows.length === 0) return;
    setImporting(true);
    setCsvError("");

    const token = localStorage.getItem("token");

    // Normaliza os telefones antes de enviar
    const normalizedRows = csvRows.map((row) => ({
      name: row.name,
      phone: normalizePhone(row.phone),
    }));

    try {
      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clients: normalizedRows }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Sua sessão expirou. Faça login novamente.");
        }
        throw new Error(data.error || "Erro ao importar clientes");
      }

      setImportResult({ imported: data.imported, skipped: data.skipped });
      setCsvRows([]);
      setCsvFileName("");
    } catch (err: any) {
      setCsvError(err.message);
      if (err.message.includes("Sessão expirou")) {
        setTimeout(() => router.push("/login"), 2000);
      }
    } finally {
      setImporting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600";
  const labelClass = "block text-xs text-gray-500 mb-1.5";

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Topo */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Voltar
          </button>
        </div>

        <h1 className="text-2xl font-semibold text-white">Novo Cliente</h1>

        {/* Abas */}
        <div className="flex w-fit rounded-full bg-[#141414] border border-[#2a2a2a] p-1 gap-1">
          <button
            onClick={() => setTab("single")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === "single" ? "bg-blue-500/20 text-blue-300" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Cadastro individual
          </button>
          <button
            onClick={() => setTab("csv")}
            className={`px-5 py-2 rounded-full text-sm font-medium transition ${
              tab === "csv" ? "bg-blue-500/20 text-blue-300" : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Importar CSV
          </button>
        </div>

        {tab === "single" ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            {error && (
              <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Nome*</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Telefone</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Observações</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} rows={3} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                  <option value="LEAD">Lead</option>
                  <option value="PROSPECT">Prospect</option>
                  <option value="CLIENT">Cliente</option>
                  <option value="LOST">Perdido</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {loading ? "Salvando..." : "Salvar Cliente"}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 space-y-4">
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3 text-xs text-blue-300">
              O arquivo deve ter duas colunas: <strong>nome</strong> e <strong>telefone</strong> (separadas por vírgula ou ponto e
              vírgula). Todos os clientes importados entram automaticamente como <strong>Lead</strong>, temperatura{" "}
              <strong>Frio</strong>, status de contato <strong>Não contactado</strong> e fonte <strong>Lista</strong>.
            </div>

            {csvError && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
                {csvError}
              </div>
            )}

            {importResult && (
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Check size={14} />
                  {importResult.imported} cliente(s) importado(s) com sucesso
                  {importResult.skipped > 0 ? ` (${importResult.skipped} linha(s) ignorada(s) por falta de nome)` : ""}.
                </span>
                <Link href="/clients" className="text-emerald-300 underline text-xs font-medium">
                  Ver clientes
                </Link>
              </div>
            )}

            {csvRows.length === 0 ? (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#2a2a2a] rounded-2xl py-10 cursor-pointer hover:border-gray-600 transition">
                <Upload size={28} className="text-gray-500" strokeWidth={1.5} />
                <span className="text-sm text-gray-400">Clique para selecionar um arquivo .csv</span>
                <input type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    <span className="text-gray-200 font-medium">{csvFileName}</span> — {csvRows.length} linha(s) prontas para
                    importar
                  </p>
                  <button
                    onClick={() => {
                      setCsvRows([]);
                      setCsvFileName("");
                    }}
                    className="text-xs text-gray-500 hover:text-rose-400 transition"
                  >
                    Cancelar
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto rounded-xl border border-[#2a2a2a] divide-y divide-[#2a2a2a]">
                  {csvRows.map((row, index) => (
                    <div key={index} className="flex items-center justify-between px-4 py-2.5 text-sm bg-[#141414]">
                      <div className="flex items-center gap-2 min-w-0">
                        <User size={14} className="text-gray-500 shrink-0" strokeWidth={1.5} />
                        <span className="font-medium text-gray-200 truncate">{row.name}</span>
                        <span className="text-gray-500 shrink-0">{row.phone || "sem telefone"}</span>
                      </div>
                      <button onClick={() => removeRow(index)} className="text-gray-500 hover:text-rose-400 shrink-0 transition">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {importing ? "Importando..." : `Importar ${csvRows.length} cliente(s)`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}