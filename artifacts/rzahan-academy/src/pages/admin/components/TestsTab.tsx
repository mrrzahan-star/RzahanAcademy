import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download } from "lucide-react";
import { adminFetch, fmtDate, userName, type AdminTest, type PaginatedResponse } from "./utils";
import { downloadAdminCsv } from "@/lib/csvDownload";

export function TestsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminTest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r: PaginatedResponse<AdminTest> = await adminFetch(`/api/admin/tests?page=${page}&limit=${limit}`);
      setData(r.data); setTotal(r.total);
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, toast]);

  useEffect(() => { load(); }, [load]);

  async function deleteTest(id: number) {
    if (!confirm("Bu test nəticəsini silmək istədiyinizdən əminsiniz?")) return;
    try {
      await adminFetch(`/api/admin/tests/${id}`, { method: "DELETE" });
      setData(prev => prev.filter(t => t.id !== id));
      setTotal(prev => prev - 1);
      toast({ title: "Test silindi" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function exportCsv() {
    try {
      downloadAdminCsv("/api/admin/tests/export.csv", "testler.csv");
    } catch { toast({ title: "Xəta", variant: "destructive" }); }
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-indigo-700">Cəmi: {total}</span>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={exportCsv}>
          <Download className="h-4 w-4" /> CSV İxrac
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-indigo-50">
        <table className="w-full text-sm">
          <thead className="bg-indigo-50/60">
            <tr>
              <th className="text-left p-3 font-semibold text-indigo-700">ID</th>
              <th className="text-left p-3 font-semibold text-indigo-700">İstifadəçi</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden sm:table-cell">Mərhələ</th>
              <th className="text-left p-3 font-semibold text-indigo-700">Bal</th>
              <th className="text-left p-3 font-semibold text-indigo-700 hidden md:table-cell">Tarix</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-indigo-50/60">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-indigo-400">Yüklənir...</td></tr>
            ) : data.map(t => (
              <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="p-3 font-mono text-indigo-400 text-xs">#{t.id}</td>
                <td className="p-3">
                  <div className="font-medium text-indigo-950 text-sm">{userName(t)}</div>
                  <div className="text-xs text-indigo-400 hidden sm:block">{t.email || t.userId.slice(0, 12) + "..."}</div>
                </td>
                <td className="p-3 hidden sm:table-cell">
                  <Badge variant="secondary" className="text-xs font-semibold">{t.stageName}</Badge>
                </td>
                <td className="p-3 text-primary font-bold">{t.totalScore}</td>
                <td className="p-3 text-indigo-400 text-xs hidden md:table-cell">{fmtDate(t.createdAt)}</td>
                <td className="p-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-50 rounded-lg"
                    onClick={() => deleteTest(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && data.length === 0 && <div className="text-center py-16 text-indigo-400">Test tapılmadı</div>}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Əvvəl</Button>
        <span className="text-sm text-indigo-600">{page} / {pages}</span>
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Növbəti</Button>
      </div>
    </div>
  );
}
