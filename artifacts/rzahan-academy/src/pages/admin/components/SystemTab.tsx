import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "./utils";

export function SystemTab() {
  const { toast } = useToast();
  const [maintenance, setMaintenance] = useState(false);
  const [regOpen, setRegOpen] = useState(true);
  const [xpPerTest, setXpPerTest] = useState("100");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/site-settings").then((s: Record<string, string>) => {
      setMaintenance(s.maintenance_mode === "true");
      setRegOpen(s.registration_open !== "false");
      setXpPerTest(s.xp_per_test || "100");
      setLoading(false);
    }).catch(e => {
      toast({ title: "Xəta", description: e.message, variant: "destructive" });
      setLoading(false);
    });
  }, [toast]);

  async function handleSave() {
    setSaving(true);
    try {
      await adminFetch("/api/admin/site-settings", {
        method: "PUT",
        body: JSON.stringify({
          maintenance_mode: String(maintenance),
          registration_open: String(regOpen),
          xp_per_test: xpPerTest,
        }),
      });
      toast({ title: "Sistem tənzimləmələri saxlandı" });
    } catch (e: any) { toast({ title: "Xəta", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="py-16 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  const Toggle = ({ value, onChange, label, desc }: { value: boolean; onChange: (v: boolean) => void; label: string; desc: string }) => (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/50">
      <div>
        <div className="font-semibold text-indigo-950 text-sm">{label}</div>
        <div className="text-xs text-indigo-500 mt-0.5">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${value ? "bg-primary" : "bg-indigo-200"}`}
      >
        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-7" : "translate-x-1"}`} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="rounded-2xl border-indigo-50 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-indigo-950">Sayt Rejimi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Toggle
            value={maintenance}
            onChange={setMaintenance}
            label="Texniki Xidmət Rejimi"
            desc="Aktiv olduqda sayt istifadəçilərə bağlanır"
          />
          <Toggle
            value={regOpen}
            onChange={setRegOpen}
            label="Qeydiyyat Açıqdır"
            desc="Deaktiv olduqda yeni istifadəçi yarada bilməz"
          />
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-indigo-50 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-indigo-950">XP Sistemi</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label className="text-xs font-semibold text-indigo-900 mb-1.5 block">Test üçün XP Miqdarı</Label>
            <Input
              type="number"
              value={xpPerTest}
              onChange={e => setXpPerTest(e.target.value)}
              min="0"
              max="10000"
              className="rounded-xl h-10 border-indigo-100 max-w-[180px]"
            />
            <p className="text-xs text-indigo-400 mt-1.5">Hər uğurlu test tamamlandıqda verilən XP</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}
        className="w-full rounded-2xl h-12 font-bold shadow-[0_4px_20px_0_rgba(91,95,239,0.2)]">
        {saving ? "Saxlanır..." : "Sistem Tənzimləmələrini Saxla"}
      </Button>
    </div>
  );
}
