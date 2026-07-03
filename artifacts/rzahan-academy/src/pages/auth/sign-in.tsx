import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap } from "lucide-react";

export default function SignInPage() {
  const { signIn } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(username.trim(), password);
    setLoading(false);
    if (error) { setError(error); return; }
    setLocation(`${basePath}/dashboard`);
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

          <h2 className="text-2xl font-bold text-indigo-950 mb-1">Xoş Gəlmisiniz</h2>
          <p className="text-sm text-indigo-600/80 mb-6">Hesabınıza daxil olun</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-sm font-semibold text-indigo-950 mb-1.5 block">İstifadəçi adı</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="istifadeciadınız"
                required
                autoComplete="username"
                className="rounded-2xl border-2 border-indigo-100/80 h-12 text-base focus-visible:ring-primary/20 focus-visible:border-primary"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-sm font-semibold text-indigo-950">Şifrə</Label>
                <Link href={`${basePath}/forgot-password`} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  Şifrəni unutdum?
                </Link>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
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
              {loading ? "Daxil olunur..." : "Daxil ol"}
            </Button>
          </form>

          <div className="mt-6 bg-indigo-50/50 -mx-8 -mb-8 p-6 text-center border-t border-indigo-100/50 rounded-b-[2rem]">
            <span className="text-sm text-indigo-600/80 font-medium">Hesabınız yoxdur? </span>
            <Link href={`${basePath}/sign-up`} className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
              Qeydiyyatdan keçin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
