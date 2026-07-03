import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldOff, Trash2, Pencil, User, KeyRound, Download, Search } from "lucide-react";
import { adminFetch, fmtDate, userName, type AdminUser, type PaginatedResponse } from "./utils";
import { downloadAdminCsv } from "@/lib/csvDownload";
import { EditUserModal } from "./EditUserModal";
import { UserProfileDrawer } from "./UserProfileDrawer";

const ADMIN_EMAIL = "mr.rzahan@gmail.com";

export function UsersTab() {
  const { toast } = useToast();
  const [data, setData] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limit = 20;

  const load = useCallback(async (q = search, f = filter, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit), search: q, filter: f });
      const r: PaginatedResponse<AdminUser> = await adminFetch(`/api/admin/users?${params}`);
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

  async function blockToggle(id: number, block: boolean) {
    try {
      await adminFetch(`/api/admin/users/${id}/${block ? "block" : "unblock"}`, { method: "POST" });
      setData(prev => prev.map(u => u.id === id ? { ...u, isBlocked: block } : u));
      toast({ title: block ? "İstifadəçi bloklandı" : "Blok açıldı" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function deleteUser(id: number, name: string) {
    if (!confirm(`"${name}" adlı istifadəçini silmək istədiyinizdən əminsiniz? Bu əməliyyat geri alına bilməz.`)) return;
    try {
      await adminFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      setData(prev => prev.filter(u => u.id !== id));
      setTotal(prev => prev - 1);
      toast({ title: "İstifadəçi silindi" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function resetPassword(id: number) {
    try {
      const r = await adminFetch(`/api/admin/users/${id}/reset-password`, { method: "POST" });
      if (r?.link) setResetLink(r.link);
      else toast({ title: "Şifrə sıfırlama linki göndərildi" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <Input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Ad, e-poçt axtar..."
            className="pl-9 rounded-xl h-10 border-indigo-100" />
        </div>
        {[["", "Hamısı"], ["active", "Aktiv"], ["blocked", "Bloklu"]].map(([f, label]) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
            className="rounded-xl text-xs" onClick={() => handleFilter(f)}>
            {label}
          </Button>
        ))}
        <span className="text-sm text-indigo-600/70">Cəmi: {total}</span>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5"
          onClick={() => downloadAdminCsv("/api/admin/users/export.csv", "istifadeciler.csv")}>
          <Download className="h-4 w-4" /> CSV
        </Button>
      </div>

      <div className="space-y-2">
        {loading && <div className="text-center py-16 text-indigo-400">Yüklənir...</div>}
        {!loading && data.map(u => (
          <div key={u.id} className={`rounded-2xl border p-3 sm:p-4 flex items-center gap-3 transition-colors ${u.isBlocked ? "border-red-100 bg-red-50/30" : "border-indigo-50 bg-white"}`}>
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0 overflow-hidden">
              {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : (u.firstName?.[0] || "U")}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-indigo-950 text-sm truncate">{userName(u)}</span>
                {u.isBlocked && <Badge variant="destructive" className="text-xs">Bloklu</Badge>}
                {u.email === ADMIN_EMAIL && <Badge className="text-xs bg-indigo-600 text-white">Admin</Badge>}
                {u.consciousnessStage && <Badge variant="secondary" className="text-xs hidden sm:inline-flex">{u.consciousnessStage}</Badge>}
              </div>
              <div className="text-xs text-indigo-400 truncate">{u.email || "E-poçt yoxdur"}</div>
              <div className="text-xs text-indigo-500/70 mt-0.5 hidden sm:block">
                Streak: {u.streak} · Tapşırıq: {u.tasksCompleted} · {fmtDate(u.createdAt)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
              <Button variant="ghost" size="icon" title="Profil" className="h-8 w-8 rounded-lg text-indigo-400 hover:bg-indigo-50"
                onClick={() => setProfileId(u.id)}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Redaktə" className="h-8 w-8 rounded-lg text-indigo-400 hover:bg-indigo-50"
                onClick={() => setEditUser(u)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title="Şifrə sıfırla" className="h-8 w-8 rounded-lg text-indigo-400 hover:bg-indigo-50"
                onClick={() => resetPassword(u.id)}>
                <KeyRound className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" title={u.isBlocked ? "Bloku açın" : "Blokla"}
                className={`h-8 w-8 rounded-lg ${u.isBlocked ? "text-green-600 hover:bg-green-50" : "text-orange-500 hover:bg-orange-50"}`}
                onClick={() => blockToggle(u.id, !u.isBlocked)}>
                {u.isBlocked ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" title="Sil" className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-50"
                onClick={() => deleteUser(u.id, userName(u))}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {!loading && data.length === 0 && <div className="text-center py-16 text-indigo-400">İstifadəçi tapılmadı</div>}
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Əvvəl</Button>
        <span className="text-sm text-indigo-600">{page} / {pages}</span>
        <Button variant="outline" size="sm" className="rounded-xl" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Növbəti</Button>
      </div>

      <EditUserModal
        user={editUser}
        open={!!editUser}
        onClose={() => setEditUser(null)}
        onSaved={(updated) => setData(prev => prev.map(u => u.id === editUser?.id ? { ...u, ...updated } : u))}
      />

      <UserProfileDrawer
        userId={profileId}
        open={!!profileId}
        onClose={() => setProfileId(null)}
      />

      {/* Reset password link dialog */}
      <Dialog open={!!resetLink} onOpenChange={v => !v && setResetLink(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader><DialogTitle className="text-indigo-950">Şifrə Sıfırlama Linki</DialogTitle></DialogHeader>
          <p className="text-sm text-indigo-600/70 mt-2 mb-3">Aşağıdakı linki istifadəçiyə göndərin:</p>
          <div className="rounded-xl bg-indigo-50 p-3 text-xs font-mono text-indigo-800 break-all select-all border border-indigo-100">
            {resetLink}
          </div>
          <Button className="w-full rounded-xl mt-3" onClick={() => { navigator.clipboard.writeText(resetLink || ""); toast({ title: "Kopyalandı" }); }}>
            Kopyala
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
