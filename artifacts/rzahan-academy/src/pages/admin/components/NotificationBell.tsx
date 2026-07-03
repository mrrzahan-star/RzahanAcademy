import { useState, useEffect, useRef } from "react";
import { Bell, Users, FileText, Award, ShieldOff } from "lucide-react";
import { adminFetch, fmtDateTime } from "./utils";

interface Notification {
  type: "user" | "test" | "cert" | "block";
  title: string;
  at: string | null;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const lastSeenRef = useRef<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("admin_notif_seen_at") : null,
  );
  const panelRef = useRef<HTMLDivElement>(null);

  function computeUnread(data: Notification[]) {
    const seen = lastSeenRef.current ? new Date(lastSeenRef.current).getTime() : 0;
    return data.filter(n => n.at && new Date(n.at).getTime() > seen).length;
  }

  function fetchNotifications() {
    adminFetch("/api/admin/notifications")
      .then((data: Notification[]) => {
        setNotifications(data);
        setUnread(computeUnread(data));
      })
      .catch(() => {});
  }

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  function handleOpen() {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen) {
      const now = new Date().toISOString();
      localStorage.setItem("admin_notif_seen_at", now);
      lastSeenRef.current = now;
      setUnread(0);
    }
  }

  const typeIcon = (type: Notification["type"]) => {
    const cls = "h-3.5 w-3.5 shrink-0";
    if (type === "user") return <Users className={`${cls} text-blue-500`} />;
    if (type === "test") return <FileText className={`${cls} text-indigo-500`} />;
    if (type === "cert") return <Award className={`${cls} text-emerald-500`} />;
    if (type === "block") return <ShieldOff className={`${cls} text-red-500`} />;
    return <Bell className={`${cls} text-indigo-400`} />;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-indigo-100 bg-white text-indigo-500 hover:bg-indigo-50 transition-colors"
        aria-label="Bildirişlər"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl border border-indigo-100 bg-white shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-indigo-50 flex items-center justify-between">
            <span className="font-bold text-indigo-950 text-sm">Bildirişlər</span>
            <button
              onClick={() => setOpen(false)}
              className="text-indigo-300 hover:text-indigo-600 text-xl leading-none"
            >
              &times;
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-indigo-50/60">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-indigo-300 text-sm">Bildiriş yoxdur</div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="px-4 py-3 flex items-start gap-2.5 hover:bg-indigo-50/30 transition-colors">
                  <div className="mt-0.5">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-indigo-900 leading-snug">{n.title}</div>
                    {n.at && <div className="text-xs text-indigo-300 mt-0.5">{fmtDateTime(n.at)}</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
