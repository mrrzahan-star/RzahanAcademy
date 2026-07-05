import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { ChevronRight, BookOpen, Clock, CheckCircle2, Circle, Lock, PlayCircle, ChevronDown, ChevronUp, ArrowLeft, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

interface Lesson {
  id: number;
  title: string;
  subtitle: string | null;
  durationMinutes: number | null;
  youtubeUrl: string | null;
  freePreview: boolean;
  status: string;
  completed: boolean;
}

interface Module {
  id: number;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

interface ProgramDetail {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  fullDescription: string | null;
  coverImageUrl: string | null;
  difficulty: string | null;
  instructor: string | null;
  durationHours: number | null;
  language: string | null;
  certificateAvailable: boolean;
  packageId: number | null;
}

interface Progress {
  progressPct: number;
  lastLessonId: number | null;
  completedLessonCount: number;
  totalLessonCount: number;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  baslanqic: "Başlanğıc",
  orta: "Orta",
  peshkar: "Peşəkar",
};
const DIFFICULTY_COLOR: Record<string, string> = {
  baslanqic: "bg-green-100 text-green-700",
  orta: "bg-amber-100 text-amber-700",
  peshkar: "bg-red-100 text-red-700",
};

export default function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [program, setProgram] = useState<ProgramDetail | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openModules, setOpenModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/programs/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((d) => {
        setProgram(d.program);
        setModules(d.modules || []);
        setProgress(d.progress || null);
        if (d.modules?.length > 0) setOpenModules(new Set([d.modules[0].id]));
      })
      .catch(() => setError("Proqram tapılmadı"))
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleModule = (id: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allLessons = modules.flatMap((m) => m.lessons);
  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => l.completed).length;
  const pct = progress?.progressPct ?? (totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0);

  const continueLesson = () => {
    if (progress?.lastLessonId) {
      navigate(`/programs/${slug}/lessons/${progress.lastLessonId}`);
      return;
    }
    const first = allLessons[0];
    if (first) navigate(`/programs/${slug}/lessons/${first.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="text-center py-20">
        <GraduationCap className="h-12 w-12 text-indigo-200 mx-auto mb-4" />
        <p className="text-indigo-900/50 font-medium">{error || "Proqram tapılmadı"}</p>
        <Link href="/programs">
          <Button variant="outline" className="mt-4 rounded-xl">Proqramlara qayıt</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-indigo-500">
        <Link href="/programs" className="hover:text-primary transition-colors">Proqramlar</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-indigo-950 font-medium">{program.title}</span>
      </nav>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-white border border-indigo-100 shadow-sm">
        {program.coverImageUrl && (
          <div className="aspect-[3/1] w-full overflow-hidden">
            <img src={program.coverImageUrl} alt={program.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {program.difficulty && (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${DIFFICULTY_COLOR[program.difficulty] || "bg-gray-100 text-gray-600"}`}>
                    {DIFFICULTY_LABEL[program.difficulty] || program.difficulty}
                  </span>
                )}
                {program.certificateAvailable && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-violet-100 text-violet-700">🏅 Sertifikat</span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-indigo-950">{program.title}</h1>
              {program.description && (
                <p className="text-indigo-900/70 leading-relaxed">{program.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-500">
                {program.instructor && (
                  <span className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                      {program.instructor[0]}
                    </div>
                    {program.instructor}
                  </span>
                )}
                {program.durationHours && (
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{program.durationHours} saat</span>
                )}
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{totalLessons} dərs</span>
                {program.language && <span>{program.language}</span>}
              </div>
            </div>

            {/* Progress card */}
            <div className="md:w-72 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5 space-y-4 shrink-0">
              {totalLessons > 0 ? (
                <>
                  <div>
                    <div className="flex justify-between text-sm font-medium text-indigo-700 mb-2">
                      <span>İrəliləyiş</span>
                      <span>{completedCount}/{totalLessons} dərs</span>
                    </div>
                    <Progress value={pct} className="h-2 rounded-full" />
                    <p className="text-right text-xs text-indigo-500 mt-1">{pct}% tamamlandı</p>
                  </div>
                  {user ? (
                    <Button onClick={continueLesson} className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20">
                      {pct === 0 ? "Başla" : pct === 100 ? "Yenidən bax" : "Davam et"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Link href="/sign-in">
                      <Button className="w-full rounded-xl">Giriş et və başla</Button>
                    </Link>
                  )}
                </>
              ) : (
                <p className="text-sm text-indigo-400 text-center py-2">Tezliklə dərslər əlavə olunacaq</p>
              )}
            </div>
          </div>

          {program.fullDescription && (
            <div className="mt-6 pt-6 border-t border-indigo-50">
              <h2 className="font-bold text-indigo-950 mb-2">Proqram haqqında</h2>
              <p className="text-indigo-900/70 leading-relaxed whitespace-pre-wrap">{program.fullDescription}</p>
            </div>
          )}
        </div>
      </div>

      {/* Curriculum */}
      {modules.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-indigo-950 mb-4">Proqram Planı</h2>
          <div className="space-y-3">
            {modules.map((mod, mIdx) => {
              const isOpen = openModules.has(mod.id);
              const modCompleted = mod.lessons.filter((l) => l.completed).length;
              return (
                <div key={mod.id} className="rounded-2xl border border-indigo-100 bg-white overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-indigo-50/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      {mIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-indigo-950">{mod.title}</h3>
                      {mod.description && (
                        <p className="text-sm text-indigo-500 truncate">{mod.description}</p>
                      )}
                    </div>
                    <span className="text-xs text-indigo-400 shrink-0">{modCompleted}/{mod.lessons.length} dərs</span>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-indigo-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-indigo-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-indigo-50">
                      {mod.lessons.length === 0 ? (
                        <p className="px-5 py-3 text-sm text-indigo-400">Bu modulda hələ dərs yoxdur</p>
                      ) : (
                        mod.lessons.map((lesson, lIdx) => (
                          <Link key={lesson.id} href={`/programs/${slug}/lessons/${lesson.id}`}>
                            <div className="flex items-center gap-4 px-5 py-3 hover:bg-indigo-50/50 transition-colors border-b border-indigo-50/60 last:border-0 cursor-pointer group">
                              <div className="shrink-0">
                                {lesson.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                ) : lesson.youtubeUrl ? (
                                  <PlayCircle className="h-5 w-5 text-indigo-300 group-hover:text-primary transition-colors" />
                                ) : (
                                  <Circle className="h-5 w-5 text-indigo-200 group-hover:text-primary/60 transition-colors" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${lesson.completed ? "text-indigo-400 line-through" : "text-indigo-900 group-hover:text-primary transition-colors"}`}>
                                  {mIdx + 1}.{lIdx + 1} {lesson.title}
                                </p>
                                {lesson.subtitle && (
                                  <p className="text-xs text-indigo-400 truncate">{lesson.subtitle}</p>
                                )}
                              </div>
                              {lesson.durationMinutes && (
                                <span className="text-xs text-indigo-400 shrink-0 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />{lesson.durationMinutes} dəq
                                </span>
                              )}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
