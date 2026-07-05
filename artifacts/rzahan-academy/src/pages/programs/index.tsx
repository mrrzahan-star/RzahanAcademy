import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, BookOpen, Clock, GraduationCap, ChevronRight, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Program {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImageUrl: string | null;
  difficulty: string | null;
  instructor: string | null;
  durationHours: number | null;
  featured: boolean;
  moduleCount: number;
  lessonCount: number;
  progress: { pct: number; lastLessonId: number | null } | null;
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

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/programs")
      .then((r) => r.json())
      .then((d) => setPrograms(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = programs.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q);
    const matchDiff = diffFilter === "all" || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-indigo-950 tracking-tight">Proqramlar</h1>
        <p className="text-indigo-900/60 mt-1">Öz inkişaf yolunuzu seçin</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Proqram axtar..."
            className="pl-9 rounded-xl"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "Hamısı" },
            { value: "baslanqic", label: "Başlanğıc" },
            { value: "orta", label: "Orta" },
            { value: "peshkar", label: "Peşəkar" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDiffFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                diffFilter === opt.value
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white text-indigo-700 border border-indigo-100 hover:bg-indigo-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-4 w-4 text-amber-500" />
            <h2 className="text-lg font-bold text-indigo-950">Seçilmiş Proqramlar</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.map((p) => <ProgramCard key={p.id} program={p} featured />)}
          </div>
        </section>
      )}

      {/* All */}
      {rest.length > 0 && (
        <section>
          {featured.length > 0 && (
            <h2 className="text-lg font-bold text-indigo-950 mb-4">Bütün Proqramlar</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((p) => <ProgramCard key={p.id} program={p} />)}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <GraduationCap className="h-12 w-12 text-indigo-200 mx-auto mb-4" />
          <p className="text-indigo-900/50 font-medium">
            {programs.length === 0 ? "Hələ heç bir proqram yoxdur." : "Axtarışa uyğun proqram tapılmadı."}
          </p>
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program: p, featured }: { program: Program; featured?: boolean }) {
  const pct = p.progress?.pct ?? 0;
  const started = pct > 0;
  const diff = p.difficulty || "baslanqic";

  return (
    <Link href={`/programs/${p.slug}`}>
      <div className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white ${
        featured ? "border-amber-200/60 shadow-amber-50 shadow-md" : "border-indigo-100"
      }`}>
        {p.coverImageUrl ? (
          <div className="aspect-video w-full overflow-hidden bg-indigo-50">
            <img src={p.coverImageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ) : (
          <div className="aspect-video w-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
            <GraduationCap className="h-16 w-16 text-indigo-300" />
          </div>
        )}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-indigo-950 text-base leading-snug group-hover:text-primary transition-colors">{p.title}</h3>
            {featured && <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0 mt-0.5" />}
          </div>
          {p.description && (
            <p className="text-sm text-indigo-900/60 line-clamp-2">{p.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-xs rounded-lg ${DIFFICULTY_COLOR[diff] || "bg-gray-100 text-gray-600"}`}>
              {DIFFICULTY_LABEL[diff] || diff}
            </Badge>
            {p.durationHours && (
              <span className="flex items-center gap-1 text-xs text-indigo-500">
                <Clock className="h-3 w-3" />{p.durationHours} saat
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-indigo-500">
              <BookOpen className="h-3 w-3" />{p.lessonCount} dərs
            </span>
          </div>
          {started && (
            <div>
              <div className="flex justify-between text-xs text-indigo-500 mb-1">
                <span>İrəliləyiş</span>
                <span className="font-semibold text-primary">{pct}%</span>
              </div>
              <Progress value={pct} className="h-1.5 rounded-full" />
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-indigo-400">{p.instructor || "Rzahan"}</span>
            <span className={`flex items-center gap-1 text-xs font-semibold ${started ? "text-primary" : "text-indigo-400 group-hover:text-primary"} transition-colors`}>
              {started ? (pct === 100 ? "Tamamlandı ✓" : "Davam et") : "Başla"}
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
