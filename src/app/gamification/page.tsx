"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Users,
  User,
  Briefcase,
  TrendingUp,
  Medal,
  Crown,
  Star,
  RefreshCw,
  ArrowLeft,
  History,
} from "lucide-react";

// ---------- Tipos (exemplos) ----------
interface ActivityItem {
  id: string;
  description: string;
  date: string;
  xp: number;
}

interface Member {
  id: string;
  name: string;
  xp: number;
  level: number;
  rank: string;
  badgesCount: number;
  activities: ActivityItem[];
}

interface Team {
  id: string;
  name: string;
  leaderName: string;
  membersCount: number;
  totalXp: number;
  averageXp: number;
  members: Member[];
}

// Dados de exemplo
const exampleTeams: Team[] = [
  {
    id: "t1",
    name: "Equipe Alpha",
    leaderName: "Administrador",
    membersCount: 3,
    totalXp: 45200,
    averageXp: 9040,
    members: [
      {
        id: "m1",
        name: "Administrador",
        xp: 12500,
        level: 12,
        rank: "Líder",
        badgesCount: 8,
        activities: [
          { id: "a1", description: "Fechou venda de unidade 101", date: "2026-08-20", xp: 500 },
          { id: "a2", description: "Registrou interação com cliente", date: "2026-08-19", xp: 50 },
          { id: "a3", description: "Completou perfil de cliente", date: "2026-08-18", xp: 30 },
        ],
      },
      {
        id: "m2",
        name: "Corretor Demo",
        xp: 9800,
        level: 10,
        rank: "Membro",
        badgesCount: 6,
        activities: [
          { id: "a4", description: "Importou lista de leads", date: "2026-08-20", xp: 100 },
          { id: "a5", description: "Agendou reunião com cliente", date: "2026-08-19", xp: 80 },
          { id: "a6", description: "Atualizou status de contato", date: "2026-08-18", xp: 40 },
        ],
      },
      {
        id: "m3",
        name: "Maria Souza",
        xp: 8700,
        level: 9,
        rank: "Membro",
        badgesCount: 5,
        activities: [
          { id: "a7", description: "Criou nova oportunidade", date: "2026-08-20", xp: 120 },
          { id: "a8", description: "Registrou visita à unidade", date: "2026-08-19", xp: 150 },
          { id: "a9", description: "Atualizou pipeline", date: "2026-08-17", xp: 60 },
        ],
      },
    ],
  },
  {
    id: "t2",
    name: "Equipe Beta",
    leaderName: "João Líder",
    membersCount: 2,
    totalXp: 38900,
    averageXp: 9725,
    members: [
      {
        id: "m4",
        name: "João Líder",
        xp: 11000,
        level: 11,
        rank: "Líder",
        badgesCount: 7,
        activities: [
          { id: "a10", description: "Realizou follow-up com cliente", date: "2026-08-20", xp: 70 },
        ],
      },
      {
        id: "m5",
        name: "Fernanda",
        xp: 8900,
        level: 9,
        rank: "Membro",
        badgesCount: 5,
        activities: [
          { id: "a11", description: "Fechou venda de unidade 204", date: "2026-08-19", xp: 500 },
        ],
      },
    ],
  },
  {
    id: "t3",
    name: "Equipe Gamma",
    leaderName: "Fernanda",
    membersCount: 2,
    totalXp: 50100,
    averageXp: 8350,
    members: [
      {
        id: "m6",
        name: "Fernanda",
        xp: 9200,
        level: 9,
        rank: "Líder",
        badgesCount: 6,
        activities: [
          { id: "a12", description: "Registrou reunião agendada", date: "2026-08-20", xp: 90 },
        ],
      },
      {
        id: "m7",
        name: "Carlos",
        xp: 7800,
        level: 8,
        rank: "Membro",
        badgesCount: 4,
        activities: [
          { id: "a13", description: "Importou lista de clientes", date: "2026-08-20", xp: 100 },
        ],
      },
    ],
  },
];

