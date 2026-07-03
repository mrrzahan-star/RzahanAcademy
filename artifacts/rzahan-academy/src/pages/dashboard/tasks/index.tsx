import { useState, useEffect, useCallback } from "react";
import { useGetLatestTestResult, getGetLatestTestResultQueryKey } from "@workspace/api-client-react";
import { STAGES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, RefreshCw, ListTodo } from "lucide-react";
import { getToken } from "@/lib/api";

interface Task {
  id: string;
  text: string;
  category: string;
  done: boolean;
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

function buildTasks(stage: typeof STAGES[0]): Task[] {
  const base: Array<{ text: string; category: string }> = [
    { text: stage.todayTask, category: "Gündəlik" },
    { text: `"${stage.coreQuestion}" sualını gündəlik meditasiyada araşdır`, category: "Refleksiya" },
    { text: "10 dəqiqə meditasiya et", category: "Praktika" },
    { text: "Bir güclü tərəfini kiməsə paylaş", category: "Sosial" },
    { text: `${stage.name} mərhələsi haqqında oxu`, category: "Öyrənmə" },
    { text: "Bir inkişaf qeydini jurnala yaz", category: "Jurnal" },
    { text: "Bir nəfərə kömək et", category: "Mərhəmət" },
  ];
  return base.map((t, i) => ({ id: `task-${i}`, ...t, done: false }));
}

async function apiFetch(url: string, options?: RequestInit) {
  const token = getToken();
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return null;
  return res.json();
}

export default function TasksPage() {
  const { data: latestResult } = useGetLatestTestResult({
    query: { queryKey: getGetLatestTestResultQueryKey(), retry: false }
  });

  const stageInfo = STAGES.find(s => s.id === (latestResult?.stage ?? 1)) || STAGES[0];
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    const fresh = buildTasks(stageInfo);
    try {
      const { doneSlots } = await apiFetch("/api/tasks/today");
      const merged = fresh.map(t => ({ ...t, done: doneSlots.includes(t.id) }));
      setTasks(merged);
    } catch {
      setTasks(fresh);
    } finally {
      setLoading(false);
    }
  }, [stageInfo.id]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const toggle = async (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    try {
      await apiFetch(`/api/tasks/${id}/toggle`, { method: "POST" });
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
    }
  };

  const resetAll = async () => {
    const fresh = buildTasks(stageInfo);
    setTasks(fresh);
    try {
      await Promise.all(
        fresh.filter((_, i) => {
          const existing = tasks[i];
          return existing?.done;
        }).map(t => apiFetch(`/api/tasks/${t.id}/toggle`, { method: "POST" }))
      );
    } catch { /* ignore */ }
    await loadTasks();
  };

  const doneCount = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const categories = Array.from(new Set(tasks.map(t => t.category)));

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-indigo-50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-indigo-950">Gündəlik Tapşırıqlar</h1>
          <p className="text-indigo-900/50 text-sm mt-1">
            {stageInfo.name} mərhələsinə uyğun tapşırıqlar — {getTodayStr()}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={resetAll}
          className="rounded-2xl font-bold border-indigo-200 text-indigo-950 h-11 px-4 hover:bg-indigo-50"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Yenilə
        </Button>
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-3xl font-black text-indigo-950">{doneCount}</span>
              <span className="text-indigo-900/50 font-medium"> / {total} tapşırıq</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-primary">{pct}%</div>
              <div className="text-xs text-indigo-900/40 font-medium uppercase tracking-wider">Tamamlandı</div>
            </div>
          </div>
          <Progress
            value={pct}
            className="h-3 rounded-full bg-white/60 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent [&>div]:transition-all [&>div]:duration-500"
          />
          {pct === 100 && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm font-bold text-primary mt-3"
            >
              Əla! Bütün tapşırıqları tamamladınız.
            </motion.p>
          )}
        </CardContent>
      </Card>

      {categories.map(cat => (
        <Card key={cat} className="rounded-2xl border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary/60">{cat}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {tasks.filter(t => t.category === cat).map(task => (
              <motion.button
                key={task.id}
                onClick={() => toggle(task.id)}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  task.done
                    ? "border-primary/20 bg-primary/3 opacity-70"
                    : "border-indigo-100 bg-slate-50/80 hover:border-primary/30 hover:bg-indigo-50/60"
                }`}
              >
                <AnimatePresence mode="wait">
                  {task.done ? (
                    <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    </motion.div>
                  ) : (
                    <motion.div key="todo" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Circle className="h-5 w-5 text-indigo-300 shrink-0" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span className={`text-sm font-medium leading-relaxed ${task.done ? "line-through text-indigo-900/40" : "text-indigo-950"}`}>
                  {task.text}
                </span>
              </motion.button>
            ))}
          </CardContent>
        </Card>
      ))}

      {tasks.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
            <ListTodo className="h-8 w-8 text-indigo-300" />
          </div>
          <p className="text-indigo-900/40 font-medium">Tapşırıqlar yüklənir...</p>
        </div>
      )}
    </div>
  );
}
