import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Award, MessageSquare, BarChart3, ShieldOff, CalendarDays, BookOpen, ListChecks } from "lucide-react";
import { motion } from "framer-motion";
import type { AdminStats } from "./utils";

interface Props { stats: AdminStats; }

export function AdminStats({ stats }: Props) {
  const cards = [
    { label: "İstifadəçilər", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Testlər", value: stats.totalTests, icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Sertifikatlar", value: stats.totalCertificates, icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Rəylər", value: stats.totalComments, icon: MessageSquare, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Gözləyən Rəylər", value: stats.pendingComments, icon: BarChart3, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Bloklu", value: stats.blockedUsers, icon: ShieldOff, color: "text-red-600", bg: "bg-red-50" },
    { label: "Bu gün aktiv", value: stats.activeToday, icon: Users, color: "text-green-600", bg: "bg-green-50" },
    { label: "Bu gün (qeydiyyat)", value: stats.todayUsers, icon: CalendarDays, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Bu gün (test)", value: stats.todayTests, icon: FileText, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Bu gün (sertifikat)", value: stats.todayCerts, icon: Award, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Gündəliklər", value: stats.totalJournals, icon: BookOpen, color: "text-pink-600", bg: "bg-pink-50" },
    { label: "Günlük Tapşırıqlar", value: stats.totalDailyTasks, icon: ListChecks, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-8">
      {cards.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
          <Card className="rounded-2xl border-none shadow-[0_4px_20px_0_rgba(91,95,239,0.06)]">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-2`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black text-indigo-950">{s.value}</div>
              <div className="text-xs font-medium text-indigo-900/50 mt-0.5 leading-tight">{s.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
