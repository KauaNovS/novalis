"use client";

import { useEffect, useState } from "react";
import { Plus, X, UserPlus, Trash2, Loader2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
  leader: { id: string; name: string; email: string };
  members: { id: string; name: string; email: string; userType: string }[];
}

interface UserItem {
  id: string;
  name: string;
  email: string;
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [usersWithoutTeam, setUsersWithoutTeam] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newLeaderId, setNewLeaderId] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const [teamsRes, usersRes] = await Promise.all([
        fetch("/api/teams", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users?withoutTeam=true", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const teamsData = await teamsRes.json();
      const usersData = await usersRes.json();
      if (teamsRes.ok) setTeams(teamsData);
      if (usersRes.ok) setUsersWithoutTeam(usersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async () => {
    if (!newTeamName || !newLeaderId) return;
    setCreating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newTeamName, leaderId: newLeaderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar equipe");
      setTeams((prev) => [...prev, data]);
      setNewTeamName("");
      setNewLeaderId("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleAddMember = async (teamId: string) => {
    if (!selectedUserId) return;
    setAddingMember(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adicionar membro");
      // Atualiza a lista local
      setTeams((prev) =>
        prev.map((team) =>
          team.id === teamId
            ? { ...team, members: [...team.members, data] }
            : team
        )
      );
      setSelectedUserId("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        setTeams((prev) =>
          prev.map((team) =>
            team.id === teamId
              ? { ...team, members: team.members.filter((m) => m.id !== userId) }
              : team
          )
        );
      }
    } catch {
      // ignora
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-5xl mx-auto animate-pulse">
          <div className="h-8 bg-[#1a1a1a] rounded w-1/4 mb-6"></div>
          <div className="h-12 bg-[#1a1a1a] rounded mb-3"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Gestão de Equipes</h1>
            <p className="text-sm text-gray-500 mt-1">Crie equipes e gerencie membros</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* Criar nova equipe */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 mb-6">
          <h2 className="text-lg font-medium text-white mb-4">Nova Equipe</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Nome da equipe"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
            />
            <select
              value={newLeaderId}
              onChange={(e) => setNewLeaderId(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
            >
              <option value="">Selecione o líder</option>
              {usersWithoutTeam.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateTeam}
              disabled={creating || !newTeamName || !newLeaderId}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition disabled:opacity-50"
            >
              <Plus size={16} />
              Criar Equipe
            </button>
          </div>
        </div>

        {/* Lista de equipes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{team.name}</h3>
                  <p className="text-xs text-gray-500">Líder: {team.leader.name}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-400">Membros ({team.members.length})</p>
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-[#222] rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm text-gray-200">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(team.id, member.id)}
                      className="p-1 rounded text-gray-500 hover:text-rose-400 transition"
                      title="Remover"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Adicionar membro */}
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  <option value="">Selecione usuário...</option>
                  {usersWithoutTeam.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleAddMember(team.id)}
                  disabled={addingMember || !selectedUserId}
                  className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition disabled:opacity-50"
                >
                  <UserPlus size={14} />
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}