import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "./utils";
import {
  Zap, Trophy, Star, BarChart3, Plus, Pencil, Trash2, Save, X, RotateCcw
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface XpRule {
  id: number; actionType: string; label: string;
  xpAmount: number; isActive: boolean;
}

interface Level {
  id: number; name: string; description: string | null;
  requiredXp: number; emoji: string | null; color: string | null;
  sortOrder: number; isActive: boolean;
}

interface AchievementDef {
  id: number; name: string; description: string | null;
  emoji: string | null; color: string | null; xpReward: number;
  triggerType: string; triggerValue: number; isActive: boolean; sortOrder: number;
}

interface DevScoreWeights {
  lessonMax: number; programMax: number; testMax: number; certMax: number;
  taskMax: number; articleMax: number; storyMax: number; streakMax: number;
}

const TRIGGER_LABELS: Record<string, string> = {
  xp_milestone: "XP hədd", lesson_count: "Dərs sayı", program_count: "Proqram sayı",
  test_count: "Test sayı", cert_count: "Sertifikat sayı", streak_days: "Ardıcıl gün",
  article_count: "Məqalə sayı", story_count: "Hekayə sayı", first_login: "İlk giriş",
};

// ── XP Rules Sub-tab ──────────────────────────────────────────────────────────

function XpRulesTab() {
  const { toast } = useToast();
  const [rules, setRules] = useState<XpRule[]>([]);
  const [editing, setEditing] = useState<Record<number, { xpAmount: number; isActive: boolean; label: string }>>({});

  useEffect(() => {
    adminFetch("/api/admin/dev-system/xp-rules").then(setRules).catch(() => {});
  }, []);

  async function save(id: number) {
    const e = editing[id];
    if (!e) return;
    try {
      const updated = await adminFetch(`/api/admin/dev-system/xp-rules/${id}`, {
        method: "PUT", body: JSON.stringify(e),
      });
      setRules(prev => prev.map(r => r.id === id ? updated : r));
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
      toast({ title: "Yeniləndi" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  return (
    <div>
      <h3 className="font-bold text-indigo-900 mb-4">XP Qaydaları</h3>
      <p className="text-sm text-indigo-900/60 mb-5">Hər fəaliyyət növü üçün qazanılan XP miqdarını idarə edin.</p>
      <div className="space-y-2">
        {rules.map(rule => {
          const e = editing[rule.id];
          return (
            <div key={rule.id} className="rounded-xl border border-indigo-100 bg-white px-4 py-3 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                {e ? (
                  <Input value={e.label} onChange={ev => setEditing(prev => ({ ...prev, [rule.id]: { ...prev[rule.id], label: ev.target.value } }))}
                    className="h-7 text-sm font-medium border-indigo-200 rounded-lg w-48" />
                ) : (
                  <p className="font-semibold text-indigo-900 text-sm">{rule.label}</p>
                )}
                <p className="text-xs text-indigo-400 mt-0.5 font-mono">{rule.actionType}</p>
              </div>
              <div className="flex items-center gap-3">
                {e ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Input type="number" min={0} max={9999}
                        value={e.xpAmount}
                        onChange={ev => setEditing(prev => ({ ...prev, [rule.id]: { ...prev[rule.id], xpAmount: parseInt(ev.target.value) || 0 } }))}
                        className="h-7 w-20 text-sm text-center border-indigo-200 rounded-lg" />
                      <span className="text-xs text-indigo-400">XP</span>
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={e.isActive}
                        onChange={ev => setEditing(prev => ({ ...prev, [rule.id]: { ...prev[rule.id], isActive: ev.target.checked } }))}
                        className="rounded" />
                      <span className="text-xs text-indigo-600">Aktiv</span>
                    </label>
                    <Button size="sm" onClick={() => save(rule.id)} className="h-7 rounded-lg gap-1 text-xs"><Save className="h-3 w-3" /> Saxla</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(prev => { const n = { ...prev }; delete n[rule.id]; return n; })}
                      className="h-7 rounded-lg text-xs"><X className="h-3 w-3" /></Button>
                  </>
                ) : (
                  <>
                    <Badge variant="secondary" className="text-xs font-bold bg-indigo-50 text-indigo-600 border-0">
                      <Zap className="h-3 w-3 mr-1" />{rule.xpAmount} XP
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${rule.isActive ? "border-green-200 text-green-700" : "border-gray-200 text-gray-400"}`}>
                      {rule.isActive ? "Aktiv" : "Deaktiv"}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(prev => ({ ...prev, [rule.id]: { xpAmount: rule.xpAmount, isActive: rule.isActive, label: rule.label } }))}
                      className="h-7 rounded-lg text-xs gap-1 text-indigo-600">
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Levels Sub-tab ────────────────────────────────────────────────────────────

function LevelsTab() {
  const { toast } = useToast();
  const [levels, setLevels] = useState<Level[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", requiredXp: 0, emoji: "⭐", color: "#6366f1", sortOrder: 0 });
  const [editing, setEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Level>>({});

  const load = useCallback(async () => {
    adminFetch("/api/admin/dev-system/levels").then(setLevels).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  async function createLevel() {
    try {
      await adminFetch("/api/admin/dev-system/levels", { method: "POST", body: JSON.stringify(form) });
      toast({ title: "Yaradıldı" }); setCreating(false);
      setForm({ name: "", description: "", requiredXp: 0, emoji: "⭐", color: "#6366f1", sortOrder: 0 });
      load();
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function updateLevel(id: number) {
    try {
      await adminFetch(`/api/admin/dev-system/levels/${id}`, { method: "PUT", body: JSON.stringify(editForm) });
      toast({ title: "Yeniləndi" }); setEditing(null); load();
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function deleteLevel(id: number) {
    if (!confirm("Bu səviyyəni silmək istəyirsiniz?")) return;
    try {
      await adminFetch(`/api/admin/dev-system/levels/${id}`, { method: "DELETE" });
      toast({ title: "Silindi" }); load();
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-indigo-900">Səviyyələr</h3>
        <Button size="sm" onClick={() => setCreating(v => !v)} className="rounded-xl gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Yeni Səviyyə
        </Button>
      </div>

      {creating && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Ad" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-lg text-sm" />
            <Input type="number" placeholder="Tələb olunan XP" value={form.requiredXp}
              onChange={e => setForm(p => ({ ...p, requiredXp: parseInt(e.target.value) || 0 }))} className="rounded-lg text-sm" />
          </div>
          <Input placeholder="Açıqlama" value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-lg text-sm" />
          <div className="flex gap-3">
            <Input placeholder="Emoji" value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} className="rounded-lg text-sm w-24" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-indigo-600">Rəng:</label>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-8 w-14 rounded cursor-pointer" />
            </div>
            <Input type="number" placeholder="Sıra" value={form.sortOrder}
              onChange={e => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className="rounded-lg text-sm w-24" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setCreating(false)} className="rounded-lg text-xs">Ləğv et</Button>
            <Button size="sm" onClick={createLevel} className="rounded-lg text-xs">Yarat</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {levels.map(level => (
          <div key={level.id} className="rounded-xl border border-indigo-100 bg-white p-4">
            {editing === level.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Ad" value={editForm.name ?? level.name}
                    onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="rounded-lg text-sm" />
                  <Input type="number" placeholder="Tələb olunan XP" value={editForm.requiredXp ?? level.requiredXp}
                    onChange={e => setEditForm(p => ({ ...p, requiredXp: parseInt(e.target.value) || 0 }))} className="rounded-lg text-sm" />
                </div>
                <Input placeholder="Açıqlama" value={editForm.description ?? level.description ?? ""}
                  onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="rounded-lg text-sm" />
                <div className="flex gap-3 flex-wrap">
                  <Input placeholder="Emoji" value={editForm.emoji ?? level.emoji ?? "⭐"}
                    onChange={e => setEditForm(p => ({ ...p, emoji: e.target.value }))} className="rounded-lg text-sm w-24" />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-indigo-600">Rəng:</label>
                    <input type="color" value={editForm.color ?? level.color ?? "#6366f1"}
                      onChange={e => setEditForm(p => ({ ...p, color: e.target.value }))} className="h-8 w-14 rounded cursor-pointer" />
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={editForm.isActive ?? level.isActive}
                      onChange={e => setEditForm(p => ({ ...p, isActive: e.target.checked }))} className="rounded" />
                    <span className="text-xs text-indigo-600">Aktiv</span>
                  </label>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setEditing(null)} className="rounded-lg text-xs">Ləğv et</Button>
                  <Button size="sm" onClick={() => updateLevel(level.id)} className="rounded-lg text-xs gap-1"><Save className="h-3 w-3" /> Saxla</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: (level.color ?? "#6366f1") + "20" }}>
                  {level.emoji ?? "⭐"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-indigo-900">{level.name}</p>
                  <p className="text-xs text-indigo-400">{level.description}</p>
                </div>
                <Badge variant="secondary" className="text-xs font-bold bg-amber-50 text-amber-600 border-0 shrink-0">
                  <Zap className="h-3 w-3 mr-1" />{level.requiredXp} XP
                </Badge>
                <Badge variant="outline" className={`text-xs shrink-0 ${level.isActive ? "border-green-200 text-green-700" : "border-gray-200 text-gray-400"}`}>
                  {level.isActive ? "Aktiv" : "Deaktiv"}
                </Badge>
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(level.id); setEditForm({}); }}
                    className="h-7 w-7 p-0 rounded-lg text-indigo-600"><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteLevel(level.id)}
                    className="h-7 w-7 p-0 rounded-lg text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Achievements Sub-tab ──────────────────────────────────────────────────────

function AchievementsTab() {
  const { toast } = useToast();
  const [defs, setDefs] = useState<AchievementDef[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", emoji: "🏆", color: "#f59e0b", xpReward: 0, triggerType: "lesson_count", triggerValue: 1, sortOrder: 0 });

  const load = useCallback(async () => {
    adminFetch("/api/admin/dev-system/achievements").then(setDefs).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!form.name) { toast({ title: "Ad daxil edin", variant: "destructive" }); return; }
    try {
      await adminFetch("/api/admin/dev-system/achievements", { method: "POST", body: JSON.stringify(form) });
      toast({ title: "Yaradıldı" }); setCreating(false);
      setForm({ name: "", description: "", emoji: "🏆", color: "#f59e0b", xpReward: 0, triggerType: "lesson_count", triggerValue: 1, sortOrder: 0 });
      load();
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function toggle(id: number, isActive: boolean) {
    try {
      await adminFetch(`/api/admin/dev-system/achievements/${id}`, { method: "PUT", body: JSON.stringify({ isActive: !isActive }) });
      load();
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  async function del(id: number) {
    if (!confirm("Bu nailiyyəti silmək istəyirsiniz?")) return;
    try {
      await adminFetch(`/api/admin/dev-system/achievements/${id}`, { method: "DELETE" });
      toast({ title: "Silindi" }); load();
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-indigo-900">Nailiyyətlər</h3>
        <Button size="sm" onClick={() => setCreating(v => !v)} className="rounded-xl gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" /> Yeni Nailiyyət
        </Button>
      </div>

      {creating && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Nailiyyətin adı" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="rounded-lg text-sm" />
            <Input placeholder="Açıqlama" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            <Input placeholder="Emoji" value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} className="rounded-lg text-sm" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-indigo-600 shrink-0">Rəng:</label>
              <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-8 w-full rounded cursor-pointer" />
            </div>
            <Input type="number" placeholder="XP mükafatı" value={form.xpReward}
              onChange={e => setForm(p => ({ ...p, xpReward: parseInt(e.target.value) || 0 }))} className="rounded-lg text-sm" />
            <Input type="number" placeholder="Dəyər" value={form.triggerValue}
              onChange={e => setForm(p => ({ ...p, triggerValue: parseInt(e.target.value) || 1 }))} className="rounded-lg text-sm" />
          </div>
          <div className="flex gap-3">
            <select value={form.triggerType} onChange={e => setForm(p => ({ ...p, triggerType: e.target.value }))}
              className="flex-1 rounded-lg border border-indigo-200 text-sm px-3 py-2 bg-white">
              {Object.entries(TRIGGER_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="outline" onClick={() => setCreating(false)} className="rounded-lg text-xs">Ləğv et</Button>
            <Button size="sm" onClick={create} className="rounded-lg text-xs">Yarat</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {defs.map(def => (
          <div key={def.id} className="rounded-xl border border-indigo-100 bg-white p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: (def.color ?? "#f59e0b") + "20" }}>
                {def.emoji ?? "🏆"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-indigo-900 text-sm">{def.name}</p>
                <p className="text-xs text-indigo-400 mt-0.5 leading-snug">{def.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <Badge variant="secondary" className="text-xs bg-indigo-50 text-indigo-600 border-0">
                {TRIGGER_LABELS[def.triggerType] ?? def.triggerType}: {def.triggerValue}
              </Badge>
              {def.xpReward > 0 && (
                <Badge variant="secondary" className="text-xs bg-amber-50 text-amber-600 border-0">
                  +{def.xpReward} XP
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className={`text-xs ${def.isActive ? "border-green-200 text-green-700" : "border-gray-200 text-gray-400"}`}>
                {def.isActive ? "Aktiv" : "Deaktiv"}
              </Badge>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => toggle(def.id, def.isActive)}
                  className="h-7 rounded-lg text-xs text-indigo-600 px-2">
                  {def.isActive ? "Deaktiv et" : "Aktiv et"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => del(def.id)}
                  className="h-7 w-7 p-0 rounded-lg text-red-500"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dev Score Weights Sub-tab ─────────────────────────────────────────────────

function DevScoreWeightsTab() {
  const { toast } = useToast();
  const [weights, setWeights] = useState<DevScoreWeights | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<DevScoreWeights>({
    lessonMax: 30, programMax: 20, testMax: 15, certMax: 15,
    taskMax: 10, articleMax: 5, storyMax: 3, streakMax: 2,
  });

  useEffect(() => {
    adminFetch("/api/admin/dev-system/dev-score-weights").then(w => {
      setWeights(w); setForm(w);
    }).catch(() => {});
  }, []);

  async function save() {
    const total = Object.values(form).reduce((s, v) => s + v, 0);
    if (total !== 100) {
      toast({ title: `Cəm ${total} — 100 olmalıdır`, variant: "destructive" }); return;
    }
    try {
      await adminFetch("/api/admin/dev-system/dev-score-weights", { method: "PUT", body: JSON.stringify(form) });
      setWeights(form); setEditing(false);
      toast({ title: "Dev Score çəkiləri yadda saxlandı" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
  }

  const LABELS: Record<keyof DevScoreWeights, string> = {
    lessonMax: "Dərslər (maks.)", programMax: "Proqramlar (maks.)",
    testMax: "Testlər (maks.)", certMax: "Sertifikatlar (maks.)",
    taskMax: "Tapşırıqlar (maks.)", articleMax: "Məqalələr (maks.)",
    storyMax: "Hekayələr (maks.)", streakMax: "Ardıcıllıq (maks.)",
  };

  const total = Object.values(form).reduce((s, v) => s + v, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-indigo-900">İnkişaf Balı Çəkiləri</h3>
          <p className="text-sm text-indigo-900/60 mt-0.5">Cəm dəqiq 100 olmalıdır. Hər kateqoriya üçün maksimum bal.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setEditing(v => !v)} className="rounded-xl gap-1.5 text-xs">
          <Pencil className="h-3.5 w-3.5" /> Düzəlt
        </Button>
      </div>

      <div className="space-y-3">
        {(Object.keys(LABELS) as Array<keyof DevScoreWeights>).map(key => (
          <div key={key} className="flex items-center gap-4">
            <span className="text-sm text-indigo-900 w-48 shrink-0">{LABELS[key]}</span>
            {editing ? (
              <Input type="number" min={0} max={100}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                className="h-8 w-24 text-sm text-center border-indigo-200 rounded-lg" />
            ) : (
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-indigo-50">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${((weights?.[key] ?? 0) / 100) * 100}%` }} />
                </div>
                <span className="text-sm font-bold text-primary w-8 text-right">{weights?.[key] ?? 0}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {editing && (
        <div className="mt-4 flex items-center justify-between">
          <div className={`text-sm font-semibold ${total === 100 ? "text-green-600" : "text-red-500"}`}>
            Cəm: {total} / 100 {total !== 100 && "(100 olmalıdır)"}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)} className="rounded-xl text-xs">Ləğv et</Button>
            <Button size="sm" onClick={save} className="rounded-xl text-xs gap-1"><Save className="h-3 w-3" /> Saxla</Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

type SubTab = "xp-rules" | "levels" | "achievements" | "dev-score";

const SUB_TABS: { value: SubTab; label: string; icon: React.ReactNode }[] = [
  { value: "xp-rules",     label: "XP Qaydaları",   icon: <Zap className="h-4 w-4" /> },
  { value: "levels",       label: "Səviyyələr",      icon: <Star className="h-4 w-4" /> },
  { value: "achievements", label: "Nailiyyətlər",    icon: <Trophy className="h-4 w-4" /> },
  { value: "dev-score",    label: "İnkişaf Balı",    icon: <BarChart3 className="h-4 w-4" /> },
];

export function DevSystemTab() {
  const [active, setActive] = useState<SubTab>("xp-rules");

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-indigo-950">⚡ İnkişaf Sistemi</h2>
        <p className="text-sm text-indigo-900/60 mt-0.5">XP qaydaları, səviyyələr, nailiyyətlər və inkişaf balını idarə edin.</p>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {SUB_TABS.map(t => (
          <button key={t.value} onClick={() => setActive(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border
              ${active === t.value
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-indigo-700 border-indigo-100 hover:border-indigo-300"}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-indigo-100 p-6">
        {active === "xp-rules"     && <XpRulesTab />}
        {active === "levels"       && <LevelsTab />}
        {active === "achievements" && <AchievementsTab />}
        {active === "dev-score"    && <DevScoreWeightsTab />}
      </div>
    </div>
  );
}
