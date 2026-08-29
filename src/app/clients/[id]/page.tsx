"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  Building2,
  Plus,
  X,
  Calendar,
  MessageCircle,
  PhoneCall,
  Send,
  Flame,
  Snowflake,
  ThermometerSun,
  Repeat,
  UserCheck,
  Clock,
  XCircle,
  Trash2,
  Check,
  ChevronDown,
  StickyNote,
  Ban,
  DollarSign,
} from "lucide-react";

// ---------- Types ----------

interface UnitOfInterest {
  id: string;
  unit: { id: string; unitNumber: string; project: { name: string } };
}

interface Interaction {
  id: string;
  type: string; // CALL | WHATSAPP_CALL | WHATSAPP_MSG
  contactMode: string | null; // PRIMEIRO_CONTATO | RETORNO | FUP
  answered: boolean | null; // atendeu / respondeu
  success: boolean | null; // só relevante se answered = true
  blocked?: boolean | null; // pessoa bloqueou o contato
  reason: string | null;
  notes: string;
  createdAt: string;
}

interface ClientDetail {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  status: string; // LEAD | PROSPECT | CLIENT | LOST
  stage: string; // COLD | WARM | HOT (temperatura)
  contactStatus: string | null; // NAO_CONTACTADO | CONTACTADO | AGUARDANDO_RESPOSTA
  source: string | null;
  profile: string | null;
  interestType: string | null;
  investorProfile: string | null;
  investmentValue: number | null;
  region: string | null;
  topology: string | null;
  typology: string | null;
  areaInterest: number | null;
  notes: string | null;
  unitsOfInterest?: UnitOfInterest[];
  interactions?: Interaction[];
}

// ---------- Static options ----------

const stageOrder = ["LEAD", "PROSPECT", "CLIENT", "LOST"];
const stageLabels: Record<string, string> = {
  LEAD: "Lead",
  PROSPECT: "Prospect",
  CLIENT: "Cliente",
  LOST: "Perdido",
};
const stageColor: Record<string, string> = {
  LEAD: "bg-gray-500/20 text-gray-300",
  PROSPECT: "bg-blue-500/20 text-blue-400",
  CLIENT: "bg-emerald-500/20 text-emerald-400",
  LOST: "bg-rose-500/20 text-rose-400",
};

const temperatureCycle = ["COLD", "WARM", "HOT"];
const temperatureLabels: Record<string, { label: string; icon: any }> = {
  COLD: { label: "Frio", icon: Snowflake },
  WARM: { label: "Morno", icon: ThermometerSun },
  HOT: { label: "Quente", icon: Flame },
};

const contactStatusCycle = [
  "NAO_CONTACTADO",
  "CONTACTADO",
  "AGUARDANDO_RESPOSTA",
  "CONVERSANDO",
  "BLOQUEADO",
  "REUNIAO_AGENDADA",
  "NEGOCIACAO",
  "VENDA",
];
const contactStatusMeta: Record<string, { label: string; icon: any }> = {
  NAO_CONTACTADO: { label: "Não contactado", icon: XCircle },
  CONTACTADO: { label: "Contactado", icon: UserCheck },
  AGUARDANDO_RESPOSTA: { label: "Aguardando resposta", icon: Clock },
  CONVERSANDO: { label: "Conversando", icon: MessageCircle },
  BLOQUEADO: { label: "Bloqueado", icon: Ban },
  REUNIAO_AGENDADA: { label: "Reunião agendada", icon: Calendar },
  NEGOCIACAO: { label: "Negociação", icon: DollarSign },
  VENDA: { label: "Venda", icon: Check },
};

const profileOptions = [
  { value: "DOMINANTE", label: "Dominante", icon: "💪" },
  { value: "INFLUENTE", label: "Influente", icon: "🎭" },
  { value: "ESTAVEL", label: "Estável", icon: "⚖️" },
  { value: "CONFORME", label: "Conforme", icon: "📋" },
];

const investorProfileOptions = [
  { value: "COMPRADOR", label: "Comprador", icon: "🏠" },
  { value: "INVESTIDOR", label: "Investidor", icon: "📈" },
  { value: "POSSIVEL_INVESTIDOR", label: "Possível investidor", icon: "🤔" },
  { value: "PESQUISADOR", label: "Pesquisador", icon: "🔍" },
];

