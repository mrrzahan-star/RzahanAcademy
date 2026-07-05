import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { CrudSection } from "./cms/CrudSection";

const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
const API = basePath;

const SECTIONS = [
  { key: "hero", label: "🎯 Hero" },
  { key: "about", label: "👤 Müəllif Haqqında" },
  { key: "stats", label: "📊 Statistika" },
  { key: "stages", label: "🧠 7 Mərhələ" },
  { key: "howItWorks", label: "⚙️ Necə İşləyir?" },
  { key: "programs", label: "🎓 Proqramlar" },
  { key: "articles", label: "📰 Məqalələr" },
  { key: "stories", label: "💌 Hekayələr" },
  { key: "thought", label: "💭 Günün Fikri" },
  { key: "testimonials", label: "⭐ Rəylər" },
  { key: "packages", label: "📦 Paketlər" },
  { key: "faqs", label: "❓ FAQ" },
  { key: "announcements", label: "📢 Elanlar" },
  { key: "cta", label: "🚀 CTA" },
];

function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-indigo-100 rounded-xl overflow-hidden mb-4">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-indigo-50/50 hover:bg-indigo-100/50 transition-colors text-sm font-semibold text-indigo-800"
        onClick={() => setOpen(o => !o)}
      >
        {title}
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="p-4 space-y-3 bg-white">{children}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-indigo-700">{label}</Label>
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm rounded-lg border-indigo-100 min-h-[80px]"
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="text-sm rounded-lg border-indigo-100"
        />
      )}
    </div>
  );
}

