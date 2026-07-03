import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { adminFetch, fmtDate, fmtDateTime, type UserProfileDetail } from "./utils";

interface Props {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}

type ProfileTab = "info" | "tests" | "certs" | "journals" | "tasks";

export function UserProfileDrawer({ userId, open, onClose }: Props) {
  const [detail, setDetail] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<ProfileTab>("info");

  useEffect(() => {
    if (!open || !userId) { setDetail(null); return; }
    setLoading(true);
    setTab("info");
    adminFetch(`/api/admin/users/${userId}/profile`)
      .then(d => setDetail(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, userId]);

  const p = detail?.profile;
  const fullName = p ? [p.firstName, p.lastName].filter(Boolean).join(" ") || "İsimsiz" : "";

  const tabs: { id: ProfileTab; label: string; count?: number }[] = [
    { id: "info", label: "Məlumat" },
    { id: "tests", label: "Testlər", count: detail?.tests.length },
    { id: "certs", label: "Sertifikatlar", count: detail?.certificates.length },
    { id: "journals", label: "Gündəlik", count: detail?.journals.length },
    { id: "tasks", label: "Tapşırıqlar", count: detail?.dailyTasks.length },
  ];

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <div className="p-6 pb-0 border-b border-indigo-50">
          <DialogHeader>
            <DialogTitle className="text-indigo-950 text-lg">
              {loading ? "Yüklənir..." : fullName}
            </DialogTitle>
          </DialogHeader>
          {p && (
            <div className="flex items-center gap-4 mt-3 pb-4 flex-wrap">
              <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg overflow-hidden shrink-0">
                {p.avatarUrl ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" /> : (p.firstName?.[0] || "U")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-indigo-500">{p.email}</div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {p.consciousnessStage && <Badge variant="secondary" className="text-xs">{p.consciousnessStage}</Badge>}
                  {p.isBlocked && <Badge variant="destructive" className="text-xs">Bloklu</Badge>}
                  <span className="text-xs text-indigo-400">Sıra: #{detail?.leaderboardRank ?? "—"}</span>
                </div>
              </div>
              <div className="text-xs text-indigo-400">Qeydiyyat: {fmtDate(p.createdAt)}</div>
            </div>
          )}
          {/* Inner tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none -mb-px">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                  tab === t.id ? "border-primary text-primary" : "border-transparent text-indigo-400 hover:text-indigo-700"
                }`}>
                {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}

          {!loading && detail && (
            <>
              {tab === "info" && (
                <div className="space-y-4">
                  {[
                    ["Ad", p?.firstName], ["Soyad", p?.lastName], ["E-poçt", p?.email],
                    ["Bio", p?.bio], ["Şüur Mərhələsi", p?.consciousnessStage],
                    ["Şüur Səviyyəsi", p?.consciousnessLevel], ["Streak", `${p?.streak} gün`],
                    ["Tamamlanan Tapşırıqlar", p?.tasksCompleted],
                    ["Son Aktivlik", p?.lastActiveAt ? fmtDateTime(p.lastActiveAt) : "—"],
                    ["Qeydiyyat", p?.createdAt ? fmtDateTime(p.createdAt) : "—"],
                  ].map(([label, value]) => value !== null && value !== undefined && (
                    <div key={String(label)} className="flex justify-between py-2 border-b border-indigo-50/60">
                      <span className="text-sm font-medium text-indigo-500">{label}</span>
                      <span className="text-sm text-indigo-950 font-semibold">{String(value) || "—"}</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "tests" && (
                <div className="space-y-2">
                  {detail.tests.length === 0 && <div className="text-center py-12 text-indigo-400">Test tapılmadı</div>}
                  {detail.tests.map(t => (
                    <div key={t.id} className="rounded-xl border border-indigo-50 p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-indigo-950 text-sm">{t.stageName}</div>
                        <div className="text-xs text-indigo-400">{fmtDate(t.createdAt)}</div>
                      </div>
                      <span className="text-primary font-black text-lg">{t.totalScore}</span>
                    </div>
                  ))}
                </div>
              )}

              {tab === "certs" && (
                <div className="space-y-2">
                  {detail.certificates.length === 0 && <div className="text-center py-12 text-indigo-400">Sertifikat tapılmadı</div>}
                  {detail.certificates.map(c => (
                    <div key={c.id} className="rounded-xl border border-indigo-50 p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-indigo-950 text-sm">{c.stageName}</div>
                        <div className="text-xs font-mono text-indigo-400">{c.certificateCode}</div>
                      </div>
                      <div className="text-xs text-indigo-400">{fmtDate(c.issuedAt)}</div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "journals" && (
                <div className="space-y-2">
                  {detail.journals.length === 0 && <div className="text-center py-12 text-indigo-400">Gündəlik tapılmadı</div>}
                  {detail.journals.map(j => (
                    <div key={j.id} className="rounded-xl border border-indigo-50 p-3">
                      <div className="font-semibold text-indigo-950 text-sm truncate">{j.title}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{j.category}</Badge>
                        <span className="text-xs text-indigo-400">{fmtDate(j.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tab === "tasks" && (
                <div className="space-y-2">
                  {detail.dailyTasks.length === 0 && <div className="text-center py-12 text-indigo-400">Tapşırıq tapılmadı</div>}
                  {detail.dailyTasks.map(t => (
                    <div key={t.id} className="rounded-xl border border-indigo-50 p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm text-indigo-950 font-medium">{t.taskSlot}</div>
                        <div className="text-xs text-indigo-400">{t.date}</div>
                      </div>
                      <Badge variant={t.done ? "default" : "secondary"} className="text-xs">
                        {t.done ? "Tamamlandı" : "Gözləyir"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
