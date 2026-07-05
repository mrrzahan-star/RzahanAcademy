import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "./utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, UserCheck, Clock, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────

const REQUEST_STATUS_LABELS: Record<string, string> = {
  new: "Yeni", contacted: "Əlaqə Saxlanıldı", payment_pending: "Ödəniş Gözlənilir", activated: "Aktiv Edildi", cancelled: "Ləğv Edildi",
};
const REQUEST_STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-100 text-amber-700", contacted: "bg-blue-100 text-blue-700",
  payment_pending: "bg-purple-100 text-purple-700", activated: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};
const MEM_STATUS_LABELS: Record<string, string> = {
  active: "Aktiv", expired: "Bitmiş", cancelled: "Ləğv Edildi", paused: "Dayandırılmış",
};
const MEM_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700", expired: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-600", paused: "bg-amber-100 text-amber-700",
};

function Chip({ label, color }: { label: string; color: string }) {
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{label}</span>;
}

function fmt(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("az-AZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Widgets ───────────────────────────────────────────────────────────────────

function WidgetBar({ widgets }: { widgets: any }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
      {[
        { label: "Yeni Müraciət", value: widgets.newRequests, icon: "📬", color: "bg-amber-50 border-amber-100 text-amber-700" },
        { label: "Bu gün bitir", value: widgets.expiringToday, icon: "⏰", color: "bg-red-50 border-red-100 text-red-700" },
        { label: "7 günə bitir", value: widgets.expiring7d, icon: "⚠️", color: "bg-orange-50 border-orange-100 text-orange-700" },
        { label: "Aktiv Üzvlük", value: widgets.activeCount, icon: "✅", color: "bg-green-50 border-green-100 text-green-700" },
        { label: "Bitmiş Üzvlük", value: widgets.expiredCount, icon: "📭", color: "bg-slate-50 border-slate-100 text-slate-600" },
      ].map(w => (
        <div key={w.label} className={`rounded-2xl border px-4 py-3 ${w.color}`}>
          <div className="text-2xl font-bold">{w.value}</div>
          <div className="text-xs mt-0.5">{w.icon} {w.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── Requests ──────────────────────────────────────────────────────────────────

function RequestsTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [statusVal, setStatusVal] = useState("");
  const [notesVal, setNotesVal] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminFetch("/api/admin/memberships/requests").then(setRows).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const save = async (id: number) => {
    try {
      await adminFetch(`/api/admin/memberships/requests/${id}`, { method: "PUT", body: JSON.stringify({ status: statusVal, adminNotes: notesVal }) });
      toast({ title: "✅ Yeniləndi" });
      setEditing(null);
      load();
    } catch { toast({ title: "Xəta", variant: "destructive" }); }
  };

  if (loading) return <div className="py-8 text-center text-indigo-400 text-sm">Yüklənir...</div>;
  if (!rows.length) return <div className="py-8 text-center text-indigo-400 text-sm">Müraciət yoxdur.</div>;

  return (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.id} className="bg-white border border-indigo-50 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-bold text-indigo-950">{r.fullName}</div>
              <div className="text-sm text-indigo-500">{r.phone} {r.email ? `· ${r.email}` : ""}</div>
              <div className="text-sm text-indigo-600 font-medium mt-1">{r.packageName}</div>
              {r.notes && <div className="text-xs text-indigo-400 mt-1 italic">"{r.notes}"</div>}
            </div>
            <div className="flex flex-col items-end gap-2">
              <Chip label={REQUEST_STATUS_LABELS[r.status] ?? r.status} color={REQUEST_STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-600"} />
              <div className="text-xs text-indigo-400">{fmt(r.createdAt)}</div>
            </div>
          </div>
          {editing === r.id ? (
            <div className="mt-3 space-y-2 border-t border-indigo-50 pt-3">
              <Select value={statusVal} onValueChange={setStatusVal}>
                <SelectTrigger className="rounded-xl border-indigo-100 text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea value={notesVal} onChange={e => setNotesVal(e.target.value)} placeholder="Admin qeydi..." className="text-sm rounded-xl border-indigo-100 min-h-[60px]" />
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl" onClick={() => save(r.id)}>Saxla</Button>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>Ləğv</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="mt-2 rounded-xl text-xs border-indigo-100" onClick={() => { setEditing(r.id); setStatusVal(r.status); setNotesVal(r.adminNotes ?? ""); }}>
              Redaktə
            </Button>
          )}
          {r.adminNotes && editing !== r.id && <div className="text-xs text-slate-500 mt-1">📝 {r.adminNotes}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Activate ──────────────────────────────────────────────────────────────────

function ActivateTab({ onDone }: { onDone: () => void }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ userId: "", packageSlug: "", durationDays: "30", notes: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => { adminFetch("/api/admin/memberships/users").then(setUsers).catch(() => {}); }, []);

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.userId || !form.packageSlug) { toast({ title: "İstifadəçi və paket seçin", variant: "destructive" }); return; }
    setLoading(true);
    try {
      await adminFetch("/api/admin/memberships/activate", {
        method: "POST",
        body: JSON.stringify({ userId: form.userId, packageSlug: form.packageSlug, durationDays: form.packageSlug === "baslanqic" ? undefined : Number(form.durationDays), notes: form.notes || undefined }),
      });
      toast({ title: "✅ Üzvlük aktiv edildi!" });
      setForm({ userId: "", packageSlug: "", durationDays: "30", notes: "" });
      onDone();
    } catch { toast({ title: "Xəta", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md space-y-4">
      <h3 className="text-sm font-bold text-indigo-700">Üzvlük Aktivləşdir</h3>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-indigo-700">İstifadəçi</Label>
        <Select value={form.userId} onValueChange={v => set("userId", v)}>
          <SelectTrigger className="rounded-xl border-indigo-100"><SelectValue placeholder="İstifadəçi seçin" /></SelectTrigger>
          <SelectContent>
            {users.map(u => (
              <SelectItem key={u.userId} value={u.userId}>
                {u.username} — {u.firstName} {u.lastName} ({u.currentPackageSlug})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-indigo-700">Paket</Label>
        <Select value={form.packageSlug} onValueChange={v => set("packageSlug", v)}>
          <SelectTrigger className="rounded-xl border-indigo-100"><SelectValue placeholder="Paket seçin" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="baslanqic">🌱 Başlanğıc (Pulsuz)</SelectItem>
            <SelectItem value="inkisaf">🚀 İnkişaf</SelectItem>
            <SelectItem value="ustad">👑 Ustad</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {form.packageSlug && form.packageSlug !== "baslanqic" && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-indigo-700">Müddət (gün)</Label>
          <Select value={form.durationDays} onValueChange={v => set("durationDays", v)}>
            <SelectTrigger className="rounded-xl border-indigo-100"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 gün (1 ay)</SelectItem>
              <SelectItem value="90">90 gün (3 ay)</SelectItem>
              <SelectItem value="180">180 gün (6 ay)</SelectItem>
              <SelectItem value="365">365 gün (1 il)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-indigo-700">Qeyd (ixtiyari)</Label>
        <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Ödəniş tarixi, qeydlər..." className="rounded-xl border-indigo-100 min-h-[60px] text-sm" />
      </div>
      <Button className="rounded-xl bg-primary" onClick={submit} disabled={loading}>
        {loading ? "Aktivləşdirilir..." : "Üzvlüyü Aktiv Et"}
      </Button>
    </div>
  );
}

// ── All Memberships ───────────────────────────────────────────────────────────

function AllMembershipsTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ status: "", expiresAt: "", notes: "" });

  const load = useCallback(() => {
    setLoading(true);
    adminFetch("/api/admin/memberships").then(setRows).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const save = async (id: number) => {
    try {
      await adminFetch(`/api/admin/memberships/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status: editForm.status || undefined, expiresAt: editForm.expiresAt || undefined, notes: editForm.notes || undefined }),
      });
      toast({ title: "✅ Yeniləndi" });
      setEditing(null);
      load();
    } catch { toast({ title: "Xəta", variant: "destructive" }); }
  };

  if (loading) return <div className="py-8 text-center text-indigo-400 text-sm">Yüklənir...</div>;
  if (!rows.length) return <div className="py-8 text-center text-indigo-400 text-sm">Üzvlük yoxdur.</div>;

  return (
    <div className="space-y-3">
      {rows.map(r => (
        <div key={r.id} className="bg-white border border-indigo-50 rounded-2xl p-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="font-bold text-indigo-950 text-sm">{r.packageName}</div>
              <div className="text-xs text-indigo-400 mt-0.5">userId: {r.userId.slice(0, 8)}...</div>
              <div className="text-xs text-indigo-500 mt-1">
                Başlandı: {fmt(r.activatedAt)} · Bitir: {fmt(r.expiresAt)} · {r.activatedBy && `Aktiv edən: ${r.activatedBy}`}
              </div>
            </div>
            <Chip label={MEM_STATUS_LABELS[r.status] ?? r.status} color={MEM_STATUS_COLORS[r.status] ?? "bg-slate-100 text-slate-600"} />
          </div>
          {editing === r.id ? (
            <div className="mt-3 space-y-2 border-t border-indigo-50 pt-3">
              <Select value={editForm.status} onValueChange={v => setEditForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="rounded-xl border-indigo-100 text-sm h-9"><SelectValue placeholder="Status seç" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(MEM_STATUS_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input type="datetime-local" value={editForm.expiresAt} onChange={e => setEditForm(f => ({ ...f, expiresAt: e.target.value }))} className="rounded-xl border-indigo-100 text-sm" />
              <Textarea value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))} placeholder="Qeyd..." className="rounded-xl border-indigo-100 text-sm min-h-[60px]" />
              <div className="flex gap-2">
                <Button size="sm" className="rounded-xl" onClick={() => save(r.id)}>Saxla</Button>
                <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>Ləğv</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="mt-2 rounded-xl text-xs border-indigo-100" onClick={() => { setEditing(r.id); setEditForm({ status: r.status, expiresAt: r.expiresAt ? new Date(r.expiresAt).toISOString().slice(0, 16) : "", notes: r.notes ?? "" }); }}>
              Redaktə
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function MembershipsTab() {
  const [widgets, setWidgets] = useState<any | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadWidgets = useCallback(() => {
    adminFetch("/api/admin/memberships/widgets").then(setWidgets).catch(() => {});
  }, []);

  useEffect(loadWidgets, [loadWidgets, refreshKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-indigo-950">👑 Üzvlük İdarəetməsi</h2>
        <Button variant="outline" size="sm" className="rounded-xl gap-1.5" onClick={() => setRefreshKey(k => k + 1)}>
          <RefreshCw className="h-3.5 w-3.5" />Yenilə
        </Button>
      </div>
      {widgets && <WidgetBar widgets={widgets} />}
      <Tabs defaultValue="requests">
        <div className="mb-4 bg-indigo-50/50 border border-indigo-100 rounded-xl p-1">
          <TabsList className="flex gap-0.5 h-auto bg-transparent w-full">
            {[
              { value: "requests", label: "📬 Müraciətlər" },
              { value: "activate", label: "✅ Aktivləşdir" },
              { value: "all", label: "📋 Bütün Üzvlüklər" },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value} className="rounded-lg text-xs font-semibold whitespace-nowrap px-3 py-1.5 flex-1">{t.label}</TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="requests"><RequestsTab /></TabsContent>
        <TabsContent value="activate"><ActivateTab onDone={() => setRefreshKey(k => k + 1)} /></TabsContent>
        <TabsContent value="all"><AllMembershipsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
