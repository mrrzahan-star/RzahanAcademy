import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, CheckSquare, Award, User, LogOut, ShieldAlert, Zap, BookOpen, ListTodo, Trophy, Menu, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const baseNavItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/programs", label: "Proqramlar", icon: GraduationCap },
  { href: "/test", label: "Test", icon: CheckSquare },
  { href: "/journal", label: "Şüur Jurnalı", icon: BookOpen },
  { href: "/tasks", label: "Tapşırıqlar", icon: ListTodo },
  { href: "/certificates", label: "Sertifikatlar", icon: Award },
  { href: "/leaderboard", label: "Sıralama", icon: Trophy },
  { href: "/profile", label: "Profil", icon: User },
];

const adminNavItem = { href: "/admin", label: "Admin", icon: ShieldAlert };

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === "admin";
  const navItems = isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems;
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  const displayName = user?.fullName || user?.username || "İstifadəçi";
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center px-6 border-b border-indigo-100/50 shrink-0">
        <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-amber-400">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="text-base font-bold text-indigo-950">Rzahan Academy</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "text-indigo-950/70 hover:bg-indigo-50 hover:text-indigo-950"
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-white" : "text-indigo-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-indigo-100/50 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden shrink-0">
            {initial}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold text-indigo-950 truncate">{displayName}</span>
            <span className="text-xs text-indigo-950/50 truncate">@{user?.username}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
          onClick={() => {
            signOut();
            window.location.href = basePath || "/";
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Çıxış et
        </Button>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex bg-slate-50">
      <aside className="w-64 border-r border-indigo-100 bg-white/50 backdrop-blur-xl hidden md:flex flex-col">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-16 border-b border-indigo-100 bg-white/80 backdrop-blur-xl flex items-center px-4 justify-between sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-amber-400">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="text-base font-bold text-indigo-950">Rzahan Academy</span>
          </Link>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl text-indigo-600">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-white/95 backdrop-blur-xl border-indigo-100">
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
