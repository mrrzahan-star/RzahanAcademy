import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";
import { adminFetch, userName, type AdminLeaderboardEntry, type PaginatedResponse } from "./utils";

export function LeaderboardTab() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminLeaderboardEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r: PaginatedResponse<AdminLeaderboardEntry> = await adminFetch(`/api/admin/leaderboard?page=${page}&limit=${limit}`);
      setData(r.data); setTotal(r.total);
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, toast]);

  useEffect(() => { load(); }, [load]);

  async function resetLeaderboard() {
    if (!confirm("Liderlik cədvəlini sıfırlamaq istədiyinizdən əminsiniz? Bu tarix-vaxtı qeydə alır, mövcud məlumatları silmir.")) return;
    setResetting(true);
    try {
      await adminFetch("/api/admin/leaderboard/reset", { method: "POST" });
      toast({ title: "Liderlik cədvəli sıfırlandı" });
      load();
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setResetting(false); }
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  const rankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-700";
    if (rank === 2) return "bg-gray-100 text-gray-600";
    if (rank === 3) return "bg-orange-100 text-orange-700";
    return "bg-indigo-50 text-indigo-600";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <span className="text-sm font-semibold text-indigo-700">Cəmi: {total} istifadəçi</span>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
          onClick={resetLeaderboard} disabled={resetting}>
          <RotateCcw className="h-4 w-4" /> {resetting ? "Sıfırlanır..." : "Sıfırla"}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-indigo-50">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50/60">
            <tr>
              <th className="text-left p-3 font-semibold text-indigo-700">Sıra</th>
              <th className="text-left p-3 font-semibold text-indigo-700">İstifadəçi</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden sm:table-cell">Mərhələ</th>
              <th className="text-left p-3 font-semibold text-indigo-700">Testlər</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden md:table-cell">Sertifikat</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden lg:table-cell">Streak</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-50/60">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-indigo-400">Yüklənir...</td></tr>
            ) : data.map(e => (
              <tr key={e.userId} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-3">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${rankBadge(e.rank)}`}>#{e.rank}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0 overflow-hidden">
                      {e.avatarUrl ? <img src={e.avatarUrl} alt="" className="w-full h-full object-cover" /> : (e.firstName?.[0] || "U")}
                    </div>
                    <div>
                      <div className="font-medium text-indigo-950">{userName(e)}</div>
                      <div className="text-xs text-indigo-400">{e.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  {e.consciousnessStage
                    ? <Badge variant="secondary" className="text-xs">{e.consciousnessStage}</Badge>
                    : <span className="text-indigo-300 text-xs">—</span>}
                </td>
                <td className="p-3 text-indigo-700 font-semibold">{e.testCount}</td>
                <td className="p-3 hidden md:table-cell text-indigo-700 font-semibold">{e.certCount}</td>
                <td className="p-3 hidden lg:table-cell">
                  <span className="text-orange-500 font-bold">{e.streak}</span>
                  <span className="text-xs text-indigo-400 ml-1">gün</span>
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
    </div>
  );
}
