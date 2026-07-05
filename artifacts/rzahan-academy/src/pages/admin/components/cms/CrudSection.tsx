import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "../utils";
import { Plus, Pencil, Trash2, X, Check, ChevronLeft, ChevronRight } from "lucide-react";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "url" | "number" | "boolean" | "select" | "status";
  options?: string[];
  placeholder?: string;
  required?: boolean;
};

export type ColumnDef = {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
};

interface Props {
  title: string;
  endpoint: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  defaultValues?: Record<string, unknown>;
  pageSize?: number;
}

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-amber-100 text-amber-700",
  archived: "bg-gray-100 text-gray-500",
};

export function CrudSection({ title, endpoint, columns, fields, defaultValues = {}, pageSize = 20 }: Props) {
  const { toast } = useToast();
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch(`/api/admin/cms${endpoint}?page=${page}&limit=${pageSize}`);
      setRows(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (e: any) {
      toast({ title: "Yüklənmə xətası", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [endpoint, page, pageSize, toast]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    setForm({ ...defaultValues });
    setModalOpen(true);
  }

  function openEdit(row: any) {
    setEditing(row);
    const f: Record<string, unknown> = {};
    fields.forEach(fd => { f[fd.key] = row[fd.key] ?? defaultValues[fd.key] ?? ""; });
    setForm(f);
    setModalOpen(true);
  }

  function closeModal() { setModalOpen(false); setEditing(null); setForm({}); }

  async function handleSave() {
    setSaving(true);
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `/api/admin/cms${endpoint}/${editing.id}` : `/api/admin/cms${endpoint}`;
      await adminFetch(url, { method, body: JSON.stringify(form) });
      toast({ title: editing ? "Yeniləndi" : "Əlavə edildi" });
      closeModal();
      await load();
    } catch (e: any) {
      toast({ title: "Xəta", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Silmək istəyirsiniz?")) return;
    setDeleting(id);
    try {
      await adminFetch(`/api/admin/cms${endpoint}/${id}`, { method: "DELETE" });
      toast({ title: "Silindi" });
      await load();
    } catch (e: any) {
      toast({ title: "Xəta", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function renderCell(row: any, col: ColumnDef) {
    if (col.render) return col.render(row);
    const val = row[col.key];
    if (typeof val === "boolean") return val
      ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-medium"><Check className="h-3 w-3" /> Bəli</span>
      : <span className="text-gray-400 text-xs">Xeyr</span>;
    if (col.key === "status") return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[val] ?? "bg-gray-100 text-gray-500"}`}>
        {val === "published" ? "Yayımlandı" : val === "draft" ? "Qaralama" : val === "archived" ? "Arxivləndi" : val}
      </span>
    );
    if (val === null || val === undefined || val === "") return <span className="text-gray-300 text-xs">—</span>;
    const str = String(val);
    return str.length > 60 ? str.slice(0, 60) + "…" : str;
  }

  function renderField(fd: FieldDef) {
    const val = form[fd.key] ?? "";
    const set = (v: unknown) => setForm(prev => ({ ...prev, [fd.key]: v }));

    if (fd.type === "textarea") return (
      <textarea rows={4} value={String(val)} onChange={e => set(e.target.value)}
        placeholder={fd.placeholder}
        className="w-full rounded-xl border border-indigo-100 px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-indigo-200" />
    );
    if (fd.type === "boolean") return (
      <div className="flex gap-3">
        {[true, false].map(b => (
          <button key={String(b)} type="button" onClick={() => set(b)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${val === b ? "bg-indigo-600 text-white border-indigo-600" : "border-indigo-100 text-indigo-700 hover:border-indigo-300"}`}>
            {b ? "Bəli" : "Xeyr"}
          </button>
        ))}
      </div>
    );
    if (fd.type === "status") return (
      <div className="flex gap-2 flex-wrap">
        {(fd.options ?? ["draft", "published", "archived"]).map(opt => (
          <button key={opt} type="button" onClick={() => set(opt)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-colors ${val === opt ? "bg-indigo-600 text-white border-indigo-600" : "border-indigo-100 text-indigo-700 hover:border-indigo-300"}`}>
            {opt === "published" ? "Yayımla" : opt === "draft" ? "Qaralama" : opt === "archived" ? "Arxiv" : opt}
          </button>
        ))}
      </div>
    );
    if (fd.type === "select") return (
      <select value={String(val)} onChange={e => set(e.target.value)}
        className="w-full rounded-xl border border-indigo-100 px-3 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
        <option value="">— Seçin —</option>
        {(fd.options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
    return (
      <Input type={fd.type === "url" ? "url" : fd.type === "number" ? "number" : "text"}
        value={String(val)} onChange={e => set(fd.type === "number" ? Number(e.target.value) : e.target.value)}
        placeholder={fd.placeholder}
        className="rounded-xl h-10 border-indigo-100" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-indigo-950 text-base">{title}</h3>
          <p className="text-xs text-indigo-400 mt-0.5">{total} qeyd</p>
        </div>
        <Button size="sm" onClick={openCreate}
          className="rounded-xl gap-1.5 h-8 text-xs font-semibold shadow-sm">
          <Plus className="h-3.5 w-3.5" /> Əlavə et
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-indigo-50 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400" /></div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-indigo-300 text-sm">Hələ heç bir qeyd yoxdur</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-indigo-50/60 border-b border-indigo-50">
                {columns.map(c => <th key={c.key} className="text-left px-4 py-2.5 text-xs font-bold text-indigo-600 uppercase tracking-wide">{c.label}</th>)}
                <th className="px-4 py-2.5 text-xs font-bold text-indigo-600 uppercase tracking-wide text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id} className={`border-b border-indigo-50 last:border-0 hover:bg-indigo-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-indigo-50/10"}`}>
                  {columns.map(c => (
                    <td key={c.key} className="px-4 py-3 text-indigo-900">{renderCell(row, c)}</td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <button onClick={() => openEdit(row)}
                        className="p-1.5 rounded-lg hover:bg-indigo-100 text-indigo-500 hover:text-indigo-700 transition-colors">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(row.id)} disabled={deleting === row.id}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-indigo-500">
          <span>Səhifə {page} / {totalPages}</span>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg hover:bg-indigo-50 disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-indigo-50 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h3 className="font-bold text-indigo-950">{editing ? "Düzəliş" : "Yeni " + title}</h3>
              <button onClick={closeModal} className="p-1.5 rounded-xl hover:bg-indigo-50 text-indigo-400">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {fields.map(fd => (
                <div key={fd.key}>
                  <Label className="text-xs font-bold text-indigo-800 mb-1.5 block">
                    {fd.label}{fd.required && <span className="text-red-400 ml-0.5">*</span>}
                  </Label>
                  {renderField(fd)}
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-indigo-50 flex gap-3 sticky bottom-0 bg-white rounded-b-3xl">
              <Button variant="outline" onClick={closeModal} className="flex-1 rounded-xl border-indigo-100 text-indigo-700">Ləğv et</Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1 rounded-xl font-bold">
                {saving ? "Saxlanır..." : editing ? "Yadda saxla" : "Əlavə et"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
