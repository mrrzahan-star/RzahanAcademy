import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit2, Trash2, BookOpen, Calendar, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getToken } from "@/lib/api";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  category: string;
  mood?: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["ümumi", "refleksiya", "meditasiya", "hədəf", "minnətdarlıq", "müşahidə"];
const MOODS = ["", "Xoşbəxt", "Sakit", "Düşüncəli", "Həvəsli", "Yorğun", "Narahat"];

async function apiFetch(url: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "ümumi", mood: "" });
  const { toast } = useToast();

  const loadEntries = useCallback(async () => {
    try {
      const data = await apiFetch("/api/journal");
      setEntries(data || []);
    } catch {
      toast({ title: "Xəta", description: "Qeydlər yüklənmədi", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  function openNew() {
    setEditing(null);
    setForm({ title: "", content: "", category: "ümumi", mood: "" });
    setDialogOpen(true);
  }

  function openEdit(entry: JournalEntry) {
    setEditing(entry);
    setForm({ title: entry.title, content: entry.content, category: entry.category, mood: entry.mood || "" });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Başlıq və mətn tələb olunur", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const body = { title: form.title, content: form.content, category: form.category, mood: form.mood || undefined };
      if (editing) {
        const updated = await apiFetch(`/api/journal/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
        setEntries((prev) => prev.map((e) => (e.id === editing.id ? updated : e)));
        toast({ title: "Qeyd yeniləndi" });
      } else {
        const created = await apiFetch("/api/journal", { method: "POST", body: JSON.stringify(body) });
        setEntries((prev) => [created, ...prev]);
        toast({ title: "Qeyd əlavə edildi" });
      }
      setDialogOpen(false);
    } catch {
      toast({ title: "Xəta baş verdi", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiFetch(`/api/journal/${id}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Qeyd silindi" });
    } catch {
      toast({ title: "Silinmə xətası", variant: "destructive" });
    }
    setDeleteId(null);
  }

  const filtered = entries.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.content.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === "all" || e.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-950">Şüur Jurnalı</h1>
          <p className="text-indigo-900/60 mt-1">Öz düşüncə və hisslərini qeyd et</p>
        </div>
        <Button onClick={openNew} className="rounded-xl bg-primary text-white font-bold shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Yeni Qeyd
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <Input
            placeholder="Qeydlərdə axtar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl border-indigo-100"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl border-indigo-100">
            <SelectValue placeholder="Kateqoriya" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Hamısı</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-indigo-50 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        search || categoryFilter !== "all" ? (
          <Card className="rounded-[2rem] border-dashed border-2 border-indigo-100 bg-slate-50/50 shadow-none">
            <CardContent className="p-16 text-center">
              <Search className="h-10 w-10 mx-auto text-indigo-200 mb-4" />
              <h3 className="text-lg font-bold text-indigo-950 mb-1">Nəticə tapılmadı</h3>
              <p className="text-indigo-900/50 text-sm">Axtarış şərtlərini dəyişin və ya kateqoriyanı sıfırlayın</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card className="rounded-[2rem] border-dashed border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white shadow-none">
              <CardContent className="p-12 md:p-20 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
                  <BookOpen className="h-10 w-10 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-indigo-950 mb-3">Şüur Jurnalınız Boşdur</h3>
                <p className="text-indigo-900/60 max-w-sm mx-auto mb-3 leading-relaxed">
                  Gündəlik düşüncələrinizi, hissləriniizi və inkişafınızı qeydə almaq şüurunuzun güzgüsüdür.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto mb-8 text-sm text-indigo-700/70">
                  {[
                    { icon: "✍️", text: "Hər gün bir qeyd" },
                    { icon: "💡", text: "Refleksiya et" },
                    { icon: "📈", text: "İnkişafını izlə" },
                  ].map((tip) => (
                    <div key={tip.text} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white border border-indigo-100">
                      <span className="text-xl">{tip.icon}</span>
                      <span className="font-medium text-xs">{tip.text}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={openNew} className="rounded-xl bg-primary text-white font-bold px-8 h-11 shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all">
                  <Sparkles className="mr-2 h-4 w-4" /> İlk Qeydi Yaz
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filtered.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
              >
                <Card className="rounded-2xl border border-indigo-50 shadow-none hover:shadow-[0_4px_20px_rgba(91,95,239,0.06)] hover:border-indigo-100 transition-all">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 capitalize">
                            {entry.category}
                          </span>
                          {entry.mood && (
                            <span className="text-xs text-indigo-400">{entry.mood}</span>
                          )}
                        </div>
                        <h3 className="font-bold text-indigo-950 mb-1 truncate">{entry.title}</h3>
                        <p className="text-sm text-indigo-900/60 line-clamp-2">{entry.content}</p>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.createdAt).toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" })}
                          {entry.updatedAt !== entry.createdAt && <span className="text-indigo-300">(yeniləndi)</span>}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => openEdit(entry)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(entry.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-3xl border-indigo-100 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-indigo-950 text-xl font-bold">
              {editing ? "Qeydi Redaktə Et" : "Yeni Qeyd"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Başlıq"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="rounded-xl border-indigo-100 font-medium"
            />
            <div className="flex gap-3">
              <Select value={form.category} onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}>
                <SelectTrigger className="rounded-xl border-indigo-100 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.mood} onValueChange={(v) => setForm((p) => ({ ...p, mood: v }))}>
                <SelectTrigger className="rounded-xl border-indigo-100 flex-1">
                  <SelectValue placeholder="Əhval (könüllü)" />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((m) => <SelectItem key={m || "_none"} value={m}>{m || "—"}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Qeydinizi yazın..."
              value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
              className="rounded-xl border-indigo-100 min-h-[140px] resize-none"
            />
          </div>
          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl border-indigo-200">
              Ləğv et
            </Button>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary text-white font-bold">
              {saving ? "Saxlanılır..." : editing ? "Yadda Saxla" : "Əlavə et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-3xl border-indigo-100 max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-indigo-950 text-xl font-bold">Qeydi Sil?</DialogTitle>
          </DialogHeader>
          <p className="text-indigo-900/60 py-2">Bu əməliyyat geri alına bilməz.</p>
          <DialogFooter className="justify-center gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="rounded-xl border-indigo-200">
              Ləğv et
            </Button>
            <Button onClick={() => deleteId && handleDelete(deleteId)} className="rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold">
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
