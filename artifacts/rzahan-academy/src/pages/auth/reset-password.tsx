import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, CheckCircle, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSessionReady(true);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Şifrə ən azı 8 simvol olmalıdır");
      return;
    }
    if (password !== confirm) {
      setError("Şifrələr uyğun gəlmir");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => setLocation(`${basePath}/dashboard`), 3000);
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center aurora-bg px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl" />
      <div className="relative z-10 w-full max-w-[440px]">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(91,95,239,0.08)] border border-white/50 p-8">
          <div className="flex justify-center mb-6">
            <Link href={`${basePath}/`} className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-amber-400">
                <Zap className="h-6 w-6 fill-current" />
              </div>
              <span className="text-lg font-bold text-indigo-950">Rzahan Academy</span>
            </Link>
          </div>

          {done ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-indigo-950 mb-2">Şifrə Yeniləndi</h2>
              <p className="text-indigo-600/80 text-sm mb-2">
                Şifrəniz uğurla yeniləndi. İdarə panelinə yönləndirilirsiniz...
              </p>
            </div>
          ) : !sessionReady ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="h-8 w-8 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-indigo-950 mb-2">Sessiya Yoxlanılır</h2>
              <p className="text-indigo-600/80 text-sm mb-6">
                E-poçtunuzdakı keçidin bu səhifəni açdığından əmin olun.
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto" />
              <div className="mt-6">
                <Link href={`${basePath}/forgot-password`} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  Yenidən link al
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-indigo-950 mb-1">Yeni Şifrə Qur</h2>
              <p className="text-sm text-indigo-600/80 mb-6">Ən azı 8 simvollu güclü şifrə seçin.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-indigo-950 mb-1.5 block">Yeni Şifrə</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ən azı 8 simvol"
                    required
                    autoComplete="new-password"
                    className="rounded-2xl border-2 border-indigo-100/80 h-12 text-base focus-visible:ring-primary/20 focus-visible:border-primary"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold text-indigo-950 mb-1.5 block">Şifrəni Təsdiqlə</Label>
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Şifrəni təkrarlayın"
                    required
                    autoComplete="new-password"
                    className="rounded-2xl border-2 border-indigo-100/80 h-12 text-base focus-visible:ring-primary/20 focus-visible:border-primary"
                  />
                </div>

                {error && (
                  <div className="bg-red-50/80 border-2 border-red-100 rounded-2xl p-3 text-sm text-red-600">{error}</div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_4px_20px_0_rgba(91,95,239,0.3)] font-bold text-base"
                >
                  {loading ? "Yenilənir..." : "Şifrəni Yenilə"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
