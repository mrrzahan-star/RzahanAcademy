import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import { adminFetch, fmtDateTime, type AdminAuditLog, type PaginatedResponse } from "./utils";
import { downloadAdminCsv } from "@/lib/csvDownload";

const ACTION_COLORS: Record<string, string> = {
  DELETE: "bg-red-50 text-red-700",
  BLOCK: "bg-orange-50 text-orange-700",
  UNBLOCK: "bg-green-50 text-green-700",
  APPROVE: "bg-blue-50 text-blue-700",
  REJECT: "bg-amber-50 text-amber-700",
  UPDATE: "bg-violet-50 text-violet-700",
  EXPORT: "bg-cyan-50 text-cyan-700",
  RESET: "bg-rose-50 text-rose-700",
  VIEW: "bg-indigo-50 text-indigo-600",
};

function actionColor(action: string) {
  const prefix = Object.keys(ACTION_COLORS).find(k => action.startsWith(k));
  return prefix ? ACTION_COLORS[prefix] : "bg-indigo-50 text-indigo-600";
}

const ALL_ACTIONS = [
  "", "VIEW_STATS", "BLOCK_USER", "UNBLOCK_USER", "DELETE_USER", "UPDATE_USER",
  "RESET_PASSWORD", "DELETE_TEST", "DELETE_CERT", "DELETE_JOURNAL",
  "APPROVE_COMMENT", "REJECT_COMMENT", "EDIT_COMMENT", "DELETE_COMMENT",
  "UPDATE_SETTINGS", "RESET_LEADERBOARD", "EXPORT_USERS_CSV", "EXPORT_TESTS_CSV",
  "EXPORT_CERTS_CSV", "EXPORT_JOURNALS_CSV",
];

export function AuditLogTab() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [loading, setLoading] = useState(true);
  const limit = 30;

  const load = useCallback(async (a = action, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit), action: a });
      const r: PaginatedResponse<AdminAuditLog> = await adminFetch(`/api/admin/audit-logs?${params}`);
      setData(r.data); setTotal(r.total);
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, action, toast]);

  useEffect(() => { load(); }, [load]);

  function handleAction(a: string) {
    setAction(a); setPage(1);
    load(a, 1);
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <select value={action} onChange={e => handleAction(e.target.value)}
          className="rounded-xl border border-indigo-100 text-sm text-indigo-700 px-3 h-10 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white">
          {ALL_ACTIONS.map(a => (
            <option key={a} value={a}>{a || "Bütün əməliyyatlar"}</option>
          ))}
        </select>
        <span className="text-sm text-indigo-600/70">Cəmi: {total}</span>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 ml-auto"
          onClick={() => downloadAdminCsv("/api/admin/audit-logs/export.csv", "audit-log.csv")}>
          <Download className="h-4 w-4" /> CSV İxrac
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-indigo-50">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50/60">
            <tr>
              <th className="text-left p-3 font-semibold text-indigo-700">Əməliyyat</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden sm:table-cell">Hədəf</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden md:table-cell">Detallar</th>
              <th className="text-left p-3 font-semibold text-indigo-700">Vaxt</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-50/60">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-indigo-400">Yüklənir...</td></tr>
            ) : data.map(log => (
              <tr key={log.id} className="hover:bg-indigo-50/20 transition-colors">
                <td className="p-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${actionColor(log.action)}`}>
                    {log.action}
                  </span>
                </td>
                <td className="p-3 text-indigo-400 font-mono text-xs hidden sm:table-cell">{log.target || "—"}</td>
                <td className="p-3 text-indigo-500 text-xs max-w-[180px] truncate hidden md:table-cell">
                  {log.details ? JSON.stringify(log.details) : "—"}
                </td>
                <td className="p-3 text-indigo-400 text-xs whitespace-nowrap">{fmtDateTime(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && <div className="text-center py-16 text-indigo-400">Heç bir əməliyyat tapılmadı</div>}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Əvvəl</Button>
        <span className="text-sm text-indigo-600">{page} / {pages}</span>
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Növbəti</Button>
      </div>
    </div>
  );
}
