import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

export default function SignUpPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const [, setLocation] = useLocation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Şifrə ən azı 8 simvol olmalıdır"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Xəta baş verdi");
        setLoading(false);
        return;
      }
      const { error: signInErr } = await signIn(email, password);
      if (signInErr) {
        setError(signInErr.message);
        setLoading(false);
        return;
      }
      setLocation(`${basePath}/dashboard`);
    } catch {
      setError("Şəbəkə xətası. Yenidən cəhd edin.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
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

          <h2 className="text-2xl font-bold text-indigo-950 mb-1">Hesab Yaradın</h2>
          <p className="text-sm text-indigo-600/80 mb-6">Oyanış səyahətinizə başlayın</p>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full h-12 rounded-2xl border-2 border-indigo-100 bg-white hover:bg-indigo-50/50 hover:border-indigo-200 transition-all mb-4 font-medium text-indigo-900"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Yönləndirilir..." : "Google ilə qeydiyyat"}
          </Button>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-indigo-100/50" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/80 px-3 text-xs font-semibold uppercase tracking-wider text-indigo-400/80">
                və ya e-poçt ilə
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold text-indigo-950 mb-1.5 block">Ad</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Əli"
                  required
                  className="rounded-2xl border-2 border-indigo-100/80 h-12 text-base focus-visible:ring-primary/20 focus-visible:border-primary"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-indigo-950 mb-1.5 block">Soyad</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Hüseynov"
                  className="rounded-2xl border-2 border-indigo-100/80 h-12 text-base focus-visible:ring-primary/20 focus-visible:border-primary"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold text-indigo-950 mb-1.5 block">E-poçt</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                autoComplete="email"
                className="rounded-2xl border-2 border-indigo-100/80 h-12 text-base focus-visible:ring-primary/20 focus-visible:border-primary"
              />
            </div>
            <div>
              <Label className="text-sm font-semibold text-indigo-950 mb-1.5 block">Şifrə</Label>
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

            {error && (
              <div className="bg-red-50/80 border-2 border-red-100 rounded-2xl p-3 text-sm text-red-600">{error}</div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 shadow-[0_4px_20px_0_rgba(91,95,239,0.3)] font-bold text-base"
            >
              {loading ? "Yaradılır..." : "Hesab Yarat"}
            </Button>
          </form>

          <div className="mt-6 bg-indigo-50/50 -mx-8 -mb-8 p-6 text-center border-t border-indigo-100/50 rounded-b-[2rem]">
            <span className="text-sm text-indigo-600/80 font-medium">Artıq hesabınız var? </span>
            <Link href={`${basePath}/sign-in`} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              Daxil olun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