export default function GamificationPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "myteam" | "teams" | "partners" | "tracking">("overview");
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setExpandedMemberId(null);
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
  };

  const toggleMemberActivities = (memberId: string) => {
    setExpandedMemberId((prev) => (prev === memberId ? null : memberId));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-[#1a1a1a] rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-[#1a1a1a] rounded-3xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Ranking & Equipes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Acompanhe o desempenho, equipes e parceiros
            </p>
          </div>
          <button
            onClick={refresh}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <RefreshCw size={16} strokeWidth={1.5} />
            Atualizar
          </button>
        </div>

        {/* Abas */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton icon={Trophy} label="Visão Geral" active={tab === "overview"} onClick={() => setTab("overview")} />
          <TabButton icon={User} label="Minha Equipe" active={tab === "myteam"} onClick={() => setTab("myteam")} />
          <TabButton icon={Users} label="Equipes" active={tab === "teams"} onClick={() => setTab("teams")} />
          <TabButton icon={Briefcase} label="Parceiros" active={tab === "partners"} onClick={() => setTab("partners")} />
          <TabButton icon={TrendingUp} label="Acompanhamento" active={tab === "tracking"} onClick={() => setTab("tracking")} />
        </div>

        {/* Conteúdo por aba */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exampleTeams[0].members.map((user, index) => (
                <div
                  key={user.id}
                  className={`bg-[#1a1a1a] border rounded-3xl p-6 ${
                    index === 0 ? "border-yellow-500/40 bg-yellow-500/5" : "border-[#2a2a2a]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-gray-300 font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">Nível {user.level}</p>
                      </div>
                    </div>
                    {index === 0 ? <Crown size={20} className="text-yellow-400" /> : index === 1 ? <Medal size={20} className="text-gray-400" /> : <Star size={20} className="text-orange-400" />}
                  </div>
                  <p className="text-2xl font-semibold text-white">{user.xp.toLocaleString("pt-BR")} XP</p>
                  <p className="text-xs text-gray-600 mt-2">{user.badgesCount} badges</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <SummaryCard icon={Trophy} label="Total de XP" value="87.450" />
              <SummaryCard icon={Users} label="Membros ativos" value="24" />
              <SummaryCard icon={Briefcase} label="Parceiros" value="8" />
            </div>
          </div>
        )}

        {tab === "myteam" && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a2a]">
              <h2 className="text-lg font-medium text-white">Minha Equipe</h2>
              <p className="text-xs text-gray-500">Líder: Administrador</p>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {exampleTeams[0].members.map((member) => (
                <div key={member.id} className="flex items-center px-6 py-4 hover:bg-[#2a2a2a] transition">
                  <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-gray-300 font-semibold mr-4">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.rank} · Nível {member.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{member.xp.toLocaleString("pt-BR")} XP</p>
                    <p className="text-xs text-gray-600">{member.badgesCount} badges</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "teams" && (
          <div>
            {selectedTeam ? (
              <div className="space-y-4">
                <button
                  onClick={handleBackToTeams}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
                >
                  <ArrowLeft size={16} strokeWidth={1.5} />
                  Voltar para equipes
                </button>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
                  <h2 className="text-xl font-semibold text-white">{selectedTeam.name}</h2>
                  <p className="text-sm text-gray-400 mt-1">Líder: {selectedTeam.leaderName}</p>
                  <p className="text-sm text-gray-400">Membros: {selectedTeam.membersCount}</p>
                  <div className="mt-4 flex gap-6">
                    <div>
                      <span className="text-sm text-gray-500">XP total</span>
                      <p className="text-lg font-semibold text-white">{selectedTeam.totalXp.toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Média</span>
                      <p className="text-lg font-semibold text-white">{selectedTeam.averageXp.toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#2a2a2a]">
                    <h3 className="text-lg font-medium text-white">Membros</h3>
                  </div>
                  <div className="divide-y divide-[#2a2a2a]">
                    {selectedTeam.members.map((member) => (
                      <div key={member.id} className="px-6 py-4 hover:bg-[#2a2a2a] transition">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() => toggleMemberActivities(member.id)}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#222] flex items-center justify-center text-gray-300 font-semibold mr-4">
                            {member.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-200">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.rank} · Nível {member.level}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white">{member.xp.toLocaleString("pt-BR")} XP</p>
                            <p className="text-xs text-gray-600">{member.badgesCount} badges</p>
                          </div>
                        </div>

                        {/* Histórico de atividades expandido */}
                        {expandedMemberId === member.id && (
                          <div className="mt-4 pl-4 border-l border-[#2a2a2a]">
                            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
                              <History size={14} className="text-gray-500" />
                              Histórico de atividades
                            </h4>
                            <div className="space-y-2">
                              {member.activities.length > 0 ? (
                                member.activities.map((activity) => (
                                  <div key={activity.id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">{activity.description}</span>
                                    <div className="text-right">
                                      <span className="text-gray-500 text-xs">{activity.date}</span>
                                      <span className="ml-2 text-white font-medium">+{activity.xp} XP</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-gray-500 text-sm">Nenhuma atividade registrada.</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {exampleTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleTeamClick(team)}
                    className="text-left bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 hover:border-gray-600 transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">{team.name}</h3>
                      <Crown size={18} className="text-yellow-400" />
                    </div>
                    <p className="text-sm text-gray-400">Líder: {team.leaderName}</p>
                    <p className="text-sm text-gray-400">Membros: {team.membersCount}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">XP total</span>
                      <span className="text-sm font-semibold text-white">{team.totalXp.toLocaleString("pt-BR")}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-500">Média</span>
                      <span className="text-sm font-semibold text-white">{team.averageXp.toLocaleString("pt-BR")}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "partners" && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2a2a2a]">
              <h2 className="text-lg font-medium text-white">Ranking de Parceiros</h2>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
              {[
                { id: "p1", companyName: "Parceiro Imóveis", contactName: "Carlos", xp: 5200, projectsSubmitted: 12 },
                { id: "p2", companyName: "Construtora XYZ", contactName: "Ana", xp: 4800, projectsSubmitted: 9 },
                { id: "p3", companyName: "Imobiliária Top", contactName: "Pedro", xp: 4100, projectsSubmitted: 7 },
              ].map((partner, index) => (
                <div key={partner.id} className="flex items-center px-6 py-4 hover:bg-[#2a2a2a] transition">
                  <div className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-sm font-semibold text-gray-300 mr-4">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">{partner.companyName}</p>
                    <p className="text-xs text-gray-500">{partner.contactName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{partner.xp.toLocaleString("pt-BR")} XP</p>
                    <p className="text-xs text-gray-600">{partner.projectsSubmitted} projetos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "tracking" && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-gray-400" strokeWidth={1.5} />
              Evolução de Pontos
            </h2>
            <div className="space-y-3">
              {[
                { date: "01/08", xp: 1000 },
                { date: "08/08", xp: 1500 },
                { date: "15/08", xp: 2200 },
                { date: "22/08", xp: 3100 },
                { date: "29/08", xp: 4000 },
              ].map((point) => (
                <div key={point.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{point.date}</span>
                  <span className="text-sm font-semibold text-white">{point.xp.toLocaleString("pt-BR")} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Componentes auxiliares
function TabButton({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
        active ? "bg-blue-500/20 text-blue-300" : "bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:border-gray-600 hover:text-gray-200"
      }`}
    >
      <Icon size={16} strokeWidth={1.5} />
      {label}
    </button>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-gray-400" strokeWidth={1.5} />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}