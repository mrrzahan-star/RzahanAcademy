import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "../utils";
import {
  Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp,
  Copy, Eye, EyeOff, Archive, Search, Layers, BookOpen,
  ArrowLeft, GraduationCap
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Program {
  id: number; title: string; slug: string; description?: string;
  fullDescription?: string; coverImageUrl?: string; bannerImageUrl?: string;
  iconUrl?: string; categoryId?: number; packageId?: number;
  difficulty?: string; instructor?: string; language?: string;
  certificateAvailable?: boolean; featured?: boolean;
  status: string; sortOrder: number; durationHours?: number;
  seoTitle?: string; seoDescription?: string;
}

interface Module {
  id: number; programId: number; title: string; description?: string;
  coverImageUrl?: string; estimatedDurationMinutes?: number;
  sortOrder: number; isActive: boolean;
}

interface Lesson {
  id: number; moduleId: number; title: string; subtitle?: string;
  description?: string; contentHtml?: string; youtubeUrl?: string;
  audioUrl?: string; pdfUrl?: string; thumbnailUrl?: string;
  externalResourcesUrl?: string; homework?: string;
  reflectionQuestions?: string; notes?: string;
  durationMinutes?: number; readingTimeMinutes?: number;
  packageId?: number; freePreview?: boolean; status: string; sortOrder: number;
}

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-500",
};
const STATUS_OPTS = ["draft", "published", "archived"];
const DIFFICULTY_OPTS = ["baslanqic", "orta", "peshkar"];
const DIFFICULTY_LABEL: Record<string, string> = { baslanqic: "Başlanğıc", orta: "Orta", peshkar: "Peşəkar" };

// ─────────────────────────────────────────────────────────────────────────────
// Generic field renderer for modal forms
// ─────────────────────────────────────────────────────────────────────────────

type FieldSpec = {
  key: string; label: string;
  type?: "text" | "textarea" | "url" | "number" | "boolean" | "select";
  options?: string[]; placeholder?: string; required?: boolean;
};