const interestOptions = [
  { value: "SEM_INTERESSE", label: "Sem interesse", icon: "❌" },
  { value: "INTERESSADO", label: "Interessado", icon: "✅" },
  { value: "INTERESSE_FUTURO", label: "Interesse futuro", icon: "⏳" },
  { value: "CONVERSANDO", label: "Conversando", icon: "💬" },
];

const sourceOptions = ["Indicação", "Rd Station", "Site", "Outro"];

const tipologyOptions = [
  "Studio",
  "1 Dormitório",
  "2 Dormitórios",
  "Sala Comercial",
  "4 Dormitórios",
  "Pé Direito Alto",
  "Pé Direito Duplo",
  "Garden",
  "Loja",
];

const topologyOptions = ["HIS 1", "HIS 2", "HMP", "NR", "R2V"];

// Canal da interação (o ícone pertence aqui, não aos chips de cima)
const interactionTypes = [
  { value: "CALL", label: "Ligação Normal", icon: PhoneCall, answeredLabel: "Atendeu?" },
  { value: "WHATSAPP_CALL", label: "Ligação WhatsApp", icon: MessageCircle, answeredLabel: "Atendeu?" },
  { value: "WHATSAPP_MSG", label: "Mensagem WhatsApp", icon: Send, answeredLabel: "Respondeu?" },
];

