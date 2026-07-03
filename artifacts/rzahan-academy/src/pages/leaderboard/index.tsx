import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardEntry {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  consciousnessLevel: number | null;
  consciousnessStage: string | null;
  streak: number;
  tasksCompleted: number;
  testCount: number;
  noteCount: number;
  badgeCount: number;
  progressPercent: number;
  activityScore: number;
}

const STAGE_COLORS = [
  "#64748b", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#6366f1",
];

/* ── Demo leaderboard ─────────────────────────────────────────────────────────
 * Shown ONLY when the real leaderboard is empty (no registered users yet).
 * Never stored in the database — exists purely in the frontend.
 * Automatically hidden the moment real users appear in the leaderboard.
 * ───────────────────────────────────────────────────────────────────────────── */
const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { userId: "demo-1", firstName: "Aytən", lastName: "M.", avatarUrl: null, consciousnessLevel: 7, consciousnessStage: "Yaradıcı", streak: 42, tasksCompleted: 189, testCount: 8, noteCount: 54, badgeCount: 7, progressPercent: 100, activityScore: 1247 },
  { userId: "demo-2", firstName: "Orxan", lastName: "H.", avatarUrl: null, consciousnessLevel: 6, consciousnessStage: "Sehrbaz", streak: 31, tasksCompleted: 143, testCount: 6, noteCount: 38, badgeCount: 6, progressPercent: 86, activityScore: 984 },
  { userId: "demo-3", firstName: "Nigar", lastName: "Ə.", avatarUrl: null, consciousnessLevel: 6, consciousnessStage: "Sehrbaz", streak: 28, tasksCompleted: 127, testCount: 5, noteCount: 29, badgeCount: 6, progressPercent: 86, activityScore: 871 },
  { userId: "demo-4", firstName: "Tural", lastName: "Q.", avatarUrl: null, consciousnessLevel: 5, consciousnessStage: "İnteqrator", streak: 21, tasksCompleted: 98, testCount: 4, noteCount: 22, badgeCount: 5, progressPercent: 71, activityScore: 723 },
  { userId: "demo-5", firstName: "Sevinc", lastName: "R.", avatarUrl: null, consciousnessLevel: 5, consciousnessStage: "İnteqrator", streak: 19, tasksCompleted: 84, testCount: 4, noteCount: 18, badgeCount: 5, progressPercent: 71, activityScore: 641 },
  { userId: "demo-6", firstName: "Fərid", lastName: "B.", avatarUrl: null, consciousnessLevel: 4, consciousnessStage: "Görən", streak: 14, tasksCompleted: 63, testCount: 3, noteCount: 15, badgeCount: 4, progressPercent: 57, activityScore: 498 },
  { userId: "demo-7", firstName: "Lalə", lastName: "K.", avatarUrl: null, consciousnessLevel: 4, consciousnessStage: "Görən", streak: 12, tasksCompleted: 57, testCount: 3, noteCount: 11, badgeCount: 4, progressPercent: 57, activityScore: 432 },
  { userId: "demo-8", firstName: "Elnur", lastName: "S.", avatarUrl: null, consciousnessLevel: 3, consciousnessStage: "Axtaran", streak: 9, tasksCompleted: 42, testCount: 2, noteCount: 8, badgeCount: 3, progressPercent: 43, activityScore: 318 },
  { userId: "demo-9", firstName: "Gülnar", lastName: "A.", avatarUrl: null, consciousnessLevel: 3, consciousnessStage: "Axtaran", streak: 7, tasksCompleted: 35, testCount: 2, noteCount: 6, badgeCount: 3, progressPercent: 43, activityScore: 264 },
  { userId: "demo-10", firstName: "Kamran", lastName: "Y.", avatarUrl: null, consciousnessLevel: 2, consciousnessStage: "Oyanmaqda", streak: 4, tasksCompleted: 21, testCount: 1, noteCount: 3, badgeCount: 2, progressPercent: 29, activityScore: 147 },
];

