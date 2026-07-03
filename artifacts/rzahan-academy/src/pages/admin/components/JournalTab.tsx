import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, Search, User } from "lucide-react";
import { adminFetch, fmtDate, userName, type AdminJournal, type PaginatedResponse } from "./utils";
import { downloadAdminCsv } from "@/lib/csvDownload";

export function JournalTab() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminJournal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limit = 20;

  const load = useCallback(async (q = search, u = userSearch, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit), search: q, userSearch: u });
      const r: PaginatedResponse<AdminJournal> = await adminFetch(`/api/admin/journals?${params}`);
      setData(r.data); setTotal(r.total);
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search, userSearch, toast]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(val: string) {
    setSearch(val); setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(val, userSearch, 1), 400);
  }

  function handleUserSearch(val: string) {
    setUserSearch(val); setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(search, val, 1), 400);
  }

  async function deleteJournal(id: number) {
    if (!confirm("Bu gündəlik yazısını silmək istədiyinizdən əminsiniz?")) return;
    try {
      await adminFetch(`/api/admin/journals/${id}`, { method: "DELETE" });
      setData(prev => prev.filter(j => j.id !== id));
      setTotal(prev => prev - 1);
      toast({ title: "Gündəlik silindi" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <Input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Başlığa görə axtar..."
            className="pl-9 rounded-xl h-10 border-indigo-100" />
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <Input value={userSearch} onChange={e => handleUserSearch(e.target.value)} placeholder="İstifadəçi (ad, e-poçt)..."
            className="pl-9 rounded-xl h-10 border-indigo-100" />
        </div>
        <span className="text-sm text-indigo-600/70 whitespace-nowrap">Cəmi: {total}</span>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5"
          onClick={() => downloadAdminCsv("/api/admin/journals/export.csv", "gundelikler.csv")}>
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-indigo-50">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50/60">
            <tr>
              <th className="text-left p-3 font-semibold text-indigo-700">Başlıq</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden sm:table-cell">İstifadəçi</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden md:table-cell">Kateqoriya</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden lg:table-cell">Tarix</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-50/60">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-indigo-400">Yüklənir...</td></tr>
            ) : data.map(j => (
              <tr key={j.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-3">
                  <div className="font-medium text-indigo-950 max-w-[200px] truncate">{j.title}</div>
                  <div className="text-xs text-indigo-400 sm:hidden">{userName(j)}</div>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <div className="font-medium text-indigo-800 text-sm">{userName(j)}</div>
                  <div className="text-xs text-indigo-400">{j.email}</div>
                </td>
                <td className="p-3 hidden md:table-cell">
                  <Badge variant="secondary" className="text-xs">{j.category}</Badge>
                </td>
                <td className="p-3 text-indigo-400 text-xs hidden lg:table-cell">{fmtDate(j.createdAt)}</td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-lg"
                    onClick={() => deleteJournal(j.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && <div className="text-center py-16 text-indigo-400">Gündəlik tapılmadı</div>}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Əvvəl</Button>
        <span className="text-sm text-indigo-600">{page} / {pages}</span>
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Növbəti</Button>
      </div>
    </div>
  );
}
