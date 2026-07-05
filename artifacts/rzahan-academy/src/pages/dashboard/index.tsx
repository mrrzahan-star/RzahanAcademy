import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  Target, Activity, Award, Calendar, ChevronRight,
  PlayCircle, Lightbulb, CheckCircle2, GraduationCap,
  BookOpen, Heart, ArrowRight, Zap, BarChart2, Star
} from "lucide-react";

interface XpSummary {
  totalXp: number;
  currentLevel: { name: string; emoji: string | null; color: string | null; requiredXp: number } | null;
  nextLevel: { name: string; requiredXp: number; xpNeeded: number } | null;
  devScore: number;
  streak: number;
  achievements: { id: number; name: string; emoji: string | null; unlockedAt: string }[];
}

interface Widgets {
  continueLearning: {
    lessonId: number; lessonTitle: string;
    programSlug: string; programTitle: string; progressPct: number;
  } | null;
  todaysThought: { text: string; author: string | null } | null;
  todaysTask: { title: string; description: string | null } | null;
  activePrograms: {
    id: number; title: string; slug: string; coverImageUrl: string | null;
    progressPct: number; completedLessonCount: number; totalLessonCount: number;
  }[];
  recentCertificates: { id: string; stageName: string; createdAt: string }[];
  recommendedArticles: { id: number; title: string; slug: string; excerpt: string | null; coverImageUrl: string | null }[];
  recommendedStories: { id: number; title: string; imageUrl: string | null }[];
  recentPrograms: {
    id: number; title: string; slug: string; coverImageUrl: string | null;
    description: string | null; difficulty: string | null;
  }[];
}

