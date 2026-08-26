"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCheck,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  // Caso queira navegar ao clicar, adicione um campo url:
  // url?: string | null;
}

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar notificações");
      if (Array.isArray(data)) setNotifications(data);
      else if (data.data) setNotifications(data.data);
      else setNotifications([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "POST", // alterado de PUT para POST
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch {
      // ignora erro silenciosamente
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    // Futuramente, se houver URL:
    // if (notification.url) router.push(notification.url);
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      const token = localStorage.getItem("token");
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(
        unread.map(async (n) => {
          await fetch(`/api/notifications/${n.id}/read`, {
            method: "POST", // alterado de PUT para POST
            headers: { Authorization: `Bearer ${token}` },
          });
        })
      );
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignora
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread" && n.read) return false;
    if (filter === "read" && !n.read) return false;
    if (
      search &&
      !`${n.title} ${n.message}`.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main className="min-h-screen bg-[#0f0f0f] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-medium text-white">Notificações</h1>
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} não lida{unreadCount !== 1 ? "s" : ""} de {notifications.length}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 hover:border-gray-600 transition disabled:opacity-50"
            >
              <CheckCheck size={16} strokeWidth={1.5} />
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex rounded-full bg-[#141414] border border-[#2a2a2a] p-1 gap-1 w-fit">
            {(["all", "unread", "read"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                  filter === f
                    ? "bg-blue-500/20 text-blue-300"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {f === "all" ? "Todas" : f === "unread" ? "Não lidas" : "Lidas"}
              </button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
            />
            <input
              type="text"
              placeholder="Buscar notificações..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600 transition"
            />
          </div>

          <button
            onClick={fetchNotifications}
            className="px-4 py-2.5 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-gray-400 hover:border-gray-600 hover:text-gray-200 transition"
            title="Recarregar"
          >
            <RefreshCw size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 animate-pulse">
            <div className="h-5 bg-[#2a2a2a] rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-[#2a2a2a] rounded w-2/3"></div>
          </div>
        ) : error ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-8 text-center">
            <p className="text-rose-400">{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-3xl p-12 text-center">
            <Bell size={48} className="mx-auto text-gray-600 mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              Nenhuma notificação {filter !== "all" ? `(${filter === "unread" ? "não lida" : "lida"})` : ""}
            </h3>
            <p className="text-sm text-gray-600">Você está em dia com seus avisos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-[#1a1a1a] border rounded-3xl p-5 transition cursor-pointer ${
                  notification.read
                    ? "border-[#2a2a2a] hover:border-gray-600"
                    : "border-blue-500/40 bg-blue-500/5 hover:border-blue-500/70"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleNotificationClick(notification);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      notification.read ? "bg-[#222] text-gray-500" : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    <Bell size={16} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-200">
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-600 mt-2">
                      {new Date(notification.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // evita duplo clique no card
                        handleMarkAsRead(notification.id);
                      }}
                      disabled={updatingId === notification.id}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-[#2a2a2a] transition disabled:opacity-50"
                      title="Marcar como lida"
                    >
                      {updatingId === notification.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}