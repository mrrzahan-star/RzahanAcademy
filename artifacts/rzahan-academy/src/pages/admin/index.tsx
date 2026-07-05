import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, ShieldOff, Search, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AdminStats } from "./components/AdminStats";
import { NotificationBell } from "./components/NotificationBell";
import { UsersTab } from "./components/UsersTab";
import { TestsTab } from "./components/TestsTab";
import { CertificatesTab } from "./components/CertificatesTab";
import { JournalTab } from "./components/JournalTab";
import { DailyTasksTab } from "./components/DailyTasksTab";
import { LeaderboardTab } from "./components/LeaderboardTab";
import { ReviewsTab } from "./components/ReviewsTab";
import { AuditLogTab } from "./components/AuditLogTab";
import { ContentTab } from "./components/ContentTab";
import { SystemTab } from "./components/SystemTab";
import { CmsTab } from "./components/CmsTab";
import { MembershipsTab } from "./components/MembershipsTab";
import { SearchPanel } from "./components/SearchPanel";
import { adminFetch, type AdminStats as AdminStatsType } from "./components/utils";

const TABS = [
  { value: "users", label: "İstifadəçilər" },
  { value: "memberships", label: "👑 Üzvlük" },
  { value: "reviews", label: "Rəylər" },
  { value: "tests", label: "Testlər" },
  { value: "certificates", label: "Sertifikatlar" },
  { value: "journals", label: "Gündəliklər" },
  { value: "daily-tasks", label: "Tapşırıqlar" },
  { value: "leaderboard", label: "Liderlik" },
  { value: "audit", label: "Audit" },
  { value: "lms", label: "LMS / CMS" },
  { value: "content", label: "Məzmun" },
  { value: "system", label: "Sistem" },
];

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/stats")
      .then(s => { setStats(s); setLoadingStats(false); })
      .catch(err => {
        if (err.message === "Forbidden") setForbidden(true);
        else toast({ title: "Statistika yüklənmədi", description: err.message, variant: "destructive" });
        setLoadingStats(false);
      });
  }, [toast]);

  if (forbidden) {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
          <ShieldOff className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-indigo-950 mb-2">Giriş Qadağandır</h2>
        <p className="text-indigo-900/60">Bu səhifəyə yalnız administrator daxil ola bilər.</p>
      </div>
    );
  }

  if (loadingStats) {
    return <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-950">İdarəetmə Mərkəzi</h1>
          <p className="text-indigo-900/60 mt-1 text-sm">@{user?.username}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 border-indigo-100 text-indigo-600"
            onClick={() => setSearchOpen(true)}>
            <Search className="h-4 w-4" /> Axtar
          </Button>
          <NotificationBell />
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-3 w-3" /> Admin
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && <AdminStats stats={stats} />}

      {/* Pending badge */}
      {stats && stats.pendingComments > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 flex items-center gap-3">
          <Bell className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="text-sm font-medium text-amber-800">
            Təsdiqlənməyi gözləyən <strong>{stats.pendingComments}</strong> rəy var
          </span>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-1 flex flex-nowrap gap-0.5 h-auto overflow-x-auto max-w-full scrollbar-none">
          {TABS.map(t => (
            <TabsTrigger key={t.value} value={t.value}
              className="rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap px-3 py-1.5">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="memberships"><MembershipsTab /></TabsContent>
        <TabsContent value="reviews"><ReviewsTab /></TabsContent>
        <TabsContent value="tests"><TestsTab /></TabsContent>
        <TabsContent value="certificates"><CertificatesTab /></TabsContent>
        <TabsContent value="journals"><JournalTab /></TabsContent>
        <TabsContent value="daily-tasks"><DailyTasksTab /></TabsContent>
        <TabsContent value="leaderboard"><LeaderboardTab /></TabsContent>
        <TabsContent value="audit"><AuditLogTab /></TabsContent>
        <TabsContent value="lms"><CmsTab /></TabsContent>
        <TabsContent value="content"><ContentTab /></TabsContent>
        <TabsContent value="system"><SystemTab /></TabsContent>
      </Tabs>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