function AvatarCell({ entry }: { entry: LeaderboardEntry }) {
  const name = [entry.firstName, entry.lastName].filter(Boolean).join(" ") || "İstifadəçi";
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 overflow-hidden shrink-0">
        {entry.avatarUrl
          ? <img src={entry.avatarUrl} alt={name} className="w-full h-full object-cover" />
          : <span className="text-base">{name[0]}</span>}
      </div>
      <span className="font-semibold text-indigo-950 truncate">{name}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const isDemo = !loading && data.length === 0;
  const displayData = isDemo ? DEMO_LEADERBOARD : data;

  const myRank = user ? data.findIndex((e) => e.userId === user.id) + 1 : 0;
  const myEntry = user ? data.find((e) => e.userId === user.id) : null;

  return (
    <PublicLayout>
      <div className="py-12 md:py-20 bg-gradient-to-b from-indigo-50/60 to-white min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 font-medium text-sm mb-4">
              <Trophy className="h-4 w-4" /> TOP 100
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-4">Aktiv İştirakçılar</h1>
            <p className="text-lg text-indigo-900/60 max-w-xl mx-auto">
              Test sayı, tamamlanan tapşırıqlar, qeydlər, streak, sertifikat və inkişaf faizinə görə aktivlik balı
            </p>
          </motion.div>

          {/* My rank card — only when real data exists */}
          {myEntry && (
            <Card className="mb-8 rounded-2xl border-2 border-primary/20 bg-primary/5 shadow-none">
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {myRank}
                  </div>
                  <AvatarCell entry={myEntry} />
                  <span className="text-xs text-indigo-600 font-semibold bg-primary/10 px-2 py-0.5 rounded-full">Siz</span>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm font-semibold text-indigo-800">
                  <div className="text-center">
                    <div className="text-lg font-black text-primary">{myEntry.activityScore}</div>
                    <div className="text-xs text-indigo-600/60">Bal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-black text-orange-500 flex items-center gap-1">
                      <Flame className="h-4 w-4" />{myEntry.streak}
                    </div>
                    <div className="text-xs text-indigo-600/60">Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl bg-indigo-50 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {isDemo && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium"
                >
                  <span className="text-base">🏆</span>
                  Platforma açıldıqdan sonra real iştirakçılar burada görünəcək. İlk sıraya siz girib bilərsiniz!
                </motion.div>
              )}

              <div className="space-y-2">
                {displayData.map((entry, idx) => {
                  const isMe = !isDemo && user?.id === entry.userId;
                  const rank = idx + 1;
                  const stageColor = STAGE_COLORS[(entry.consciousnessLevel ?? 1) - 1] || "#6366f1";
                  return (
                    <motion.div key={entry.userId} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(idx * 0.03, 0.5) }}>
                      <Card className={`rounded-2xl border shadow-none transition-all ${
                        isMe ? "border-primary/30 bg-primary/5" : "border-indigo-50 bg-white hover:border-indigo-100 hover:shadow-sm"
                      } ${isDemo ? "opacity-80" : ""}`}>
                        <CardContent className="px-4 py-3 flex items-center gap-3">
                          <div className={`w-8 text-center font-black text-sm shrink-0 ${
                            rank === 1 ? "text-amber-500" : rank === 2 ? "text-slate-400" : rank === 3 ? "text-amber-700" : "text-indigo-300"
                          }`}>
                            {rank <= 3 ? ["🥇","🥈","🥉"][rank-1] : rank}
                          </div>
                          <div className="flex-1 min-w-0"><AvatarCell entry={entry} /></div>
                          <div className="hidden sm:block shrink-0">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                              style={{ backgroundColor: stageColor }}>
                              {entry.consciousnessStage || `M${entry.consciousnessLevel}`}
                            </span>
                          </div>
                          <div className="hidden md:flex items-center gap-4 shrink-0 text-xs text-indigo-900/60">
                            <div className="font-bold text-orange-500 flex items-center gap-0.5">
                              <Flame className="h-3 w-3" />{entry.streak}
                            </div>
                            <div className="font-bold text-indigo-600">{entry.progressPercent}%</div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-lg font-black text-primary">{entry.activityScore}</div>
                            <div className="text-xs text-indigo-600/50">bal</div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-10 p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
            <div className="flex items-center gap-2 mb-3 font-bold text-indigo-950">
              <TrendingUp className="h-4 w-4 text-primary" /> Aktivlik Balı Necə Hesablanır?
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-indigo-900/70">
              <div>1 Streak günü = <span className="font-bold text-indigo-950">10 bal</span></div>
              <div>1 Sertifikat = <span className="font-bold text-indigo-950">20 bal</span></div>
              <div>1 Test = <span className="font-bold text-indigo-950">15 bal</span></div>
              <div>1 Tapşırıq = <span className="font-bold text-indigo-950">5 bal</span></div>
              <div>1 Jurnal qeydi = <span className="font-bold text-indigo-950">3 bal</span></div>
              <div>İnkişaf % = <span className="font-bold text-indigo-950">2 bal/1%</span></div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
