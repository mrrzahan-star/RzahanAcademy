import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, FileText, Award, BookOpen } from "lucide-react";
import { adminFetch } from "./utils";

interface SearchResults {
  users: { id: number; firstName: string | null; lastName: string | null; email: string | null }[];
  tests: { id: number; userId: string; stageName: string; totalScore: number; createdAt: string; firstName?: string | null; lastName?: string | null }[];
  journals: { id: number; title: string; userId: string; createdAt: string }[];
  certificates: { id: number; certificateCode: string; stageName: string; userId: string }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SearchPanel({ open, onClose }: Props) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInput(val: string) {
    setQ(val);
    if (timer.current) clearTimeout(timer.current);
    if (!val.trim()) { setResults(null); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await adminFetch(`/api/admin/search?q=${encodeURIComponent(val.trim())}`);
        setResults(r);
      } catch { }
      finally { setLoading(false); }
    }, 350);
  }

  const totalResults = results
    ? results.users.length + (results.tests?.length ?? 0) + results.journals.length + results.certificates.length
    : 0;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-indigo-950">Qlobal Axtarış</DialogTitle>
        </DialogHeader>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <Input
            autoFocus
            value={q}
            onChange={e => handleInput(e.target.value)}
            placeholder="İstifadəçi, gündəlik, sertifikat..."
            className="pl-9 rounded-xl h-11 border-indigo-100 text-base"
          />
        </div>

        {loading && <div className="text-center py-6 text-indigo-400 text-sm">Axtarılır...</div>}

        {results && !loading && (
          <div className="mt-2 space-y-4 max-h-[400px] overflow-y-auto">
            {totalResults === 0 && (
              <div className="text-center py-8 text-indigo-400">Nəticə tapılmadı</div>
            )}

            {results.users.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
                  <Users className="h-3.5 w-3.5" /> İstifadəçilər
                </div>
                <div className="space-y-1">
                  {results.users.map(u => (
                    <div key={u.id} className="rounded-xl p-3 bg-indigo-50/40 hover:bg-indigo-50 transition-colors">
                      <div className="font-medium text-indigo-950 text-sm">
                        {[u.firstName, u.lastName].filter(Boolean).join(" ") || "İsimsiz"}
                      </div>
                      <div className="text-xs text-indigo-400">{u.email}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.tests && results.tests.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
                  <FileText className="h-3.5 w-3.5" /> Testlər
                </div>
                <div className="space-y-1">
                  {results.tests.map(t => (
                    <div key={t.id} className="rounded-xl p-3 bg-indigo-50/40 hover:bg-indigo-50 transition-colors flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-indigo-950 text-sm">{t.stageName}</div>
                        <div className="text-xs text-indigo-400">
                          {[t.firstName, t.lastName].filter(Boolean).join(" ") || t.userId.slice(0, 10) + "..."}
                        </div>
                      </div>
                      <span className="text-primary font-bold text-sm">{t.totalScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.journals.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
                  <BookOpen className="h-3.5 w-3.5" /> Gündəliklər
                </div>
                <div className="space-y-1">
                  {results.journals.map(j => (
                    <div key={j.id} className="rounded-xl p-3 bg-indigo-50/40 hover:bg-indigo-50 transition-colors">
                      <div className="font-medium text-indigo-950 text-sm truncate">{j.title}</div>
                      <div className="text-xs text-indigo-400">{new Date(j.createdAt).toLocaleDateString("az-AZ")}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.certificates.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
                  <Award className="h-3.5 w-3.5" /> Sertifikatlar
                </div>
                <div className="space-y-1">
                  {results.certificates.map(c => (
                    <div key={c.id} className="rounded-xl p-3 bg-indigo-50/40 hover:bg-indigo-50 transition-colors">
                      <div className="font-medium text-indigo-950 text-sm">{c.stageName}</div>
                      <div className="text-xs text-indigo-400 font-mono">{c.certificateCode}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
