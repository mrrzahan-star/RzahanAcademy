import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, History } from "lucide-react";
import { adminFetch, userName, type AdminDailyTaskStat, type PaginatedResponse } from "./utils";
import { UserProfileDrawer } from "./UserProfileDrawer";

export function DailyTasksTab() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminDailyTaskStat[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyProfileId, setHistoryProfileId] = useState<number | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limit = 20;

  const load = useCallback(async (u = userSearch, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit), userSearch: u });
      const r: PaginatedResponse<AdminDailyTaskStat> = await adminFetch(`/api/admin/daily-tasks?${params}`);
      setData(r.data); setTotal(r.total);
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, userSearch, toast]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(val: string) {
    setUserSearch(val); setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(val, 1), 400);
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  function completionPct(stat: AdminDailyTaskStat) {
    if (!stat.totalSlots) return 0;
    return Math.round((stat.completedSlots / stat.totalSlots) * 100);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <Input
            value={userSearch}
            onChange={e => handleSearch(e.target.value)}
            placeholder="İstifadəçi adı və ya e-poçt..."
            className="pl-9 rounded-xl h-10 border-indigo-100"
          />
        </div>
        <span className="text-sm text-indigo-600/70 whitespace-nowrap">Cəmi istifadəçi: {total}</span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-indigo-50">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50/60">
            <tr>
              <th className="text-left p-3 font-semibold text-indigo-700">İstifadəçi</th>
              <th className="text-left p-3 font-semibold text-indigo-700">Tamamlanma</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden sm:table-cell">Tapşırıqlar</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden md:table-cell">Günlər</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden lg:table-cell">Streak</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-50/60">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-indigo-400">Yüklənir...</td></tr>
            ) : data.map(s => (
              <tr key={s.userId} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0 overflow-hidden">
                      {s.avatarUrl ? <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" /> : (s.firstName?.[0] || "U")}
                    </div>
                    <div>
                      <div className="font-medium text-indigo-950">{userName(s)}</div>
                      <div className="text-xs text-indigo-400">{s.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-indigo-100 rounded-full h-2 min-w-[60px]">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${completionPct(s)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-primary">{completionPct(s)}%</span>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell text-sm text-indigo-700">
                  {s.completedSlots} / {s.totalSlots}
                </td>
                <td className="p-3 hidden md:table-cell text-sm text-indigo-700">{s.daysLogged} gün</td>
                <td className="p-3 hidden lg:table-cell">
                  <span className="text-sm font-bold text-orange-500">{s.streak ?? 0}</span>
                  <span className="text-xs text-indigo-400 ml-1">gün</span>
                </td>
                <td className="p-3">
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 rounded-lg text-indigo-400 hover:bg-indigo-50"
                    title="Tarixçəni gör"
                    onClick={() => { if (s.profileId) setHistoryProfileId(s.profileId); }}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && <div className="text-center py-16 text-indigo-400">Məlumat tapılmadı</div>}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Əvvəl</Button>
        <span className="text-sm text-indigo-600">{page} / {pages}</span>
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Növbəti</Button>
      </div>

      {historyProfileId !== null && (
        <UserProfileDrawer
          userId={historyProfileId}
          open={historyProfileId !== null}
          onClose={() => setHistoryProfileId(null)}
        />
      )}
    </div>
  );
}
