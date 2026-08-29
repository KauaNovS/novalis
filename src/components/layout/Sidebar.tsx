"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  HardHat,
  Key,
  Users,
  Briefcase,
  FileText,
  LineChart,
  Bell,
  Trophy,
  FileBarChart,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projetos", icon: Building2 },
  { href: "/developers", label: "Incorporadoras", icon: HardHat },
  { href: "/builders", label: "Construtoras", icon: Building2 },
  { href: "/units", label: "Unidades", icon: Key },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/crm", label: "CRM", icon: Briefcase },
  { href: "/opportunities", label: "Oportunidades", icon: Briefcase },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/market-intelligence", label: "Mercado", icon: LineChart },
  { href: "/notifications", label: "Notificações", icon: Bell },
  { href: "/gamification", label: "Ranking", icon: Trophy },
  { href: "/reports", label: "Relatórios", icon: FileBarChart },
];

interface UserInfo {
  name?: string;
  email?: string;
  role?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } h-screen bg-[#0a0a0a] text-gray-400 flex flex-col transition-all duration-300 border-r border-gray-900 sticky top-0`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-gray-900 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
          N
        </div>
        {!collapsed && (
          <span className="text-base font-medium text-white tracking-wide">
            Novalis
          </span>
        )}
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
        {menuItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : ""}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-colors ${
                isActive
                  ? "bg-gray-800/80 text-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Icon size={16} strokeWidth={1.5} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Item de Gerenciar Acessos, visível apenas para MASTER */}
        {user?.role === "MASTER" && (
          <>
            <Link
              href="/admin/access"
              title={collapsed ? "Gerenciar Acessos" : ""}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-colors ${
                pathname === "/admin/access" || pathname.startsWith("/admin/access/")
                  ? "bg-gray-800/80 text-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Shield size={16} strokeWidth={1.5} className="shrink-0" />
              {!collapsed && <span>Gerenciar Acessos</span>}
            </Link>

            <Link
              href="/admin/teams"
              title={collapsed ? "Equipes" : ""}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[13px] font-normal transition-colors ${
                pathname === "/admin/teams" || pathname.startsWith("/admin/teams/")
                  ? "bg-gray-800/80 text-gray-200"
                  : "text-gray-500 hover:text-gray-300 hover:bg-gray-800/40"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <Users size={16} strokeWidth={1.5} className="shrink-0" />
              {!collapsed && <span>Equipes</span>}
            </Link>
          </>
        )}
      </nav>

      {/* Rodapé */}
      <div className="border-t border-gray-900 px-3 py-2 space-y-0.5 shrink-0">
        {user && (
          <Link
            href="/profile"
            className={`flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800/40 transition ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-medium shrink-0">
              {user.name
                ? user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()
                : "?"}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-300 truncate">
                  {user.name || "Usuário"}
                </p>
                <p className="text-[10px] text-gray-600 truncate">
                  {user.role || "CLIENT"}
                </p>
              </div>
            )}
          </Link>
        )}

        <div className="flex items-center gap-0.5">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-1.5 flex-1 px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 transition ${
              collapsed ? "justify-center" : ""
            }`}
            title="Sair"
          >
            <LogOut size={14} strokeWidth={1.5} />
            {!collapsed && <span>Sair</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 transition"
            title={collapsed ? "Expandir" : "Retrair"}
          >
            {collapsed ? <ChevronRight size={14} strokeWidth={1.5} /> : <ChevronLeft size={14} strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </aside>
  );
}