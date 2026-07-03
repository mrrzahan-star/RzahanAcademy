import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "./utils";

const FIELDS: { key: string; label: string; type?: string }[] = [
  { key: "site_name", label: "Sayt Adı" },
  { key: "hero_text", label: "Hero Başlıq" },
  { key: "hero_subtitle", label: "Hero Alt Başlıq" },
  { key: "footer_text", label: "Footer Mətni" },
  { key: "tiktok_url", label: "TikTok URL", type: "url" },
  { key: "telegram_url", label: "Telegram URL", type: "url" },
  { key: "contact_url", label: "Əlaqə URL", type: "url" },
  { key: "seo_title", label: "SEO Başlıq" },
  { key: "seo_description", label: "SEO Açıqlama" },
];

export function ContentTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/site-settings").then(s => {
      setSettings(s || {}); setLoading(false);
    }).catch(e => {
      toast({ title: "Xəta", description: e.message, variant: "destructive" });
      setLoading(false);
    });
  }, [toast]);

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      FIELDS.forEach(f => { payload[f.key] = settings[f.key] ?? ""; });
      await adminFetch("/api/admin/site-settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast({ title: "Tənzimləmələr saxlandı" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="py-16 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="rounded-2xl border-indigo-50 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-indigo-950">Sayt Məzmunu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.slice(0, 4).map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-indigo-900 mb-1.5 block">{f.label}</Label>
              <Input
                type={f.type || "text"}
                value={settings[f.key] ?? ""}
                onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="rounded-xl h-10 border-indigo-100"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-indigo-50 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-indigo-950">Sosial Şəbəkə & Əlaqə</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.slice(4, 7).map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-indigo-900 mb-1.5 block">{f.label}</Label>
              <Input
                type={f.type || "text"}
                value={settings[f.key] ?? ""}
                onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder="https://"
                className="rounded-xl h-10 border-indigo-100"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-indigo-50 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-indigo-950">SEO Tənzimləmələri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.slice(7).map(f => (
            <div key={f.key}>
              <Label className="text-xs font-semibold text-indigo-900 mb-1.5 block">{f.label}</Label>
              <Input
                value={settings[f.key] ?? ""}
                onChange={e => setSettings(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="rounded-xl h-10 border-indigo-100"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}
        className="w-full rounded-2xl h-12 font-bold shadow-[0_4px_20px_0_rgba(91,95,239,0.2)]">
        {saving ? "Saxlanır..." : "Dəyişiklikləri Saxla"}
      </Button>
    </div>
  );
}
