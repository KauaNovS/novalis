"use client";

import { useEffect, useState } from "react";
import { Pencil, X, Loader2 } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  userType: string;
  permissions: string;
  teamId?: string | null;
  organizationId?: string | null;
  organization?: { id: string; name: string; type: string } | null;
}

interface Organization {
  id: string;
  name: string;
  type: string;
}

const permissionOptions = [
  { value: "create_leads", label: "Criar Leads" },
  { value: "edit_clients", label: "Editar Clientes" },
  { value: "view_reports", label: "Ver Relatórios" },
  { value: "upload_documents", label: "Subir Documentos" },
  { value: "approve_projects", label: "Aprovar Projetos" },
  { value: "manage_members", label: "Gerenciar Membros" },
];

const roleOptions = [
  { value: "MASTER", label: "Admin Geral" },
  { value: "TEAM_LEADER", label: "Líder de Equipe" },
  { value: "MEMBER", label: "Membro" },
  { value: "PARTNER_ADMIN", label: "Admin Parceiro" },
  { value: "PARTNER_MEMBER", label: "Membro Parceiro" },
  { value: "CLIENT", label: "Cliente" },
];

const userTypeOptions = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "CONSULTANT", label: "Consultor Independente" },
  { value: "DEVELOPER", label: "Incorporadora" },
  { value: "AGENCY", label: "Imobiliária" },
  { value: "PARTNER", label: "Parceiro" },
  { value: "MEMBER", label: "Membro de Empresa" },
];

export default function AdminAccessPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar usuários");
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/organizations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setOrganizations(data);
      else if (data.data) setOrganizations(data.data);
    } catch {
      // ignora
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchOrganizations();
  }, []);

  const openEdit = (user: UserItem) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setSelectedUserType(user.userType || "INDIVIDUAL");
    setSelectedPermissions(JSON.parse(user.permissions || "[]"));
    setSelectedOrganizationId(user.organizationId || "");
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: selectedRole,
          userType: selectedUserType,
          permissions: selectedPermissions,
          organizationId: selectedOrganizationId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar permissões");
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                role: selectedRole,
                userType: selectedUserType,
                permissions: JSON.stringify(selectedPermissions),
                organizationId: selectedOrganizationId || null,
                organization: organizations.find((o) => o.id === selectedOrganizationId) || null,
              }
            : u
        )
      );
      setEditingUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
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
            <h1 className="text-2xl font-medium text-white">Gerenciar Acessos</h1>
            <p className="text-sm text-gray-500 mt-1">Defina permissões, papéis e tipos de usuários</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#222]">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 font-medium">Usuário</th>
                  <th className="px-6 py-3 font-medium">Papel</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Empresa/Org.</th>
                  <th className="px-6 py-3 font-medium">Permissões</th>
                  <th className="px-6 py-3 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {users.map((user) => {
                  const perms = JSON.parse(user.permissions || "[]") as string[];
                  const roleLabel = roleOptions.find((r) => r.value === user.role)?.label || user.role;
                  const typeLabel = userTypeOptions.find((t) => t.value === user.userType)?.label || user.userType || "Individual";
                  const orgName = user.organization?.name || "—";
                  return (
                    <tr key={user.id} className="hover:bg-[#2a2a2a] transition">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-200">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{roleLabel}</td>
                      <td className="px-6 py-4 text-gray-400">{typeLabel}</td>
                      <td className="px-6 py-4 text-gray-400">{orgName}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {perms.length > 0 ? (
                            perms.map((p) => (
                              <span key={p} className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-xs">
                                {permissionOptions.find((o) => o.value === p)?.label || p}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-600 text-xs">Nenhuma</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-[#2a2a2a] transition"
                          title="Editar permissões"
                        >
                          <Pencil size={16} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Editar Acesso</h2>
              <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a] transition">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Papel</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Tipo de usuário</label>
                <select
                  value={selectedUserType}
                  onChange={(e) => setSelectedUserType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  {userTypeOptions.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Empresa/Organização</label>
                <select
                  value={selectedOrganizationId}
                  onChange={(e) => setSelectedOrganizationId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#222] border border-[#2a2a2a] text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-600"
                >
                  <option value="">Nenhuma</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Permissões</label>
                <div className="space-y-2">
                  {permissionOptions.map((perm) => (
                    <label key={perm.value} className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.value)}
                        onChange={() => togglePermission(perm.value)}
                        className="rounded border-gray-600 bg-[#222]"
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}