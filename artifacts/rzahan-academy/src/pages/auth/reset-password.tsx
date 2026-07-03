import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const { confirmResetPassword } = useAuth();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Şifrə ən azı 8 simvol olmalıdır"); return; }
    if (password !== confirm) { setError("Şifrələr uyğun gəlmir"); return; }
    setLoading(true);
    const { error } = await confirmResetPassword(token, password, confirm);
    setLoading(false);
    if (error) { setError(error); return; }
    setDone(true);
    setTimeout(() => setLocation(`${basePath}/sign-in`), 3000);
  }

  if (!token) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center aurora-bg px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/40 backdrop-blur-3xl" />
        <div className="relative z-10 w-full max-w-[440px]">
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(91,95,239,0.08)] border border-white/50 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-indigo-950 mb-2">Token Tapılmadı</h2>
            <p className="text-indigo-600/80 text-sm mb-6">
              Keçid etibarsızdır. Yenidən şifrə bərpa tələbi göndərin.
            </p>
            <Link href={`${basePath}/forgot-password`}>
              <Button className="rounded-2xl w-full font-bold bg-primary hover:bg-primary/90">
                Bərpa Et
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
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
              <p className="text-indigo-600/80 text-sm">
                Şifrəniz uğurla yeniləndi. Giriş səhifəsinə yönləndirilirsiniz...
              </p>
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
