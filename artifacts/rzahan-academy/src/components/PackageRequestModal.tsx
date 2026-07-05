import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Package {
  slug: string;
  name: string;
  emoji?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  preSelectedPackage?: Package | null;
  packages?: Package[];
}

export function PackageRequestModal({ open, onClose, preSelectedPackage, packages = [] }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    packageSlug: preSelectedPackage?.slug ?? "",
    notes: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleOpen = () => {
    setSuccess(false);
    setForm({
      fullName: user ? `${(user as any).firstName ?? ""} ${(user as any).lastName ?? ""}`.trim() : "",
      phone: "",
      email: (user as any)?.email ?? "",
      packageSlug: preSelectedPackage?.slug ?? (packages[0]?.slug ?? ""),
      notes: "",
    });
  };

  const submit = async () => {
    if (!form.fullName.trim() || !form.phone.trim() || !form.packageSlug) {
      toast({ title: "Xəta", description: "Ad, telefon və paket seçimi tələb olunur.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const r = await fetch("/api/memberships/request", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token ?? ""}` },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || undefined,
          packageSlug: form.packageSlug,
          notes: form.notes || undefined,
        }),
      });
      if (!r.ok) throw new Error("Müraciət göndərilmədi");
      setSuccess(true);
    } catch {
      toast({ title: "Xəta", description: "Müraciət göndərilmədi. Yenidən cəhd edin.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const pkgOptions = packages.length > 0 ? packages : preSelectedPackage ? [preSelectedPackage] : [];

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); else handleOpen(); }}>
      <DialogContent className="max-w-md rounded-3xl">
        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-indigo-950 mb-2">Müraciətiniz Qəbul Edildi!</h3>
            <p className="text-indigo-900/70 mb-6">Ən qısa zamanda sizinlə əlaqə saxlanılacaq.</p>
            <Button className="rounded-2xl px-8" onClick={onClose}>Bağla</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-indigo-950">Paketə Müraciət Et</DialogTitle>
              <DialogDescription className="text-indigo-900/60">
                Məlumatlarınızı doldurun, admin sizinlə əlaqə saxlayacaq.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              {pkgOptions.length > 1 && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-indigo-700">Paket *</Label>
                  <Select value={form.packageSlug} onValueChange={v => set("packageSlug", v)}>
                    <SelectTrigger className="rounded-xl border-indigo-100">
                      <SelectValue placeholder="Paket seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {pkgOptions.map(p => (
                        <SelectItem key={p.slug} value={p.slug}>
                          {p.emoji} {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {pkgOptions.length === 1 && (
                <div className="px-3 py-2 bg-indigo-50 rounded-xl text-sm text-indigo-700 font-medium">
                  {pkgOptions[0].emoji} {pkgOptions[0].name} paketinə müraciət
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-indigo-700">Ad Soyad *</Label>
                <Input value={form.fullName} onChange={e => set("fullName", e.target.value)} placeholder="Əli Əliyev" className="rounded-xl border-indigo-100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-indigo-700">Telefon *</Label>
                <Input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+994 XX XXX XX XX" className="rounded-xl border-indigo-100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-indigo-700">Email</Label>
                <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@example.com" className="rounded-xl border-indigo-100" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-indigo-700">Qeyd (ixtiyari)</Label>
                <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Suallarınız, əlavə məlumat..." className="rounded-xl border-indigo-100 min-h-[80px]" />
              </div>
              <Button className="w-full rounded-2xl h-12 bg-primary font-bold" onClick={submit} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Göndərilir..." : "Müraciəti Göndər"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
