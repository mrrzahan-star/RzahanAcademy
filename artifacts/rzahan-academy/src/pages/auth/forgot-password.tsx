import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
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

          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-indigo-950 mb-2">Göndərildi</h2>
              <p className="text-indigo-600/80 text-sm mb-6">
                <strong>{email}</strong> ünvanına şifrə sıfırlama linki göndərildi. Zəhmət olmasa e-poçtunuzu yoxlayın.
              </p>
              <Link href={`${basePath}/sign-in`}>
                <Button className="rounded-2xl w-full font-bold bg-primary hover:bg-primary/90">
                  Giriş səhifəsinə qayıt
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-indigo-950 mb-1">Şifrəni Sıfırla</h2>
              <p className="text-sm text-indigo-600/80 mb-6">E-poçt ünvanınızı daxil edin, sıfırlama linki göndərəcəyik.</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold text-indigo-950 mb-1.5 block">E-poçt</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
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
                  {loading ? "Göndərilir..." : "Sıfırlama Linki Göndər"}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href={`${basePath}/sign-in`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Girişə qayıt
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