export default function LandingConfigTab() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: raw, isLoading } = useQuery({
    queryKey: ["landing-config-admin"],
    queryFn: async () => {
      const r = await fetch(`${API}/api/admin/cms/landing-config`, {
        credentials: "include",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return r.json();
    },
  });

  const [cfg, setCfg] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (raw) setCfg(raw);
  }, [raw]);

  function setSection(section: string, key: string, value: unknown) {
    setCfg(prev => ({
      ...prev,
      [section]: { ...(prev[section] as Record<string, unknown> ?? {}), [key]: value },
    }));
  }

  function getS(section: string): Record<string, string | boolean | number> {
    return (cfg[section] as Record<string, string | boolean | number>) ?? {};
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`${API}/api/admin/cms/landing-config`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(cfg),
      });
      if (!r.ok) throw new Error("Saxlama xətası");
      return r.json();
    },
    onSuccess: () => {
      toast({ title: "✅ Saxlandı", description: "Landing page konfiqurasiyası yeniləndi." });
      qc.invalidateQueries({ queryKey: ["landing-config-admin"] });
    },
    onError: () => toast({ title: "Xəta", description: "Saxlama zamanı xəta baş verdi.", variant: "destructive" }),
  });

  if (isLoading) return <div className="p-8 text-center text-indigo-400">Yüklənir...</div>;

  const hero = getS("hero");
  const about = getS("about");
  const stats = getS("stats");
  const seo = getS("seo");
  const footer = getS("footer");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-indigo-950">🏠 Landing Page İdarəetməsi</h2>
          <p className="text-xs text-indigo-500 mt-0.5">Bütün dəyişikliklər anında landing page-də əks olunur.</p>
        </div>
        <div className="flex gap-2">
          <a href={`${basePath}/`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5">
              <Eye className="h-3.5 w-3.5" />Önizləmə
            </Button>
          </a>
          <Button
            size="sm"
            className="rounded-xl gap-1.5 bg-primary"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            <Save className="h-3.5 w-3.5" />
            {saveMutation.isPending ? "Saxlanır..." : "Yadda Saxla"}
          </Button>
        </div>
      </div>

      {/* Section Visibility & Order */}
      <Collapsible title="📋 Bölmə Görünürlüyü" defaultOpen>
        <p className="text-xs text-indigo-400 mb-3">Aktiv/deaktiv et — dəyişiklik yadda saxlandıqda tətbiq olunur.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SECTIONS.map(s => {
            const sec = getS(s.key);
            return (
              <div key={s.key} className="flex items-center justify-between px-3 py-2 rounded-lg border border-indigo-100 bg-indigo-50/30">
                <span className="text-sm font-medium text-indigo-800">{s.label}</span>
                <Switch
                  checked={sec.visible !== false}
                  onCheckedChange={v => setSection(s.key, "visible", v)}
                />
              </div>
            );
          })}
        </div>
      </Collapsible>

      {/* Content Counts */}
      <Collapsible title="🔢 Göstəriləcək Saylar">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { key: "programs", label: "Proqramlar (max 6)" },
            { key: "articles", label: "Məqalələr (max 6)" },
            { key: "stories", label: "Hekayələr (max 6)" },
            { key: "faqs", label: "FAQ (max 20)" },
            { key: "testimonials", label: "Rəylər (max 12)" },
          ].map(item => (
            <div key={item.key} className="space-y-1">
              <Label className="text-xs font-medium text-indigo-700">{item.label}</Label>
              <Input
                type="number"
                min={1} max={20}
                value={String((getS(item.key) as Record<string, number>).count ?? 3)}
                onChange={e => setSection(item.key, "count", Number(e.target.value))}
                className="text-sm rounded-lg border-indigo-100"
              />
            </div>
          ))}
        </div>
      </Collapsible>

      {/* Hero */}
      <Collapsible title="🎯 Hero Bölməsi">
        <Field label="Badge Mətni" value={String(hero.badge ?? "")} onChange={v => setSection("hero", "badge", v)} placeholder="Yeni Nəsil İnkişaf Platforması" />
        <Field label="Başlıq (\\n = yeni sətir)" value={String(hero.headline ?? "")} onChange={v => setSection("hero", "headline", v)} placeholder="İnsan Bilinç\nMexanizmi" />
        <Field label="Alt Başlıq" value={String(hero.subtitle ?? "")} onChange={v => setSection("hero", "subtitle", v)} type="textarea" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Düymə 1 Mətni" value={String(hero.btn1Text ?? "")} onChange={v => setSection("hero", "btn1Text", v)} placeholder="Testə Başla" />
          <Field label="Düymə 1 URL" value={String(hero.btn1Url ?? "")} onChange={v => setSection("hero", "btn1Url", v)} placeholder="/test" />
          <Field label="Düymə 2 Mətni" value={String(hero.btn2Text ?? "")} onChange={v => setSection("hero", "btn2Text", v)} placeholder="Kitabı Əldə Et" />
          <Field label="Düymə 2 URL" value={String(hero.btn2Url ?? "")} onChange={v => setSection("hero", "btn2Url", v)} placeholder="https://wa.me/..." />
        </div>
      </Collapsible>

      {/* About */}
      <Collapsible title="👤 Müəllif Haqqında Bölməsi">
        <Field label="Bölmə Başlığı" value={String(about.title ?? "")} onChange={v => setSection("about", "title", v)} />
        <Field label="Mətn" value={String(about.body ?? "")} onChange={v => setSection("about", "body", v)} type="textarea" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Müəllif Adı" value={String(about.authorName ?? "")} onChange={v => setSection("about", "authorName", v)} placeholder="Rzahan" />
          <Field label="Müəllif Titulu 1" value={String(about.authorTitle1 ?? "")} onChange={v => setSection("about", "authorTitle1", v)} />
          <Field label="Müəllif Titulu 2" value={String(about.authorTitle2 ?? "")} onChange={v => setSection("about", "authorTitle2", v)} />
          <Field label="Düymə Mətni" value={String(about.btnText ?? "")} onChange={v => setSection("about", "btnText", v)} />
          <Field label="Düymə URL" value={String(about.btnUrl ?? "")} onChange={v => setSection("about", "btnUrl", v)} />
        </div>
      </Collapsible>

      {/* Stats Labels */}
      <Collapsible title="📊 Statistika Etiketləri">
        {[0, 1, 2, 3].map(i => (
          <Field
            key={i}
            label={`Stat ${i + 1} Etiketi`}
            value={String(stats[`label${i}`] ?? "")}
            onChange={v => setSection("stats", `label${i}`, v)}
          />
        ))}
      </Collapsible>

      {/* SEO */}
      <Collapsible title="🔍 SEO Ayarları">
        <Field label="SEO Başlıq" value={String(seo.title ?? "")} onChange={v => setSection("seo", "title", v)} />
        <Field label="SEO Açıqlama" value={String(seo.description ?? "")} onChange={v => setSection("seo", "description", v)} type="textarea" />
        <Field label="OpenGraph Şəkil URL" value={String(seo.ogImage ?? "")} onChange={v => setSection("seo", "ogImage", v)} type="url" />
        <Field label="Açar Sözlər (vergüllə)" value={String(seo.keywords ?? "")} onChange={v => setSection("seo", "keywords", v)} placeholder="şüur, inkişaf, psixologiya" />
      </Collapsible>

      {/* Footer */}
      <Collapsible title="🦶 Footer">
        <Field label="Kısa Açıqlama" value={String(footer.tagline ?? "")} onChange={v => setSection("footer", "tagline", v)} type="textarea" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="WhatsApp URL" value={String(footer.waUrl ?? "")} onChange={v => setSection("footer", "waUrl", v)} />
          <Field label="Telegram URL" value={String(footer.tgUrl ?? "")} onChange={v => setSection("footer", "tgUrl", v)} />
          <Field label="TikTok URL" value={String(footer.ttUrl ?? "")} onChange={v => setSection("footer", "ttUrl", v)} />
          <Field label="Copyright mətni" value={String(footer.copyright ?? "")} onChange={v => setSection("footer", "copyright", v)} />
        </div>
      </Collapsible>

      {/* Testimonials CRUD */}
      <div className="mt-6">
        <h3 className="text-sm font-bold text-indigo-700 mb-3">⭐ Rəylər (Testimonials)</h3>
        <CrudSection
          title="Rəylər"
          endpoint="/testimonials"
          columns={[
            { key: "authorName", label: "Müəllif" },
            { key: "rating", label: "Reytinq" },
            { key: "isActive", label: "Aktiv" },
            { key: "sortOrder", label: "Sıra" },
          ]}
          fields={[
            { key: "authorName", label: "Ad", required: true },
            { key: "authorTitle", label: "Vəzifə / Titulu" },
            { key: "content", label: "Rəy mətni", required: true, type: "textarea" },
            { key: "rating", label: "Reytinq (1-5)", type: "number" },
            { key: "stageName", label: "Mərhələ adı", placeholder: "Axtaran" },
            { key: "avatarUrl", label: "Şəkil URL", type: "url" },
            { key: "isFeatured", label: "Seçilmiş?", type: "boolean" },
            { key: "isActive", label: "Aktiv?", type: "boolean" },
            { key: "sortOrder", label: "Sıra", type: "number" },
          ]}
          defaultValues={{ isActive: true, rating: 5, sortOrder: 0, isFeatured: false }}
        />
      </div>

      {/* Bottom save */}
      <div className="pt-4 flex justify-end">
        <Button
          size="sm"
          className="rounded-xl gap-1.5 bg-primary"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          <Save className="h-3.5 w-3.5" />
          {saveMutation.isPending ? "Saxlanır..." : "Bütün Dəyişiklikləri Saxla"}
        </Button>
      </div>
    </div>
  );
}
