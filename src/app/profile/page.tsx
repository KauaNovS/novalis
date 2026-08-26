"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  Trophy,
  Star,
  Flame,
  LogOut,
  Pencil,
  X,
  Check,
} from "lucide-react";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  gamification?: {
    xp: number;
    level: number;
    rank: string;
    streak: number;
    totalXp: number;
    badges: { id: string; name: string }[];
  };
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);

  // Campos de edição
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar perfil");
      setProfile(data);
      setEditName(data.name || "");
      setEditEmail(data.email || "");
      setEditPhone(data.phone || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          phone: editPhone,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");
      setProfile(data);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChangePassword = async () => {
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: editPassword,
          newPassword: editNewPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao alterar senha");
      setEditPassword("");
      setEditNewPassword("");
      alert("Senha alterada com sucesso!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-[#1a1a1a] rounded w-1/3"></div>
          <div className="h-40 bg-[#1a1a1a] rounded-3xl"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] p-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-rose-400">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="mt-4 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 hover:border-gray-600 transition"
          >
            Ir para login
          </button>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const gamification = profile.gamification;

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-medium text-white">Meu Perfil</h1>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
          >
            <LogOut size={16} strokeWidth={1.5} />
            Sair
          </button>
        </div>

        {/* Card principal */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#222] flex items-center justify-center text-xl font-semibold text-gray-300">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="text-lg font-medium text-white">{profile.name}</h2>
                <p className="text-sm text-gray-500">{profile.role}</p>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition"
              >
                <Pencil size={16} strokeWidth={1.5} />
                Editar
              </button>
            )}
          </div>

          {!editing ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-gray-500" strokeWidth={1.5} />
                <span className="text-sm text-gray-300">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-500" strokeWidth={1.5} />
                <span className="text-sm text-gray-300">{profile.phone || "—"}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Telefone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl bg-[#222] border border-[#2a2a2a] text-gray-400 text-sm hover:text-gray-200 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Gamificação */}
        {gamification && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Trophy size={18} className="text-yellow-400" strokeWidth={1.5} />
              Gamificação
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">XP</p>
                <p className="text-xl font-semibold text-white">{gamification.xp}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Nível</p>
                <p className="text-xl font-semibold text-white">{gamification.level}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Streak</p>
                <p className="text-xl font-semibold text-white flex items-center gap-1">
                  <Flame size={16} className="text-orange-400" />
                  {gamification.streak} dias
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rank</p>
                <p className="text-xl font-semibold text-white">{gamification.rank}</p>
              </div>
            </div>
            {gamification.badges && gamification.badges.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {gamification.badges.map((badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-300 text-xs"
                  >
                    <Star size={12} />
                    {badge.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Alterar senha */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Lock size={18} className="text-gray-400" strokeWidth={1.5} />
            Alterar Senha
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Senha atual</label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Nova senha</label>
              <input
                type="password"
                value={editNewPassword}
                onChange={(e) => setEditNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={!editPassword || !editNewPassword}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition disabled:opacity-50"
            >
              Alterar senha
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}