import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { ChevronRight, ChevronLeft, Check, BookOpen, PlayCircle, FileText, ExternalLink, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LessonData {
  id: number;
  moduleId: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  contentHtml: string | null;
  youtubeUrl: string | null;
  audioUrl: string | null;
  pdfUrl: string | null;
  externalResourcesUrl: string | null;
  homework: string | null;
  reflectionQuestions: string | null;
  notes: string | null;
  durationMinutes: number | null;
  freePreview: boolean;
  status: string;
  sortOrder: number;
}

interface NavLesson {
  id: number;
  title: string;
  completed: boolean;
}

interface ProgramCtx {
  program: { id: number; title: string; slug: string };
  modules: { id: number; title: string; lessons: NavLesson[] }[];
  completedLessonIds: number[];
}

function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let videoId = u.searchParams.get("v");
    if (!videoId && u.hostname === "youtu.be") videoId = u.pathname.slice(1);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export default function LessonPage() {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [ctx, setCtx] = useState<ProgramCtx | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!slug || !lessonId) return;
    setLoading(true);
    setLesson(null);
    setCtx(null);

    Promise.all([
      fetch(`/api/programs/${slug}`).then((r) => r.json()),
    ])
      .then(([programData]) => {
        if (!programData.program) { setLoading(false); return; }
        const allLessons = (programData.modules || []).flatMap((m: any) => m.lessons);
        const found = allLessons.find((l: any) => l.id === parseInt(lessonId, 10));
        if (!found) { setLoading(false); return; }
        setLesson(found);
        setCtx(programData);
        setCompleted(found.completed ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, lessonId]);

  const allLessons = ctx?.modules.flatMap((m) => m.lessons) ?? [];
  const currentIdx = allLessons.findIndex((l) => l.id === parseInt(lessonId, 10));
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const markComplete = async () => {
    if (!user || !lesson || completed || marking) return;
    setMarking(true);
    try {
      const r = await fetch(`/api/programs/lessons/${lesson.id}/complete`, { method: "POST" });
      if (r.ok) {
        setCompleted(true);
        const d = await r.json();
        toast({
          title: "Dərs tamamlandı! 🎉",
          description: `İrəliləyiş: ${d.progressPct}%`,
        });
        if (nextLesson) {
          setTimeout(() => navigate(`/programs/${slug}/lessons/${nextLesson.id}`), 1200);
        }
      }
    } catch {
      toast({ title: "Xəta baş verdi", variant: "destructive" });
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!lesson || !ctx) {
    return (
      <div className="text-center py-20">
        <p className="text-indigo-900/50 font-medium">Dərs tapılmadı</p>
        <Link href="/programs">
          <Button variant="outline" className="mt-4 rounded-xl">Proqramlara qayıt</Button>
        </Link>
      </div>
    );
  }

  const embedUrl = lesson.youtubeUrl ? getYoutubeEmbedUrl(lesson.youtubeUrl) : null;

  return (
    <div className="animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-indigo-500 mb-5">
        <Link href="/programs" className="hover:text-primary transition-colors">Proqramlar</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/programs/${slug}`} className="hover:text-primary transition-colors">{ctx.program.title}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-indigo-950 font-medium truncate max-w-[200px]">{lesson.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
        <div className="space-y-5">
          {/* Header */}
          <div className="rounded-2xl bg-white border border-indigo-100 p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-indigo-950">{lesson.title}</h1>
            {lesson.subtitle && <p className="text-indigo-500 mt-1">{lesson.subtitle}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-indigo-400 flex-wrap">
              {lesson.durationMinutes && (
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{lesson.durationMinutes} dəq</span>
              )}
              {embedUrl && <span className="flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" />Video</span>}
              {lesson.contentHtml && <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Mətn</span>}
              {completed && (
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <Check className="h-3.5 w-3.5" />Tamamlandı
                </span>
              )}
            </div>
          </div>

          {/* Video */}
          {embedUrl && (
            <div className="rounded-2xl overflow-hidden shadow-sm aspect-video w-full bg-black">
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {/* Content */}
          {lesson.contentHtml && (
            <div className="rounded-2xl bg-white border border-indigo-100 p-6 shadow-sm">
              <h2 className="font-bold text-indigo-950 mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />Dərs mətni
              </h2>
              <div
                className="prose prose-indigo max-w-none text-indigo-900/80 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
              />
            </div>
          )}

          {/* Homework */}
          {lesson.homework && (
            <div className="rounded-2xl bg-amber-50 border border-amber-100 p-6">
              <h2 className="font-bold text-amber-800 mb-3">📝 Ev tapşırığı</h2>
              <p className="text-amber-700 whitespace-pre-wrap">{lesson.homework}</p>
            </div>
          )}

          {/* Reflection */}
          {lesson.reflectionQuestions && (
            <div className="rounded-2xl bg-violet-50 border border-violet-100 p-6">
              <h2 className="font-bold text-violet-800 mb-3">🤔 Düşündürücü suallar</h2>
              <p className="text-violet-700 whitespace-pre-wrap">{lesson.reflectionQuestions}</p>
            </div>
          )}

          {/* Notes */}
          {lesson.notes && (
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-6">
              <h2 className="font-bold text-blue-800 mb-3">💡 Qeydlər</h2>
              <p className="text-blue-700 whitespace-pre-wrap">{lesson.notes}</p>
            </div>
          )}

          {/* Resources */}
          <div className="flex flex-wrap gap-3">
            {lesson.pdfUrl && (
              <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors">
                <FileText className="h-4 w-4" />PDF Yüklə
              </a>
            )}
            {lesson.audioUrl && (
              <a href={lesson.audioUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-medium hover:bg-indigo-100 transition-colors">
                🎵 Audio dinlə
              </a>
            )}
            {lesson.externalResourcesUrl && (
              <a href={lesson.externalResourcesUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors">
                <ExternalLink className="h-4 w-4" />Əlavə resurslar
              </a>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div>
              {prevLesson && (
                <Link href={`/programs/${slug}/lessons/${prevLesson.id}`}>
                  <button className="flex items-center gap-2 text-sm text-indigo-500 hover:text-primary transition-colors group">
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:block">Əvvəlki</span>
                    <span className="text-indigo-400 group-hover:text-primary max-w-[140px] truncate">{prevLesson.title}</span>
                  </button>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {user && !completed && (
                <Button onClick={markComplete} disabled={marking} className="rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20 text-white">
                  <Check className="h-4 w-4 mr-2" />
                  {marking ? "..." : "Tamamlandı işarələ"}
                </Button>
              )}
              {nextLesson && (
                <Link href={`/programs/${slug}/lessons/${nextLesson.id}`}>
                  <Button variant="outline" className="rounded-xl">
                    Növbəti <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar — curriculum */}
        <div className="rounded-2xl bg-white border border-indigo-100 shadow-sm h-fit sticky top-4 overflow-hidden">
          <div className="p-4 border-b border-indigo-50">
            <h3 className="font-bold text-indigo-950 text-sm">Proqram Planı</h3>
            <Link href={`/programs/${slug}`} className="text-xs text-primary hover:underline">
              ← Proqrama qayıt
            </Link>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {ctx.modules.map((mod, mIdx) => (
              <div key={mod.id}>
                <div className="px-4 py-2.5 bg-indigo-50/60 border-b border-indigo-50">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    {mIdx + 1}. {mod.title}
                  </p>
                </div>
                {mod.lessons.map((l, lIdx) => {
                  const isCurrent = l.id === parseInt(lessonId, 10);
                  return (
                    <Link key={l.id} href={`/programs/${slug}/lessons/${l.id}`}>
                      <div className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors border-b border-indigo-50/50 last:border-0 ${
                        isCurrent ? "bg-primary/5 border-l-2 border-l-primary" : "hover:bg-indigo-50/40"
                      }`}>
                        <span className="shrink-0">
                          {l.completed ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[8px] ${isCurrent ? "border-primary text-primary font-bold" : "border-indigo-200 text-indigo-300"}`}>
                              {mIdx + 1}.{lIdx + 1}
                            </span>
                          )}
                        </span>
                        <span className={`truncate leading-tight ${
                          isCurrent ? "text-primary font-semibold" : l.completed ? "text-indigo-400" : "text-indigo-700"
                        }`}>
                          {l.title}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
