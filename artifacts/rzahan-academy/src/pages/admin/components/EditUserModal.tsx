import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { adminFetch, type AdminUser } from "./utils";

interface Props {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSaved: (updated: Partial<AdminUser>) => void;
}

export function EditUserModal({ user, open, onClose, onSaved }: Props) {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [level, setLevel] = useState("");
  const [stage, setStage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setEmail(user.email ?? "");
      setBio(user.bio ?? "");
      setLevel(String(user.consciousnessLevel ?? ""));
      setStage(user.consciousnessStage ?? "");
    }
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setLoading(true);
    try {
      await adminFetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          firstName, lastName, email, bio,
          consciousnessLevel: level ? parseInt(level, 10) : undefined,
          consciousnessStage: stage || undefined,
        }),
      });
      toast({ title: "İstifadəçi yeniləndi" });
      onSaved({ firstName, lastName, email, bio, consciousnessLevel: level ? parseInt(level, 10) : null, consciousnessStage: stage || null });
      onClose();
    } catch (e: any) {
      toast({ title: "Xəta", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-indigo-950">İstifadəçini Redaktə Et</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-indigo-900 mb-1 block">Ad</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} className="rounded-xl h-10" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-indigo-900 mb-1 block">Soyad</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} className="rounded-xl h-10" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-indigo-900 mb-1 block">E-poçt</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="rounded-xl h-10" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-indigo-900 mb-1 block">Bio</Label>
            <Input value={bio} onChange={e => setBio(e.target.value)} className="rounded-xl h-10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-indigo-900 mb-1 block">Şüur Səviyyəsi</Label>
              <Input type="number" value={level} onChange={e => setLevel(e.target.value)} className="rounded-xl h-10" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-indigo-900 mb-1 block">Mərhələ</Label>
              <Input value={stage} onChange={e => setStage(e.target.value)} placeholder="Məs: Oyanış" className="rounded-xl h-10" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Ləğv Et</Button>
            <Button className="flex-1 rounded-xl" onClick={handleSave} disabled={loading}>
              {loading ? "Saxlanır..." : "Saxla"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