function FieldInput({ spec, value, onChange }: {
  spec: FieldSpec;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const cls = "mt-1 w-full rounded-xl border border-indigo-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  if (spec.type === "textarea")
    return <textarea className={cls + " min-h-[80px] resize-y"} value={String(value ?? "")} onChange={e => onChange(e.target.value)} placeholder={spec.placeholder} />;
  if (spec.type === "boolean")
    return (
      <select className={cls} value={String(value ?? "false")} onChange={e => onChange(e.target.value === "true")}>
        <option value="true">Bəli</option><option value="false">Xeyr</option>
      </select>
    );
  if (spec.type === "select" || spec.options)
    return (
      <select className={cls} value={String(value ?? "")} onChange={e => onChange(e.target.value)}>
        {spec.options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  return (
    <input
      type={spec.type === "number" ? "number" : spec.type === "url" ? "url" : "text"}
      className={cls}
      value={String(value ?? "")}
      onChange={e => onChange(spec.type === "number" ? Number(e.target.value) : e.target.value)}
      placeholder={spec.placeholder}
    />
  );
}

function Modal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-50">
          <h3 className="font-bold text-indigo-950">{title}</h3>
          <button onClick={onClose} className="text-indigo-400 hover:text-indigo-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">{children}</div>
        <div className="px-6 py-4 border-t border-indigo-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Ləğv et</Button>
          <Button onClick={onSave} disabled={saving} className="rounded-xl">{saving ? "Saxlanır..." : "Saxla"}</Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lessons Manager (inside module)
// ─────────────────────────────────────────────────────────────────────────────

const LESSON_FIELDS: FieldSpec[] = [
  { key: "title", label: "Başlıq", required: true },
  { key: "subtitle", label: "Alt başlıq", placeholder: "Qısa izah" },
  { key: "description", label: "Qısa açıqlama", type: "textarea" },
  { key: "contentHtml", label: "Məzmun (HTML/Mətn)", type: "textarea" },
  { key: "youtubeUrl", label: "YouTube URL", type: "url", placeholder: "https://youtube.com/watch?v=..." },
  { key: "audioUrl", label: "Audio URL", type: "url" },
  { key: "pdfUrl", label: "PDF URL", type: "url" },
  { key: "thumbnailUrl", label: "Thumbnail URL", type: "url" },
  { key: "externalResourcesUrl", label: "Xarici Resurslar URL", type: "url" },
  { key: "homework", label: "Ev tapşırığı", type: "textarea" },
  { key: "reflectionQuestions", label: "Düşündürücü suallar", type: "textarea" },
  { key: "notes", label: "Qeydlər", type: "textarea" },
  { key: "durationMinutes", label: "Video müddəti (dəq.)", type: "number" },
  { key: "readingTimeMinutes", label: "Oxuma müddəti (dəq.)", type: "number" },
  { key: "freePreview", label: "Pulsuz önizləmə?", type: "boolean" },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTS },
  { key: "sortOrder", label: "Sıra", type: "number" },
];

function LessonsRow({ moduleId, search }: { moduleId: number; search: string }) {
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Lesson | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(() => {
    adminFetch(`/api/admin/cms/lessons?moduleId=${moduleId}&limit=200`)
      .then((d: any) => setLessons((d.data || []).filter((l: Lesson) => l.moduleId === moduleId)))
      .catch(() => {});
  }, [moduleId]);
  useEffect(() => { load(); }, [load]);

  const filtered = search ? lessons.filter(l => l.title.toLowerCase().includes(search.toLowerCase())) : lessons;

  const openAdd = () => { setForm({ moduleId, status: "draft", sortOrder: 0, freePreview: false }); setModal({ open: true, editing: null }); };
  const openEdit = (l: Lesson) => { setForm({ ...l }); setModal({ open: true, editing: l }); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal.editing) {
        await adminFetch(`/api/admin/cms/lessons/${modal.editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast({ title: "Dərs yeniləndi" });
      } else {
        await adminFetch("/api/admin/cms/lessons", { method: "POST", body: JSON.stringify(form) });
        toast({ title: "Dərs əlavə edildi" });
      }
      setModal({ open: false, editing: null });
      load();
    } catch { toast({ title: "Xəta", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Bu dərsi silmək istəyirsiniz?")) return;
    setDeleting(id);
    try {
      await adminFetch(`/api/admin/cms/lessons/${id}`, { method: "DELETE" });
      toast({ title: "Dərs silindi" });
      load();
    } catch { toast({ title: "Xəta", variant: "destructive" }); }
    finally { setDeleting(null); }
  };

  const toggleStatus = async (lesson: Lesson) => {
    const next = lesson.status === "published" ? "draft" : "published";
    await adminFetch(`/api/admin/cms/lessons/${lesson.id}`, { method: "PUT", body: JSON.stringify({ status: next }) });
    load();
  };

  return (
    <div className="pl-4 pb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">Dərslər ({filtered.length})</span>
        <Button size="sm" variant="outline" onClick={openAdd} className="h-7 text-xs rounded-lg px-2">
          <Plus className="h-3 w-3 mr-1" />Dərs əlavə et
        </Button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-xs text-indigo-300 py-2 pl-2">Hələ dərs yoxdur</p>
      ) : (
        <div className="space-y-1">
          {filtered.map((l) => (
            <div key={l.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50/40 hover:bg-indigo-50 group">
              <BookOpen className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
              <span className="flex-1 text-sm text-indigo-800 truncate">{l.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${STATUS_COLORS[l.status] || ""}`}>{l.status}</span>
              <div className="hidden group-hover:flex items-center gap-1">
                <button onClick={() => toggleStatus(l)} className="text-indigo-400 hover:text-indigo-600 p-1 rounded" title={l.status === "published" ? "Gizlə" : "Yayımla"}>
                  {l.status === "published" ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button onClick={() => openEdit(l)} className="text-indigo-400 hover:text-indigo-600 p-1 rounded"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => del(l.id)} disabled={deleting === l.id} className="text-red-400 hover:text-red-600 p-1 rounded"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {modal.open && (
        <Modal title={modal.editing ? "Dərsi düzəliş et" : "Yeni Dərs"} onClose={() => setModal({ open: false, editing: null })} onSave={save} saving={saving}>
          {LESSON_FIELDS.map(spec => (
            <div key={spec.key}>
              <Label className="text-xs font-semibold text-indigo-600">{spec.label}{spec.required && " *"}</Label>
              <FieldInput spec={spec} value={form[spec.key]} onChange={v => setForm(prev => ({ ...prev, [spec.key]: v }))} />
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Modules Manager (inside program)
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_FIELDS: FieldSpec[] = [
  { key: "title", label: "Başlıq", required: true },
  { key: "description", label: "Açıqlama", type: "textarea" },
  { key: "coverImageUrl", label: "Kapak Şəkil URL", type: "url" },
  { key: "estimatedDurationMinutes", label: "Təxmini müddət (dəq.)", type: "number" },
  { key: "isActive", label: "Aktiv?", type: "boolean" },
  { key: "sortOrder", label: "Sıra", type: "number" },
];

function ModulesPanel({ program, onBack, globalSearch }: { program: Program; onBack: () => void; globalSearch: string }) {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [modal, setModal] = useState<{ open: boolean; editing: Module | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState(globalSearch);

  const load = useCallback(() => {
    adminFetch(`/api/admin/cms/modules?programId=${program.id}&limit=200`)
      .then((d: any) => setModules((d.data || []).filter((m: Module) => m.programId === program.id)))
      .catch(() => {});
  }, [program.id]);
  useEffect(() => { load(); }, [load]);

  const filtered = search ? modules.filter(m => m.title.toLowerCase().includes(search.toLowerCase())) : modules;
  const toggle = (id: number) => setExpanded(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const openAdd = () => { setForm({ programId: program.id, isActive: true, sortOrder: 0 }); setModal({ open: true, editing: null }); };
  const openEdit = (m: Module) => { setForm({ ...m }); setModal({ open: true, editing: m }); };

  const save = async () => {
    setSaving(true);
    try {
      if (modal.editing) {
        await adminFetch(`/api/admin/cms/modules/${modal.editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast({ title: "Modul yeniləndi" });
      } else {
        await adminFetch("/api/admin/cms/modules", { method: "POST", body: JSON.stringify(form) });
        toast({ title: "Modul əlavə edildi" });
      }
      setModal({ open: false, editing: null }); load();
    } catch { toast({ title: "Xəta", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const del = async (id: number) => {
    if (!confirm("Bu modulu (və bütün dərslərini) silmək istəyirsiniz?")) return;
    await adminFetch(`/api/admin/cms/modules/${id}`, { method: "DELETE" });
    toast({ title: "Modul silindi" }); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-indigo-500 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />Proqramlara qayıt
        </button>
        <span className="text-indigo-300">/</span>
        <span className="font-bold text-indigo-950">{program.title}</span>
        <Badge className={`text-xs ml-auto ${STATUS_COLORS[program.status]}`}>{program.status}</Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <input className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Modul axtar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} size="sm" className="rounded-xl">
          <Plus className="h-4 w-4 mr-1" />Modul əlavə et
        </Button>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-indigo-400">
          <Layers className="h-10 w-10 mx-auto mb-2 text-indigo-200" />
          <p className="text-sm">Bu proqramda modul yoxdur</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((mod) => {
          const open = expanded.has(mod.id);
          return (
            <div key={mod.id} className="rounded-2xl border border-indigo-100 bg-white overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3">
                <Layers className="h-4 w-4 text-indigo-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-indigo-950 truncate">{mod.title}</p>
                  {mod.description && <p className="text-xs text-indigo-400 truncate">{mod.description}</p>}
                </div>
                <span className="text-xs text-indigo-400">Sıra: {mod.sortOrder}</span>
                {!mod.isActive && <Badge className="bg-gray-100 text-gray-500 text-xs">Gizli</Badge>}
                <button onClick={() => openEdit(mod)} className="text-indigo-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50"><Pencil className="h-3.5 w-3.5" /></button>
                <button onClick={() => del(mod.id)} className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                <button onClick={() => toggle(mod.id)} className="text-indigo-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-indigo-50">
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
              {open && (
                <div className="border-t border-indigo-50">
                  <LessonsRow moduleId={mod.id} search={search} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal.open && (
        <Modal title={modal.editing ? "Modulu düzəliş et" : "Yeni Modul"} onClose={() => setModal({ open: false, editing: null })} onSave={save} saving={saving}>
          {MODULE_FIELDS.map(spec => (
            <div key={spec.key}>
              <Label className="text-xs font-semibold text-indigo-600">{spec.label}{spec.required && " *"}</Label>
              <FieldInput spec={spec} value={form[spec.key]} onChange={v => setForm(prev => ({ ...prev, [spec.key]: v }))} />
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Programs List
// ─────────────────────────────────────────────────────────────────────────────

const PROGRAM_FIELDS: FieldSpec[] = [
  { key: "title", label: "Başlıq", required: true },
  { key: "slug", label: "Slug (boş buraxın = avtomatik)", placeholder: "misal-proqram" },
  { key: "description", label: "Qısa açıqlama", type: "textarea" },
  { key: "fullDescription", label: "Tam açıqlama", type: "textarea" },
  { key: "coverImageUrl", label: "Kapak Şəkil URL", type: "url" },
  { key: "bannerImageUrl", label: "Banner Şəkil URL", type: "url" },
  { key: "iconUrl", label: "İkon URL", type: "url" },
  { key: "difficulty", label: "Çətinlik", type: "select", options: DIFFICULTY_OPTS },
  { key: "instructor", label: "Müəllim", placeholder: "Rzahan" },
  { key: "language", label: "Dil", placeholder: "Azərbaycan" },
  { key: "durationHours", label: "Müddət (saat)", type: "number" },
  { key: "certificateAvailable", label: "Sertifikat varmı?", type: "boolean" },
  { key: "featured", label: "Seçilmiş (Featured)?", type: "boolean" },
  { key: "status", label: "Status", type: "select", options: STATUS_OPTS },
  { key: "sortOrder", label: "Sıra", type: "number" },
  { key: "seoTitle", label: "SEO Başlıq" },
  { key: "seoDescription", label: "SEO Açıqlama", type: "textarea" },
];

const PROGRAM_DEFAULTS: Record<string, unknown> = {
  status: "draft", sortOrder: 0, difficulty: "baslanqic",
  instructor: "Rzahan", language: "Azərbaycan",
  certificateAvailable: false, featured: false,
};

export function ProgramsManager() {
  const { toast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [modal, setModal] = useState<{ open: boolean; editing: Program | null }>({ open: false, editing: null });
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [duplicating, setDuplicating] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminFetch("/api/admin/cms/programs?limit=200")
      .then((d: any) => setPrograms(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = programs.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchQ && matchStatus;
  });

  const openAdd = () => { setForm({ ...PROGRAM_DEFAULTS }); setModal({ open: true, editing: null }); };
  const openEdit = (p: Program) => { setForm({ ...p }); setModal({ open: true, editing: p }); };

  const save = async () => {
    if (!form.title) { toast({ title: "Başlıq tələb olunur", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (modal.editing) {
        await adminFetch(`/api/admin/cms/programs/${modal.editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        toast({ title: "Proqram yeniləndi ✓" });
      } else {
        await adminFetch("/api/admin/cms/programs", { method: "POST", body: JSON.stringify(form) });
        toast({ title: "Proqram yaradıldı ✓" });
      }
      setModal({ open: false, editing: null }); load();
    } catch { toast({ title: "Xəta baş verdi", variant: "destructive" }); }
    finally { setSaving(false); }
  };

  const del = async (p: Program) => {
    if (!confirm(`"${p.title}" proqramını silmək istəyirsiniz? Bu əməliyyat geri alına bilməz.`)) return;
    await adminFetch(`/api/admin/cms/programs/${p.id}`, { method: "DELETE" });
    toast({ title: "Proqram silindi" }); load();
  };

  const setStatus = async (p: Program, status: string) => {
    await adminFetch(`/api/admin/cms/programs/${p.id}`, { method: "PUT", body: JSON.stringify({ status }) });
    toast({ title: status === "published" ? "Yayımlandı ✓" : status === "archived" ? "Arxivləndi" : "Qaralama" }); load();
  };

  const duplicate = async (p: Program) => {
    setDuplicating(p.id);
    try {
      const newTitle = `${p.title} (Kopya)`;
      const slug = `${p.slug}-copy-${Date.now()}`;
      await adminFetch("/api/admin/cms/programs", {
        method: "POST",
        body: JSON.stringify({ ...p, id: undefined, title: newTitle, slug, status: "draft", createdAt: undefined, updatedAt: undefined }),
      });
      toast({ title: "Proqram kopyalandı ✓" }); load();
    } catch { toast({ title: "Xəta", variant: "destructive" }); }
    finally { setDuplicating(null); }
  };

  if (selectedProgram) {
    return (
      <ModulesPanel
        program={selectedProgram}
        onBack={() => setSelectedProgram(null)}
        globalSearch={search}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <input className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Proqram axtar..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {["all", "draft", "published", "archived"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${statusFilter === s ? "bg-primary text-white" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"}`}>
              {s === "all" ? "Hamısı" : s === "draft" ? "Qaralama" : s === "published" ? "Yayımlanmış" : "Arxiv"}
            </button>
          ))}
        </div>
        <Button onClick={openAdd} className="rounded-xl ml-auto shrink-0">
          <Plus className="h-4 w-4 mr-2" />Yeni Proqram
        </Button>
      </div>

      {/* Program list */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin h-6 w-6 rounded-full border-2 border-primary border-t-transparent" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="h-12 w-12 mx-auto text-indigo-200 mb-3" />
          <p className="text-indigo-400 text-sm">{programs.length === 0 ? "Hələ proqram yoxdur. Yeni Proqram düyməsindən başlayın." : "Axtarışa uyğun proqram tapılmadı."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="rounded-2xl border border-indigo-100 bg-white p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm hover:shadow-md transition-shadow">
              {p.coverImageUrl ? (
                <img src={p.coverImageUrl} alt={p.title} className="w-16 h-12 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-16 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-6 w-6 text-indigo-300" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-indigo-950">{p.title}</h3>
                  <Badge className={`text-xs ${STATUS_COLORS[p.status]}`}>{p.status}</Badge>
                  {p.featured && <Badge className="text-xs bg-amber-100 text-amber-700">⭐ Featured</Badge>}
                  {p.difficulty && <Badge className="text-xs bg-indigo-50 text-indigo-600">{DIFFICULTY_LABEL[p.difficulty] || p.difficulty}</Badge>}
                </div>
                <p className="text-xs text-indigo-400 mt-0.5 truncate">/{p.slug}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedProgram(p)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                >
                  <Layers className="h-3.5 w-3.5" />Modullar
                </button>
                {p.status !== "published" && (
                  <button onClick={() => setStatus(p, "published")} className="text-xs px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 font-semibold transition-colors flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />Yayımla
                  </button>
                )}
                {p.status === "published" && (
                  <button onClick={() => setStatus(p, "draft")} className="text-xs px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold transition-colors flex items-center gap-1">
                    <EyeOff className="h-3.5 w-3.5" />Gizlət
                  </button>
                )}
                {p.status !== "archived" && (
                  <button onClick={() => setStatus(p, "archived")} className="text-xs px-3 py-1.5 rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-100 font-semibold transition-colors flex items-center gap-1">
                    <Archive className="h-3.5 w-3.5" />Arxiv
                  </button>
                )}
                <button onClick={() => duplicate(p)} disabled={duplicating === p.id} className="text-xs px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 font-semibold transition-colors flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5" />{duplicating === p.id ? "..." : "Kopya"}
                </button>
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(p)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {modal.open && (
        <Modal
          title={modal.editing ? `Proqramu düzəliş et: ${modal.editing.title}` : "Yeni Proqram Yarat"}
          onClose={() => setModal({ open: false, editing: null })}
          onSave={save}
          saving={saving}
        >
          {PROGRAM_FIELDS.map(spec => (
            <div key={spec.key}>
              <Label className="text-xs font-semibold text-indigo-600">{spec.label}{spec.required && " *"}</Label>
              <FieldInput spec={spec} value={form[spec.key]} onChange={v => setForm(prev => ({ ...prev, [spec.key]: v }))} />
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