const DIFFICULTY_LABEL: Record<string, string> = {
  baslanqic: "Başlanğıc", orta: "Orta", peshkar: "Peşəkar"
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });
  const [widgets, setWidgets] = useState<Widgets | null>(null);
  const [widgetsLoading, setWidgetsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats/home-widgets")
      .then(r => r.ok ? r.json() : null)
      .then(d => setWidgets(d))
      .catch(() => {})
      .finally(() => setWidgetsLoading(false));
  }, []);

  const [xp, setXp] = useState<XpSummary | null>(null);

  useEffect(() => {
    fetch("/api/xp/summary")
      .then(r => r.ok ? r.json() : null)
      .then(d => setXp(d))
      .catch(() => {});
  }, []);

  const displayName = user?.fullName?.split(" ")[0] || user?.username || "İstifadəçi";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-950 tracking-tight">
            Salam, {displayName} 👋
          </h1>
          <p className="text-indigo-900/60 mt-1">Şəxsi İnkişaf Sisteminizə xoş gəlmisiniz.</p>
        </div>
        <Link href="/test">
          <Button size="lg" className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Yeni Test Başla
          </Button>
        </Link>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Şüur Səviyyəsi" value={`${stats?.latestStage ?? 0}/7`} sub={stats?.latestStageName || "Başlamayıb"} color="bg-indigo-50 text-primary" loading={statsLoading} />
        <StatCard icon={Activity} label="Tamamlanan Test" value={stats?.totalTests ?? 0} sub="dəfə test etdiniz" color="bg-blue-50 text-blue-600" loading={statsLoading} />
        <StatCard icon={Award} label="Sertifikat" value={stats?.hasCertificate ? "Var ✓" : "Yoxdur"} sub="rəsmi sənəd" color="bg-violet-50 text-violet-600" loading={statsLoading} />
        <StatCard icon={Calendar} label="Ardıcıllıq" value={`${stats?.streakDays ?? 0} gün`} sub="fasiləsiz aktivlik" color="bg-amber-50 text-amber-600" loading={statsLoading} />
      </div>

      {/* XP + Level + Dev Score banner */}
      {xp && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* XP & Level */}
          <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-indigo-950 to-indigo-800 text-white p-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Səviyyə & XP</span>
                </div>
                <div className="text-xs font-bold text-indigo-300">{xp.totalXp.toLocaleString()} XP</div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">{xp.currentLevel?.emoji ?? "🌱"}</div>
                <div>
                  <div className="text-xl font-black text-white">{xp.currentLevel?.name ?? "Başlanğıc"}</div>
                  {xp.nextLevel && (
                    <div className="text-xs text-indigo-300">{xp.nextLevel.name}-ə {xp.nextLevel.xpNeeded} XP qalır</div>
                  )}
                </div>
              </div>
              {xp.nextLevel && (
                <div>
                  <Progress
                    value={Math.round(((xp.nextLevel.requiredXp - xp.nextLevel.xpNeeded - (xp.currentLevel?.requiredXp ?? 0)) / (xp.nextLevel.requiredXp - (xp.currentLevel?.requiredXp ?? 0))) * 100)}
                    className="h-1.5 bg-white/20 [&>div]:bg-amber-400"
                  />
                </div>
              )}
              {xp.achievements.length > 0 && (
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  {xp.achievements.slice(0, 5).map(a => (
                    <span key={a.id} className="text-lg" title={a.name}>{a.emoji ?? "🏆"}</span>
                  ))}
                  {xp.achievements.length > 5 && (
                    <span className="text-xs text-indigo-300 self-center">+{xp.achievements.length - 5}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dev Score */}
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">İnkişaf Balı</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e0e7ff" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="10"
                    strokeDasharray={`${(xp.devScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-indigo-950">{xp.devScore}</span>
                  <span className="text-xs text-indigo-400 -mt-0.5">/ 100</span>
                </div>
              </div>
            </div>
            <div className="text-center mt-2">
              <Link href="/profile">
                <span className="text-xs text-primary hover:underline">Profilə bax →</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Continue Learning + Today's Thought */}
      {!widgetsLoading && (widgets?.continueLearning || widgets?.todaysThought) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Continue Learning */}
          {widgets?.continueLearning && (
            <div className="rounded-2xl bg-gradient-to-br from-primary to-indigo-700 text-white p-6 flex flex-col gap-4 shadow-lg shadow-primary/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-amber-300" />
                <span className="text-sm font-semibold text-indigo-200 uppercase tracking-wide">Öyrənməyə Davam Et</span>
              </div>
              <div>
                <p className="text-lg font-bold leading-snug">{widgets.continueLearning.lessonTitle}</p>
                <p className="text-indigo-200 text-sm mt-1">{widgets.continueLearning.programTitle}</p>
              </div>
              <div>
                <div className="flex justify-between text-xs text-indigo-200 mb-1.5">
                  <span>Proqram irəliləyişi</span>
                  <span className="font-bold text-white">{widgets.continueLearning.progressPct}%</span>
                </div>
                <Progress value={widgets.continueLearning.progressPct} className="h-1.5 bg-white/20 [&>div]:bg-amber-400" />
              </div>
              <Link href={`/programs/${widgets.continueLearning.programSlug}/lessons/${widgets.continueLearning.lessonId}`}>
                <Button className="bg-white text-primary hover:bg-indigo-50 rounded-xl font-bold w-full">
                  Davam et <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          )}

          {/* Today's Thought */}
          {widgets?.todaysThought && (
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Günün Fikri</span>
              </div>
              <blockquote className="flex-1 text-indigo-900 font-medium leading-relaxed text-base">
                "{widgets.todaysThought.text}"
              </blockquote>
              {widgets.todaysThought.author && (
                <p className="text-sm text-amber-600 font-semibold">— {widgets.todaysThought.author}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Today's Task */}
      {!widgetsLoading && widgets?.todaysTask && (
        <div className="rounded-2xl border border-green-100 bg-green-50/60 px-6 py-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Günün Tapşırığı</span>
            </div>
            <p className="font-bold text-indigo-950">{widgets.todaysTask.title}</p>
            {widgets.todaysTask.description && (
              <p className="text-sm text-indigo-900/60 mt-1">{widgets.todaysTask.description}</p>
            )}
          </div>
          <Link href="/tasks">
            <Button variant="outline" size="sm" className="rounded-xl border-green-200 text-green-700 hover:bg-green-100 shrink-0">
              Tapşırıqlara bax
            </Button>
          </Link>
        </div>
      )}

      {/* Active Programs */}
      {!widgetsLoading && (widgets?.activePrograms?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-indigo-950">Davam Edən Proqramlar</h2>
            <Link href="/programs" className="text-sm text-primary hover:underline flex items-center gap-1">
              Hamısına bax <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets!.activePrograms.map(prog => (
              <Link key={prog.id} href={`/programs/${prog.slug}`}>
                <div className="rounded-2xl border border-indigo-100 bg-white p-5 hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    {prog.coverImageUrl ? (
                      <img src={prog.coverImageUrl} alt={prog.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <GraduationCap className="h-6 w-6 text-indigo-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-indigo-950 truncate group-hover:text-primary transition-colors">{prog.title}</p>
                      <p className="text-xs text-indigo-400">{prog.completedLessonCount}/{prog.totalLessonCount} dərs</p>
                    </div>
                  </div>
                  <Progress value={prog.progressPct} className="h-1.5 rounded-full" />
                  <div className="flex justify-between text-xs text-indigo-400 mt-1.5">
                    <span>İrəliləyiş</span>
                    <span className="font-semibold text-primary">{prog.progressPct}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Test Progress + Certificate CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-indigo-100 shadow-sm p-6">
          <h3 className="font-bold text-indigo-950 mb-4">Şüur İnkişaf Qrafiki</h3>
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-indigo-700">Ümumi İrəliləyiş</span>
            <span className="text-primary">{stats?.progressPercent || 0}%</span>
          </div>
          <Progress value={stats?.progressPercent || 0} className="h-3 rounded-full bg-indigo-50 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
          {(widgets?.recentCertificates?.length ?? 0) > 0 && (
            <div className="mt-5 space-y-2">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-3">Son Sertifikatlar</p>
              {widgets!.recentCertificates.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <Award className="h-4 w-4 text-amber-500 shrink-0" />
                  <span className="text-sm font-medium text-indigo-900">{c.stageName}</span>
                  <span className="ml-auto text-xs text-indigo-400">{new Date(c.createdAt).toLocaleDateString("az-AZ")}</span>
                </div>
              ))}
            </div>
          )}
          {(stats?.totalTests ?? 0) === 0 && (
            <div className="mt-6 text-center py-4">
              <p className="text-indigo-900/50 mb-3 text-sm">Hələ heç bir test nəticəniz yoxdur.</p>
              <Link href="/test">
                <Button className="rounded-xl font-bold bg-primary">Testə Başla</Button>
              </Link>
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950 to-indigo-900 text-white p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle at 80% 20%, #818cf8 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 mb-4">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold mb-2">Sertifikat Alın</h3>
            <p className="text-indigo-200 text-sm leading-relaxed">Mərhələni tamamlayın və inkişafınızı təsdiqləyən rəsmi rəqəmsal sertifikat əldə edin.</p>
          </div>
          <Link href="/certificates" className="mt-6 relative z-10 block">
            <Button className="w-full h-11 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold">
              Sertifikatlara Bax
            </Button>
          </Link>
        </div>
      </div>

      {/* Recently Added Programs */}
      {!widgetsLoading && (widgets?.recentPrograms?.length ?? 0) > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-indigo-950">Yeni Əlavə Edilmiş Proqramlar</h2>
            <Link href="/programs" className="text-sm text-primary hover:underline flex items-center gap-1">
              Hamısına bax <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {widgets!.recentPrograms.map(p => (
              <Link key={p.id} href={`/programs/${p.slug}`}>
                <div className="rounded-2xl border border-indigo-100 bg-white overflow-hidden group hover:shadow-md transition-shadow cursor-pointer">
                  {p.coverImageUrl ? (
                    <img src={p.coverImageUrl} alt={p.title} className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                      <GraduationCap className="h-10 w-10 text-indigo-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="font-bold text-indigo-950 text-sm group-hover:text-primary transition-colors">{p.title}</p>
                    {p.description && <p className="text-xs text-indigo-400 mt-1 line-clamp-2">{p.description}</p>}
                    {p.difficulty && (
                      <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium">
                        {DIFFICULTY_LABEL[p.difficulty] || p.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recommended Articles + Life Stories */}
      {!widgetsLoading && ((widgets?.recommendedArticles?.length ?? 0) > 0 || (widgets?.recommendedStories?.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Articles */}
          {(widgets?.recommendedArticles?.length ?? 0) > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <h2 className="text-base font-bold text-indigo-950">Tövsiyə Olunan Məqalələr</h2>
              </div>
              <div className="space-y-3">
                {widgets!.recommendedArticles.map(a => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-indigo-100 hover:shadow-sm transition-shadow">
                    {a.coverImageUrl ? (
                      <img src={a.coverImageUrl} alt={a.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <BookOpen className="h-5 w-5 text-indigo-300" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-indigo-950 truncate">{a.title}</p>
                      {a.excerpt && <p className="text-xs text-indigo-400 truncate">{a.excerpt}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Life Stories */}
          {(widgets?.recommendedStories?.length ?? 0) > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="h-4 w-4 text-pink-400" />
                <h2 className="text-base font-bold text-indigo-950">Həyat Hekayələri</h2>
              </div>
              <div className="space-y-3">
                {widgets!.recommendedStories.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-indigo-100 hover:shadow-sm transition-shadow">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center shrink-0">
                        <Heart className="h-5 w-5 text-pink-300" />
                      </div>
                    )}
                    <p className="text-sm font-semibold text-indigo-950 flex-1 min-w-0 truncate">{s.title}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* If no programs or widgets yet — prompt to start */}
      {!widgetsLoading && !widgets?.continueLearning && (widgets?.recentPrograms?.length ?? 0) === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-indigo-100 p-8 text-center">
          <GraduationCap className="h-12 w-12 text-indigo-200 mx-auto mb-3" />
          <h3 className="font-bold text-indigo-950 mb-2">Öyrənməyə Başlayın</h3>
          <p className="text-indigo-400 text-sm mb-4">Proqramlar bölməsinə keçib birinci proqramınıza başlayın.</p>
          <Link href="/programs">
            <Button className="rounded-xl">Proqramlara bax <ChevronRight className="h-4 w-4 ml-1" /></Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, color, loading
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; sub: string; color: string; loading: boolean;
}) {
  return (
    <Card className="rounded-2xl border border-indigo-50 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-indigo-900/30 uppercase tracking-wide">{label}</span>
        </div>
        {loading ? (
          <div className="h-8 w-16 bg-indigo-50 rounded animate-pulse" />
        ) : (
          <div className="text-2xl font-black text-indigo-950">{value}</div>
        )}
        <div className="text-xs font-medium text-indigo-900/50 mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}