// Modo da interação (primeiro contato / retorno / fup)
const contactModeOptions = [
  { value: "PRIMEIRO_CONTATO", label: "Primeiro contato", icon: UserCheck },
  { value: "RETORNO", label: "Retorno", icon: Repeat },
  { value: "FUP", label: "Followup", icon: Clock },
];

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [projects, setProjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  // Modal simples: só nome / telefone / email / nascimento
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhones, setEditPhones] = useState<string[]>([""]);
  const [editEmails, setEditEmails] = useState<string[]>([""]);
  const [editBirthDate, setEditBirthDate] = useState("");

  // Campo aberto para edição inline (dropdown) no card "Interesses"
  const [openField, setOpenField] = useState<string | null>(null);
  const [draftRegion, setDraftRegion] = useState<string[]>([]);
  const [draftTopology, setDraftTopology] = useState<string[]>([]);
  const [draftTypology, setDraftTypology] = useState<string[]>([]);
  const [draftInvestment, setDraftInvestment] = useState("");
  const [draftArea, setDraftArea] = useState("");
  const [draftUnitIds, setDraftUnitIds] = useState<string[]>([]);

  // Observações — seção própria, independente do modal de edição
  const [editingNotes, setEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState("");

  // Nova interação
  const [newType, setNewType] = useState("CALL");
  const [newContactMode, setNewContactMode] = useState("PRIMEIRO_CONTATO");
  const [newAnswered, setNewAnswered] = useState<boolean | null>(null);
  const [newSuccess, setNewSuccess] = useState<boolean | null>(null);
  const [newBlocked, setNewBlocked] = useState(false);
  const [newReason, setNewReason] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Edição de interação existente
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);

  const interactionFormRef = useRef<HTMLDivElement>(null);

  const safeUnits = client?.unitsOfInterest || [];
  const safeInteractions = client?.interactions || [];
  const fupCount = safeInteractions.filter((i) => i.contactMode === "FUP").length;

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
          const bairros = [...new Set(data.map((p: any) => p.neighborhood).filter(Boolean))] as string[];
          setNeighborhoods(bairros);
          const allUnits = data.flatMap((p: any) =>
            p.units ? p.units.map((u: any) => ({ ...u, projectName: p.name })) : []
          );
          setUnits(allUnits);
        }
      })
      .catch(() => {});

    fetch("/api/units")
      .then((res) => res.json())
      .then((data) => {
        if (data.data && Array.isArray(data.data)) setUnits(data.data);
        else if (Array.isArray(data)) setUnits(data);
      })
      .catch(() => {});

    if (id) {
      fetch(`/api/clients/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
            return;
          }
          hydrate(data);
        })
        .catch(() => setError("Erro ao carregar cliente"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const hydrate = (data: ClientDetail) => {
    setClient(data);
    setEditName(data.name || "");
    setEditPhones(data.phone ? data.phone.split(",").map((p) => p.trim()) : [""]);
    setEditEmails(data.email ? data.email.split(",").map((e) => e.trim()) : [""]);
    setEditBirthDate(data.birthDate ? data.birthDate.slice(0, 10) : "");
    setDraftRegion(data.region ? data.region.split(",").map((r) => r.trim()) : []);
    setDraftTopology(data.topology ? data.topology.split(",").map((t) => t.trim()) : []);
    setDraftTypology(data.typology ? data.typology.split(",").map((t) => t.trim()) : []);
    setDraftInvestment(data.investmentValue ? String(data.investmentValue) : "");
    setDraftArea(data.areaInterest ? String(data.areaInterest) : "");
    setDraftUnitIds(data.unitsOfInterest ? data.unitsOfInterest.map((u) => u.unit.id) : []);
    setDraftNotes(data.notes || "");
  };

  const updateField = async (field: string, value: any) => {
    const previous = client ? (client as any)[field] : undefined;
    // Atualiza a UI na hora — o clique sempre "gruda" visualmente.
    setClient((prev) => (prev ? { ...prev, [field]: value } : prev));
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setClient((prev) => (prev ? { ...prev, ...data, [field]: value } : data));
      } else {
        // Reverte visualmente e mostra o erro real, em vez de falhar em silêncio.
        setClient((prev) => (prev ? { ...prev, [field]: previous } : prev));
        setError(data.error || "Erro ao salvar alteração");
      }
      return res.ok;
    } catch {
      setClient((prev) => (prev ? { ...prev, [field]: previous } : prev));
      setError("Erro de conexão ao salvar");
      return false;
    }
  };

  const updateFields = async (fields: Record<string, any>) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(fields),
    });
    const data = await res.json();
    if (res.ok) setClient(data);
    return res.ok;
  };

  const handleSaveEdit = async () => {
    const phoneStr = editPhones.filter((p) => p.trim()).join(",");
    const emailStr = editEmails.filter((e) => e.trim()).join(",");
    const ok = await updateFields({
      name: editName,
      phone: phoneStr,
      email: emailStr,
      birthDate: editBirthDate,
    });
    if (ok) setShowEdit(false);
    else setError("Erro ao salvar");
  };

  const handleSaveNotes = async () => {
    const ok = await updateField("notes", draftNotes);
    if (ok) setEditingNotes(false);
  };

  const handleSaveRegion = () => updateField("region", draftRegion.join(",")).then(() => setOpenField(null));
  const handleSaveTopology = () => updateField("topology", draftTopology.join(",")).then(() => setOpenField(null));
  const handleSaveTypology = () => updateField("typology", draftTypology.join(",")).then(() => setOpenField(null));
  const handleSaveInvestment = () =>
    updateField("investmentValue", draftInvestment ? parseFloat(draftInvestment) : null).then(() => setOpenField(null));
  const handleSaveArea = () =>
    updateField("areaInterest", draftArea ? parseFloat(draftArea) : null).then(() => setOpenField(null));
  const handleSaveSource = (value: string) => updateField("source", value).then(() => setOpenField(null));

  const handleSaveUnits = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/clients/${id}/units`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ unitIds: draftUnitIds }),
    });
    if (res.ok) {
      const data = await res.json();
      setClient((prev) => (prev ? { ...prev, unitsOfInterest: data.unitsOfInterest ?? prev.unitsOfInterest } : prev));
    }
    setOpenField(null);
  };

  const resetInteractionForm = () => {
    setNewContactMode("PRIMEIRO_CONTATO");
    setNewAnswered(null);
    setNewSuccess(null);
    setNewBlocked(false);
    setNewReason("");
    setNewNotes("");
  };

  const handleAddInteraction = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/clients/${id}/interactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type: newType,
        contactMode: newContactMode,
        answered: newAnswered,
        success: newAnswered ? newSuccess : false,
        blocked: newBlocked,
        reason: newReason,
        notes: newNotes,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setClient((prev) => (prev ? { ...prev, interactions: [...(prev.interactions || []), data] } : prev));
      if (newBlocked) await updateField("status", "LOST");
      resetInteractionForm();
    }
  };

  const handleUpdateInteraction = async () => {
    if (!editingInteraction) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/clients/interactions/${editingInteraction.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(editingInteraction),
    });
    if (res.ok) {
      setClient((prev) =>
        prev
          ? {
              ...prev,
              interactions: prev.interactions?.map((i) => (i.id === editingInteraction.id ? editingInteraction : i)),
            }
          : prev
      );
      if (editingInteraction.blocked) await updateField("status", "LOST");
      setEditingInteraction(null);
    }
  };

  const handleDeleteInteraction = async (interactionId: string) => {
    if (!confirm("Excluir esta interação?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/clients/interactions/${interactionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setClient((prev) =>
        prev ? { ...prev, interactions: prev.interactions?.filter((i) => i.id !== interactionId) } : prev
      );
    }
  };

  const addPhoneField = () => setEditPhones([...editPhones, ""]);
  const removePhoneField = (index: number) => {
    const updated = editPhones.filter((_, i) => i !== index);
    setEditPhones(updated.length ? updated : [""]);
  };
  const addEmailField = () => setEditEmails([...editEmails, ""]);
  const removeEmailField = (index: number) => {
    const updated = editEmails.filter((_, i) => i !== index);
    setEditEmails(updated.length ? updated : [""]);
  };

  const toggleOpenField = (field: string) => setOpenField((prev) => (prev === field ? null : field));

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 animate-pulse">
            <div className="h-6 bg-[#2a2a2a] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-2/3"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !client) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">{error || "Cliente não encontrado"}</p>
            <button onClick={() => router.back()} className="text-gray-400 hover:text-white mt-4 inline-block">
              ← Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  const statusObj = interestOptions.find((o) => o.value === client.interestType);
  const profileObj = profileOptions.find((o) => o.value === client.profile);
  const investorObj = investorProfileOptions.find((o) => o.value === client.investorProfile);
  const temperature = temperatureLabels[client.stage] || temperatureLabels.COLD;
  const contactStatus = contactStatusMeta[client.contactStatus || "NAO_CONTACTADO"];
  const TemperatureIcon = temperature.icon;
  const ContactStatusIcon = contactStatus.icon;
  const activeInteractionType = interactionTypes.find((t) => t.value === newType) || interactionTypes[0];

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Topo */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Voltar
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <Pencil size={16} strokeWidth={1.5} />
            Editar dados
          </button>
        </div>

        {error && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-200">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Nome + barras de estado */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 space-y-5">
          <h1 className="text-2xl font-semibold text-white">{client.name}</h1>

          {/* Barra 1: Lead / Prospect / Cliente / Perdido — pílula segmentada */}
          <div className="flex w-full rounded-full bg-[#141414] border border-[#2a2a2a] p-1 gap-1">
            {stageOrder.map((stage) => (
              <button
                key={stage}
                onClick={() => updateField("status", stage)}
                className={`flex-1 px-4 py-2 rounded-full text-sm font-medium text-center transition ${
                  client.status === stage ? stageColor[stage] : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {stageLabels[stage]}
              </button>
            ))}
          </div>

          {/* Barra 2: Primeiro contato / Retorno / Followup — logo abaixo da barra de Lead */}
          <div className="flex w-full rounded-full bg-[#141414] border border-[#2a2a2a] p-1 gap-1">
            {contactModeOptions.map((m) => {
              const Icon = m.icon;
              const active = newContactMode === m.value;
              return (
                <button
                  key={m.value}
                  onClick={() => setNewContactMode(m.value)}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-center transition ${
                    active ? "bg-blue-500/20 text-blue-300" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Icon size={14} />
                  {m.value === "FUP" ? `Followup ${fupCount + 1}` : m.label}
                </button>
              );
            })}
          </div>

          {/* Os 5 botões de status — abaixo da barra de primeiro contato, distribuídos e centralizados */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <button
              onClick={() => {
                const next = temperatureCycle[(temperatureCycle.indexOf(client.stage) + 1) % temperatureCycle.length];
                updateField("stage", next);
              }}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-sm text-orange-300 hover:border-orange-400 transition"
            >
              <TemperatureIcon size={14} />
              {temperature.label}
            </button>

            <button
              onClick={() => {
                const current = client.contactStatus || "NAO_CONTACTADO";
                const idx = contactStatusCycle.indexOf(current);
                const next = contactStatusCycle[(idx === -1 ? 0 : idx + 1) % contactStatusCycle.length];
                updateField("contactStatus", next);
                if (next === "BLOQUEADO") updateField("status", "LOST");
              }}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[#141414] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition text-center"
            >
              <ContactStatusIcon size={14} />
              {contactStatus.label}
            </button>

            <button
              onClick={() => {
                const current = interestOptions.findIndex((o) => o.value === client.interestType);
                const next = interestOptions[(current + 1) % interestOptions.length];
                updateField("interestType", next.value);
              }}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[#141414] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
            >
              {statusObj?.icon || "❓"} {statusObj?.label || "Interesse"}
            </button>

            <button
              onClick={() => {
                const current = profileOptions.findIndex((o) => o.value === client.profile);
                const next = profileOptions[(current + 1) % profileOptions.length];
                updateField("profile", next.value);
              }}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[#141414] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
            >
              {profileObj?.icon || "👤"} {profileObj?.label || "Perfil"}
            </button>

            <button
              onClick={() => {
                const current = investorProfileOptions.findIndex((o) => o.value === client.investorProfile);
                const next = investorProfileOptions[(current + 1) % investorProfileOptions.length];
                updateField("investorProfile", next.value);
              }}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full bg-[#141414] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
            >
              {investorObj?.icon || "💼"} {investorObj?.label || "Perfil de compra"}
            </button>
          </div>
        </div>

        {/* Contato e pessoais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Phone size={16} strokeWidth={1.5} /> Telefones
            </h2>
            <div className="space-y-1.5">
              {(client.phone || "").split(",").filter(Boolean).map((phone, i) => (
                <p key={i} className="text-sm text-gray-300">{phone.trim()}</p>
              ))}
              {!client.phone && <p className="text-sm text-gray-600">—</p>}
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Mail size={16} strokeWidth={1.5} /> Emails
            </h2>
            <div className="space-y-1.5">
              {(client.email || "").split(",").filter(Boolean).map((email, i) => (
                <p key={i} className="text-sm text-gray-300">{email.trim()}</p>
              ))}
              {!client.email && <p className="text-sm text-gray-600">—</p>}
            </div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <h2 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
              <Calendar size={16} strokeWidth={1.5} /> Data de nascimento
            </h2>
            <p className="text-sm text-gray-300">
              {client.birthDate ? new Date(client.birthDate).toLocaleDateString("pt-BR") : "—"}
            </p>
          </div>

          {/* Valor de investimento — editável inline, sem precisar do modal */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <DollarSign size={16} strokeWidth={1.5} /> Valor de investimento
              </h2>
              <button onClick={() => toggleOpenField("investment")} className="text-gray-500 hover:text-gray-300">
                <ChevronDown size={16} className={openField === "investment" ? "rotate-180 transition" : "transition"} />
              </button>
            </div>
            {openField === "investment" ? (
              <div className="flex gap-2">
                <input
                  type="number"
                  value={draftInvestment}
                  onChange={(e) => setDraftInvestment(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  autoFocus
                />
                <button onClick={handleSaveInvestment} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-300">
                {client.investmentValue ? `R$ ${client.investmentValue.toLocaleString("pt-BR")}` : "—"}
              </p>
            )}
          </div>
        </div>

        {/* Observações — seção própria, editável direto aqui */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <StickyNote size={16} strokeWidth={1.5} /> Observações
            </h2>
            {!editingNotes && (
              <button
                onClick={() => {
                  setDraftNotes(client.notes || "");
                  setEditingNotes(true);
                }}
                className="text-gray-500 hover:text-gray-300"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>
          {editingNotes ? (
            <div className="space-y-2">
              <textarea
                value={draftNotes}
                onChange={(e) => setDraftNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditingNotes(false)}
                  className="px-4 py-2 rounded-lg bg-[#222] border border-[#2a2a2a] text-gray-400 text-xs hover:text-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{client.notes || "—"}</p>
          )}
        </div>

        {/* Interesses — cada campo editável inline, sem modal */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
          <h2 className="text-sm font-medium text-gray-400 mb-4">Interesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fonte */}
            <InlineField
              label="Fonte"
              value={client.source || "—"}
              open={openField === "source"}
              onToggle={() => toggleOpenField("source")}
            >
              <div className="flex flex-wrap gap-2">
                {sourceOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleSaveSource(opt)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition ${
                      client.source === opt
                        ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </InlineField>

            {/* Região — múltipla seleção */}
            <InlineField
              label="Região"
              value={client.region || "—"}
              open={openField === "region"}
              onToggle={() => toggleOpenField("region")}
            >
              <MultiCheckList
                options={neighborhoods}
                selected={draftRegion}
                onChange={setDraftRegion}
                onSave={handleSaveRegion}
              />
            </InlineField>

            {/* Topologia */}
            <InlineField
              label="Topologia"
              value={client.topology || "—"}
              open={openField === "topology"}
              onToggle={() => toggleOpenField("topology")}
            >
              <MultiCheckList
                options={topologyOptions}
                selected={draftTopology}
                onChange={setDraftTopology}
                onSave={handleSaveTopology}
              />
            </InlineField>

            {/* Tipologia */}
            <InlineField
              label="Tipologia"
              value={client.typology || "—"}
              open={openField === "typology"}
              onToggle={() => toggleOpenField("typology")}
            >
              <MultiCheckList
                options={tipologyOptions}
                selected={draftTypology}
                onChange={setDraftTypology}
                onSave={handleSaveTypology}
              />
            </InlineField>

            {/* Área de interesse */}
            <InlineField
              label="Área de interesse"
              value={client.areaInterest ? `${client.areaInterest} m²` : "—"}
              open={openField === "area"}
              onToggle={() => toggleOpenField("area")}
            >
              <div className="flex gap-2">
                <input
                  type="number"
                  value={draftArea}
                  onChange={(e) => setDraftArea(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                  autoFocus
                />
                <button onClick={handleSaveArea} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                  <Check size={14} />
                </button>
              </div>
            </InlineField>
          </div>
        </div>

        {/* Unidades de interesse */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-400">Unidades de interesse</h2>
            <button onClick={() => toggleOpenField("units")} className="text-gray-500 hover:text-gray-300">
              <ChevronDown size={16} className={openField === "units" ? "rotate-180 transition" : "transition"} />
            </button>
          </div>

          {openField === "units" ? (
            <div className="space-y-3">
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {units.map((unit) => (
                  <label key={unit.id} className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={draftUnitIds.includes(unit.id)}
                      onChange={(e) => {
                        if (e.target.checked) setDraftUnitIds([...draftUnitIds, unit.id]);
                        else setDraftUnitIds(draftUnitIds.filter((u) => u !== unit.id));
                      }}
                    />
                    {unit.projectName || unit.project?.name} · Unidade {unit.unitNumber}
                  </label>
                ))}
              </div>
              <button
                onClick={handleSaveUnits}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition"
              >
                Salvar unidades
              </button>
            </div>
          ) : safeUnits.length === 0 ? (
            <p className="text-sm text-gray-600">Nenhuma unidade vinculada.</p>
          ) : (
            <div className="space-y-2">
              {safeUnits.map((uoi) => (
                <div key={uoi.id} className="flex items-center gap-2 text-sm text-gray-300">
                  <Building2 size={14} strokeWidth={1.5} />
                  {uoi.unit.project.name} · Unidade {uoi.unit.unitNumber}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interações */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6" ref={interactionFormRef}>
          <h2 className="text-sm font-medium text-gray-400 mb-4">Interações</h2>

          <div className="space-y-3 mb-6">
            {safeInteractions.length === 0 ? (
              <p className="text-sm text-gray-600">Nenhuma interação registrada.</p>
            ) : (
              [...safeInteractions]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((interaction) => {
                  const typeObj = interactionTypes.find((t) => t.value === interaction.type);
                  const modeObj = contactModeOptions.find((m) => m.value === interaction.contactMode);
                  const TypeIcon = typeObj?.icon || PhoneCall;
                  const fupNumber =
                    interaction.contactMode === "FUP"
                      ? safeInteractions.filter(
                          (i) => i.contactMode === "FUP" && new Date(i.createdAt) <= new Date(interaction.createdAt)
                        ).length
                      : 0;

                  const outcomeLabel = interaction.blocked
                    ? "Bloqueou"
                    : interaction.answered === false
                    ? typeObj?.value === "WHATSAPP_MSG"
                      ? "Não respondeu"
                      : "Não atendeu"
                    : interaction.success
                    ? "Sucesso"
                    : "Sem sucesso";
                  const outcomeColor = interaction.blocked
                    ? "bg-rose-500/20 text-rose-400"
                    : interaction.answered === false
                    ? "bg-gray-500/20 text-gray-400"
                    : interaction.success
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-rose-500/20 text-rose-400";

                  return (
                    <div key={interaction.id} className="flex items-start gap-3 p-4 rounded-2xl bg-[#141414] border border-[#232323]">
                      <div className="mt-0.5 p-2 rounded-full bg-[#1f1f1f] text-gray-400 shrink-0">
                        <TypeIcon size={16} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm text-gray-200 font-medium">{typeObj?.label || interaction.type}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${outcomeColor}`}>{outcomeLabel}</span>
                          {modeObj && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">
                              {modeObj.label}
                              {interaction.contactMode === "FUP" && fupNumber > 0 ? ` ${fupNumber}` : ""}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(interaction.createdAt).toLocaleString("pt-BR")}
                        </p>
                        {interaction.reason && (
                          <p className="text-sm text-gray-400 mt-1">Motivo: {interaction.reason}</p>
                        )}
                        {interaction.notes && <p className="text-sm text-gray-400 mt-1">{interaction.notes}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setEditingInteraction(interaction)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-[#2a2a2a] transition"
                          title="Editar interação"
                        >
                          <Pencil size={14} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteInteraction(interaction.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-[#2a2a2a] transition"
                          title="Excluir interação"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Registrar nova interação */}
          <div className="border-t border-[#2a2a2a] pt-5 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Canal</label>
              <div className="flex flex-wrap gap-2">
                {interactionTypes.map((t) => {
                  const Icon = t.icon;
                  const active = newType === t.value;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setNewType(t.value)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition ${
                        active
                          ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                          : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                      }`}
                    >
                      <Icon size={14} strokeWidth={1.5} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600 mt-1.5">
                Modo: <span className="text-gray-400">{contactModeOptions.find((m) => m.value === newContactMode)?.label}</span> (selecionado lá em cima)
              </p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">{activeInteractionType.answeredLabel}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setNewAnswered(true);
                    setNewBlocked(false);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    newAnswered === true ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "bg-[#222] border border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                  }`}
                >
                  Sim
                </button>
                <button
                  onClick={() => {
                    setNewAnswered(false);
                    setNewSuccess(null);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    newAnswered === false ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-[#222] border border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                  }`}
                >
                  Não
                </button>
              </div>
            </div>

            {newAnswered === true && (
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Resultado</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewSuccess(true);
                      setNewBlocked(false);
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      newSuccess === true ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-[#222] border border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    Sucesso
                  </button>
                  <button
                    onClick={() => setNewSuccess(false)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      newSuccess === false ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-[#222] border border-[#2a2a2a] text-gray-400 hover:border-gray-600"
                    }`}
                  >
                    Sem sucesso
                  </button>
                </div>
              </div>
            )}

            {newAnswered !== null && (
              <input
                type="text"
                placeholder="Motivo (ex: não tinha interesse, agendou reunião, direcionado ao WhatsApp...)"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
              />
            )}

            {newAnswered !== null && newSuccess === false && (
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input type="checkbox" checked={newBlocked} onChange={(e) => setNewBlocked(e.target.checked)} />
                <Ban size={14} className="text-rose-400" />
                A pessoa me bloqueou (marca o cliente como Perdido)
              </label>
            )}

            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Observações da interação..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
            />

            <button
              onClick={handleAddInteraction}
              disabled={newAnswered === null}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <Plus size={16} strokeWidth={1.5} />
              Registrar interação
            </button>
          </div>
        </div>
      </div>

      {/* Modal simples: nome / telefone / email / nascimento */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Editar dados de contato</h2>
              <button onClick={() => setShowEdit(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a] transition">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Nome completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Telefones</label>
                <div className="space-y-2">
                  {editPhones.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => {
                          const updated = [...editPhones];
                          updated[index] = e.target.value;
                          setEditPhones(updated);
                        }}
                        placeholder="+55 (11) 99999-9999"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                      />
                      <button onClick={() => removePhoneField(index)} className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-[#2a2a2a] transition">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addPhoneField} className="mt-2 text-xs text-blue-500 hover:text-blue-400 inline-flex items-center gap-1">
                  <Plus size={14} /> Adicionar telefone
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Emails</label>
                <div className="space-y-2">
                  {editEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          const updated = [...editEmails];
                          updated[index] = e.target.value;
                          setEditEmails(updated);
                        }}
                        placeholder="email@exemplo.com"
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                      />
                      <button onClick={() => removeEmailField(index)} className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-[#2a2a2a] transition">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={addEmailField} className="mt-2 text-xs text-blue-500 hover:text-blue-400 inline-flex items-center gap-1">
                  <Plus size={14} /> Adicionar email
                </button>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Data de nascimento</label>
                <input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => setEditBirthDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>

              <button
                onClick={handleSaveEdit}
                className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: editar interação existente (todos os campos) */}
      {editingInteraction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Editar interação</h2>
              <button onClick={() => setEditingInteraction(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a] transition">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editingInteraction.type}
                  onChange={(e) => setEditingInteraction({ ...editingInteraction, type: e.target.value })}
                  className="px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  {interactionTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <select
                  value={editingInteraction.contactMode || "PRIMEIRO_CONTATO"}
                  onChange={(e) => setEditingInteraction({ ...editingInteraction, contactMode: e.target.value })}
                  className="px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  {contactModeOptions.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEditingInteraction({ ...editingInteraction, answered: true })}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                    editingInteraction.answered === true ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "bg-[#222] border border-[#2a2a2a] text-gray-400"
                  }`}
                >
                  Atendeu/Respondeu
                </button>
                <button
                  onClick={() => setEditingInteraction({ ...editingInteraction, answered: false, success: false })}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                    editingInteraction.answered === false ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-[#222] border border-[#2a2a2a] text-gray-400"
                  }`}
                >
                  Não
                </button>
              </div>

              {editingInteraction.answered === true && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingInteraction({ ...editingInteraction, success: true })}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                      editingInteraction.success === true ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-[#222] border border-[#2a2a2a] text-gray-400"
                    }`}
                  >
                    Sucesso
                  </button>
                  <button
                    onClick={() => setEditingInteraction({ ...editingInteraction, success: false })}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition ${
                      editingInteraction.success === false ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-[#222] border border-[#2a2a2a] text-gray-400"
                    }`}
                  >
                    Sem sucesso
                  </button>
                </div>
              )}

              <input
                type="text"
                placeholder="Motivo"
                value={editingInteraction.reason || ""}
                onChange={(e) => setEditingInteraction({ ...editingInteraction, reason: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
              />

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={!!editingInteraction.blocked}
                  onChange={(e) => setEditingInteraction({ ...editingInteraction, blocked: e.target.checked })}
                />
                <Ban size={14} className="text-rose-400" />
                A pessoa bloqueou o contato
              </label>

              <textarea
                placeholder="Observações"
                value={editingInteraction.notes || ""}
                onChange={(e) => setEditingInteraction({ ...editingInteraction, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
              />

              <button
                onClick={handleUpdateInteraction}
                className="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ---------- Small reusable pieces ----------

function InlineField({
  label,
  value,
  open,
  onToggle,
  children,
}: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button onClick={onToggle} className="w-full flex items-center justify-between text-left group">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">{label}</p>
          <p className="text-sm text-gray-300">{value}</p>
        </div>
        <ChevronDown size={16} className={`text-gray-600 group-hover:text-gray-400 ${open ? "rotate-180" : ""} transition`} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

function MultiCheckList({
  options,
  selected,
  onChange,
  onSave,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {options.length === 0 && <p className="text-xs text-gray-600">Nenhuma opção disponível.</p>}
        {options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => (checked ? onChange(selected.filter((o) => o !== opt)) : onChange([...selected, opt]))}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                checked
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                  : "bg-[#222] border-[#2a2a2a] text-gray-400 hover:border-gray-600"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <button onClick={onSave} className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition">
        Salvar
      </button>
    </div>
  );
}