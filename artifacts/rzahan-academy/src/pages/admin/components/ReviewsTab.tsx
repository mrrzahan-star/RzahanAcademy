import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, CheckCircle, XCircle, Pencil, Search } from "lucide-react";
import { adminFetch, fmtDate, type AdminComment, type PaginatedResponse } from "./utils";

export function ReviewsTab() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminComment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState<AdminComment | null>(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limit = 20;

  const load = useCallback(async (q = search, f = filter, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit), search: q, filter: f });
      const r: PaginatedResponse<AdminComment> = await adminFetch(`/api/admin/comments?${params}`);
      setData(r.data); setTotal(r.total);
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  }, [page, search, filter, toast]);

  useEffect(() => { load(); }, [load]);

  function handleSearch(val: string) {
    setSearch(val); setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(val, filter, 1), 400);
  }

  function handleFilter(f: string) {
    setFilter(f); setPage(1);
    load(search, f, 1);
  }

  async function approve(id: number) {
    try {
      await adminFetch(`/api/admin/comments/${id}/approve`, { method: "POST" });
      setData(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
      toast({ title: "Rəy təsdiqləndi" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function reject(id: number) {
    try {
      await adminFetch(`/api/admin/comments/${id}/reject`, { method: "POST" });
      setData(prev => prev.map(c => c.id === id ? { ...c, approved: false } : c));
      toast({ title: "Rəy rədd edildi" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function deleteComment(id: number) {
    if (!confirm("Bu rəyi silmək istədiyinizdən əminsiniz?")) return;
    try {
      await adminFetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      setData(prev => prev.filter(c => c.id !== id));
      setTotal(prev => prev - 1);
      toast({ title: "Rəy silindi" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  function openEdit(c: AdminComment) {
    setEditTarget(c); setEditAuthor(c.authorName); setEditContent(c.content);
  }

  async function saveEdit() {
    if (!editTarget) return;
    setEditLoading(true);
    try {
      await adminFetch(`/api/admin/comments/${editTarget.id}`, {
        method: "PUT",
        body: JSON.stringify({ authorName: editAuthor, content: editContent }),
      });
      setData(prev => prev.map(c => c.id === editTarget.id ? { ...c, authorName: editAuthor, content: editContent } : c));
      toast({ title: "Rəy yeniləndi" });
      setEditTarget(null);
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setEditLoading(false); }
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <Input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Axtar..."
            className="pl-9 rounded-xl h-10 border-indigo-100" />
        </div>
        {["", "pending", "approved"].map(f => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
            className="rounded-xl text-xs"
            onClick={() => handleFilter(f)}>
            {f === "" ? "Hamısı" : f === "pending" ? "Gözləyən" : "Təsdiqlənmiş"}
          </Button>
        ))}
        <span className="text-sm text-indigo-600/70 ml-auto">Cəmi: {total}</span>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-indigo-400">Yüklənir...</div>
        ) : data.map(c => (
          <div key={c.id} className={`rounded-2xl border p-4 ${c.approved ? "border-indigo-50 bg-white" : "border-amber-100 bg-amber-50/20"}`}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-indigo-950">{c.authorName}</span>
                  {c.rating && <span className="text-xs text-amber-500 font-bold">{"★".repeat(c.rating)}{"☆".repeat(5 - c.rating)}</span>}
                  {c.stageName && <span className="text-xs text-indigo-500 font-medium">{c.stageName}</span>}
                  <Badge variant={c.approved ? "secondary" : "outline"}
                    className={`text-xs ${!c.approved ? "border-amber-300 text-amber-700" : ""}`}>
                    {c.approved ? "Təsdiqlənib" : "Gözləyir"}
                  </Badge>
                </div>
                <p className="text-sm text-indigo-900/70 leading-relaxed">{c.content}</p>
                <div className="text-xs text-indigo-400 mt-1.5">{fmtDate(c.createdAt)}</div>
              </div>
              <div className="flex gap-1.5 shrink-0 flex-wrap">
                {!c.approved && (
                  <Button size="sm" className="rounded-lg text-xs bg-green-500 hover:bg-green-600 text-white gap-1" onClick={() => approve(c.id)}>
                    <CheckCircle className="h-3 w-3" /> Təsdiqlə
                  </Button>
                )}
                {c.approved && (
                  <Button size="sm" variant="outline" className="rounded-lg text-xs border-amber-200 text-amber-700 hover:bg-amber-50 gap-1" onClick={() => reject(c.id)}>
                    <XCircle className="h-3 w-3" /> Rədd Et
                  </Button>
                )}
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg text-indigo-500 hover:bg-indigo-50" onClick={() => openEdit(c)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-50" onClick={() => deleteComment(c.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && <div className="text-center py-16 text-indigo-400">Rəy tapılmadı</div>}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Əvvəl</Button>
        <span className="text-sm text-indigo-600">{page} / {pages}</span>
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Növbəti</Button>
      </div>

      <Dialog open={!!editTarget} onOpenChange={v => !v && setEditTarget(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader><DialogTitle className="text-indigo-950">Rəyi Redaktə Et</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs font-semibold text-indigo-900 mb-1 block">Müəllif</Label>
              <Input value={editAuthor} onChange={e => setEditAuthor(e.target.value)} className="rounded-xl h-10" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-indigo-900 mb-1 block">Məzmun</Label>
              <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                className="w-full rounded-xl border border-indigo-100 p-3 text-sm text-indigo-950 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                rows={4} />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditTarget(null)}>Ləğv Et</Button>
              <Button className="flex-1 rounded-xl" onClick={saveEdit} disabled={editLoading}>
                {editLoading ? "Saxlanır..." : "Saxla"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
