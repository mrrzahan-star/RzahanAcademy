import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 relative selection:bg-primary/20 selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full glass-card border-b border-white/20">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-primary/25">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-950 to-indigo-700">Rzahan Academy</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-indigo-950/70">
            <a href="#about" className="hover:text-primary transition-colors">Haqqında</a>
            <a href="#stages" className="hover:text-primary transition-colors">Mərhələlər</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Rəylər</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link href={`${basePath}/sign-in`} className="hidden sm:flex text-sm font-medium text-indigo-950 hover:text-primary px-4 py-2 transition-colors">
                  Daxil ol
                </Link>
                <Link href={`${basePath}/test`} className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 shadow-lg shadow-primary/20">
                  Testə Başla
                </Link>
              </>
            ) : (
              <>
                <Link href={`${basePath}/dashboard`} className="hidden sm:inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-indigo-50 text-indigo-950 h-10 px-4">
                  Panelə qayıt
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => { await signOut(); window.location.href = basePath || "/"; }}
                  className="text-indigo-950 hover:bg-red-50 hover:text-red-600 rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 w-full relative z-10">{children}</main>
    </div>
  );
}
