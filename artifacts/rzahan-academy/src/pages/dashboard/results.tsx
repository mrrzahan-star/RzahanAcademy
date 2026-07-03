import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useGetTestResult, getGetTestResultQueryKey, useCreateComment } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STAGES, TEST_SECTIONS } from "@/lib/constants";
import { ArrowLeft, Award, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

function ReviewForm({ testResultId, stage, stageName }: { testResultId: number; stage: number; stageName: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { mutateAsync: createComment, isPending } = useCreateComment();
  const { toast } = useToast();

  async function handleSubmit() {
    if (rating === 0) { toast({ title: "Ulduz seçin", variant: "destructive" }); return; }
    if (content.trim().length < 10) { toast({ title: "Rəy ən az 10 simvol olmalıdır", variant: "destructive" }); return; }
    try {
      await createComment({ data: { content: content.trim(), rating } });
      setSubmitted(true);
    } catch {
      toast({ title: "Xəta baş verdi", variant: "destructive" });
    }
  }

  if (submitted) {
    return (
      <Card className="rounded-2xl border-none shadow-sm bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
            <Star className="h-6 w-6 text-green-600 fill-green-600" />
          </div>
          <h3 className="font-bold text-green-800 mb-1">Rəyiniz qəbul edildi!</h3>
          <p className="text-green-700/80 text-sm">Ana səhifədə görünəcək.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white">
      <CardHeader>
        <CardTitle className="text-lg text-indigo-950">Rəyinizi Bölüşün</CardTitle>
        <p className="text-sm text-indigo-900/50">Test təcrübənizi qiymətləndirin</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hover || rating) ? "text-amber-400 fill-amber-400" : "text-indigo-100 fill-indigo-100"
                }`}
              />
            </button>
          ))}
          {rating > 0 && <span className="text-sm font-semibold text-indigo-600 ml-2">{["", "Zəif", "Orta", "Yaxşı", "Çox Yaxşı", "Əla"][rating]}</span>}
        </div>
        <Textarea
          placeholder={`"${stageName}" mərhələsinə çatdığınız bu test haqqında fikirlərinizi paylaşın...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="rounded-xl border-indigo-100 min-h-[100px] resize-none"
        />
        <Button onClick={handleSubmit} disabled={isPending} className="rounded-xl bg-primary text-white font-bold">
          {isPending ? "Göndərilir..." : "Rəyi Göndər"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ConsciousnessOrbit({ currentStage }: { currentStage: number }) {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const cx = 160, cy = 160, radii = [30, 55, 80, 105, 120, 132, 140];

  return (
    <div className="relative w-[320px] h-[320px] mx-auto select-none">
      <svg width="320" height="320" viewBox="0 0 320 320">
        {STAGES.map((stage, i) => {
          const r = radii[i];
          const isActive = stage.id === currentStage;
          const isPast = stage.id < currentStage;
          return (
            <g key={stage.id}>
              <circle cx={cx} cy={cy} r={r} fill="none"
                stroke={isActive ? stage.color : isPast ? `${stage.color}40` : "#e0e7ff"}
                strokeWidth={isActive ? 2 : 1} strokeDasharray={isActive ? "none" : "4 4"} />
              {isActive && <circle cx={cx} cy={cy} r={r} fill="none" stroke={stage.color} strokeWidth={6} strokeOpacity={0.15} />}
            </g>
          );
        })}

        {STAGES.map((stage, i) => {
          const r = radii[i];
          const angle = -Math.PI / 2;
          const dotX = cx + r * Math.cos(angle);
          const dotY = cy + r * Math.sin(angle);
          const isActive = stage.id === currentStage;
          const isPast = stage.id < currentStage;

          return (
            <g key={`dot-${stage.id}`} style={{ cursor: "pointer" }}
              onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}>
              <circle cx={dotX} cy={dotY} r={isActive ? 14 : isPast ? 10 : 7}
                fill={isActive ? stage.color : isPast ? `${stage.color}80` : "#c7d2fe"} />
              {isActive && (
                <>
                  <circle cx={dotX} cy={dotY} r={20} fill={stage.color} fillOpacity={0.2} />
                  <circle cx={dotX} cy={dotY} r={26} fill={stage.color} fillOpacity={0.08} />
                </>
              )}
              <text x={dotX + (dotX > cx + 5 ? 20 : dotX < cx - 5 ? -20 : 0)}
                y={dotY + (dotY > cy + 5 ? 20 : dotY < cy - 5 ? -20 : 5)}
                textAnchor="middle" fontSize="9"
                fontWeight={isActive ? "900" : "600"}
                fill={isActive ? stage.color : isPast ? `${stage.color}cc` : "#a5b4fc"}>
                {stage.name}
              </text>
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r={22} fill="white" stroke="#e0e7ff" strokeWidth={2} />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="10" fontWeight="900" fill="#312e81">Siz</text>
      </svg>

      <AnimatePresence>
        {activeStage !== null && (() => {
          const s = STAGES.find(st => st.id === activeStage);
          if (!s) return null;
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-xl border border-indigo-100 p-4 z-20"
            >
              <div className="font-bold text-indigo-950 text-sm mb-1" style={{ color: s.color }}>{s.name}</div>
              <p className="text-xs text-indigo-900/70 leading-relaxed">{s.description}</p>
              <p className="text-xs text-indigo-500 mt-1 italic">Əsas sual: {s.coreQuestion}</p>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

function DevPlan({ stage }: { stage: typeof STAGES[0] }) {
  const [open, setOpen] = useState(false);
  const plans = [
    { period: "Bu gün", task: stage.todayTask },
    { period: "Bu həftə", task: stage.weekTask },
    { period: "Bu ay", task: stage.monthTask },
    { period: "Bu il", task: stage.yearTask },
  ];
  return (
    <Card className="rounded-2xl border-none shadow-sm bg-white">
      <CardHeader className="pb-2">
        <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-left">
          <CardTitle className="text-lg text-indigo-950">Şəxsi İnkişaf Planı</CardTitle>
          {open ? <ChevronUp className="h-5 w-5 text-indigo-400" /> : <ChevronDown className="h-5 w-5 text-indigo-400" />}
        </button>
      </CardHeader>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <CardContent className="pt-0 pb-6 space-y-3">
              {plans.map((p, i) => (
                <div key={i} className="flex gap-3 items-start p-3 rounded-xl bg-indigo-50/50">
                  <div className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-lg shrink-0 mt-0.5">{p.period}</div>
                  <p className="text-sm text-indigo-900/80 leading-relaxed">{p.task}</p>
                </div>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function ResultsPage() {
  const [, params] = useRoute("/results/:id");
  const id = parseInt(params?.id || "0");
  const { user } = useAuth();

  const { data: result, isLoading, isError } = useGetTestResult(id, {
    query: { enabled: !!id, queryKey: getGetTestResultQueryKey(id) }
  });

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (isError || !result) {
    return <div className="p-8 text-center text-red-500">Nəticə tapılmadı.</div>;
  }

  const stageInfo = STAGES.find(s => s.id === result.stage) || STAGES[0];
  const StageIcon = stageInfo.icon;

  let scores: Record<string, number> = {};
  if (result.scores) {
    scores = typeof result.scores === "string" ? JSON.parse(result.scores) : (result.scores as Record<string, number>);
  }

  const radarData = TEST_SECTIONS.map(sec => ({
    subject: sec.name, value: Math.round(((scores[`s${sec.id}`] || 0) / 25) * 100), fullMark: 100,
  }));

  const totalScore = result.totalScore || 0;
  const maxScore = 200;
  const devPercent = Math.round((totalScore / maxScore) * 100);
  const nextStagePercent = result.stage < 7
    ? Math.round(((totalScore - Math.floor((result.stage - 1) * maxScore / 7)) / (maxScore / 7)) * 100)
    : 100;

  const displayName = user?.fullName || user?.username || "";

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      <div>
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Panelə qayıt
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-indigo-950">Test Nəticəsi</h1>
        <p className="text-indigo-900/50 mt-1">{new Date(result.createdAt).toLocaleDateString("az-AZ")} tarixində tamamlanıb</p>
      </div>

      <Card className="rounded-[2rem] border-none shadow-[0_8px_40px_rgb(91,95,239,0.12)] bg-gradient-to-br from-indigo-950 via-[#1e1b6e] to-primary text-white overflow-hidden relative">
        <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-center md:text-left flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-4">
                Sizin Şüur Mərhələniz
              </div>
              {displayName && <p className="text-indigo-300 font-medium mb-2">{displayName}</p>}
              <h2 className="text-5xl font-black mb-3 drop-shadow-lg" style={{ color: stageInfo.color }}>{stageInfo.name}</h2>
              <p className="text-indigo-100 leading-relaxed mb-6 max-w-md">{stageInfo.description}</p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="bg-white/10 rounded-2xl px-4 py-3 text-center">
                  <div className="text-2xl font-black text-white">{devPercent}%</div>
                  <div className="text-xs text-indigo-300 uppercase tracking-wider">İnkişaf faizi</div>
                </div>
                <div className="bg-white/10 rounded-2xl px-4 py-3 text-center">
                  <div className="text-2xl font-black text-white">{result.stage}/7</div>
                  <div className="text-xs text-indigo-300 uppercase tracking-wider">Mərhələ</div>
                </div>
                {result.stage < 7 && (
                  <div className="bg-white/10 rounded-2xl px-4 py-3 text-center">
                    <div className="text-2xl font-black text-white">{Math.max(0, 100 - nextStagePercent)}%</div>
                    <div className="text-xs text-indigo-300 uppercase tracking-wider">Növbəti mərhələyə</div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl shrink-0"
              style={{ boxShadow: `0 0 40px ${stageInfo.color}40` }}>
              <StageIcon className="h-12 w-12" style={{ color: stageInfo.color }} />
            </div>
          </div>

          {result.stage < 7 && (
            <div className="mt-6">
              <div className="flex justify-between text-xs text-indigo-300 mb-1.5 font-semibold">
                <span>{stageInfo.name}</span><span>{STAGES[result.stage]?.name}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${nextStagePercent}%`, backgroundColor: stageInfo.color }} />
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/certificates">
              <Button className="rounded-2xl font-bold bg-white text-indigo-950 hover:bg-indigo-50 h-11 px-6 shadow-lg">
                <Award className="mr-2 h-4 w-4" /> Sertifikat Al
              </Button>
            </Link>
            <Link href="/test">
              <Button variant="outline" className="rounded-2xl font-bold border-white/30 text-white hover:bg-white/10 h-11 px-6">
                Testi Yenilə
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-none shadow-sm bg-white">
          <CardHeader><CardTitle className="text-lg text-indigo-950">Bilinç Radar Analizi</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#e0e7ff" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#4338ca", fontSize: 10, fontWeight: 700 }} />
                <Radar name="Siz" dataKey="value" stroke={stageInfo.color} fill={stageInfo.color}
                  fillOpacity={0.18} strokeWidth={2} dot={{ fill: stageInfo.color, r: 3 }}
                  animationBegin={200} animationDuration={900} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-950">Bilinç Orbiti</CardTitle>
            <p className="text-xs text-indigo-900/50">Mərhələlərə klik edərək izah oxuyun</p>
          </CardHeader>
          <CardContent className="flex justify-center"><ConsciousnessOrbit currentStage={result.stage} /></CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-white">
        <CardHeader><CardTitle className="text-lg text-indigo-950">Bölmələr üzrə Analiz</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEST_SECTIONS.map((sec) => {
            const val = scores[`s${sec.id}`] || 0;
            const pct = Math.round((val / 25) * 100);
            return (
              <div key={sec.id}>
                <div className="flex justify-between text-sm font-semibold mb-1.5">
                  <span className="text-indigo-950">{sec.name}</span>
                  <span className="text-primary">{val}/25</span>
                </div>
                <div className="h-2 rounded-full bg-indigo-50">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-2xl border-none shadow-sm bg-white">
          <CardHeader><CardTitle className="text-lg text-indigo-950">Güclü Tərəfləriniz</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stageInfo.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: stageInfo.color }} />
                <span className="text-sm text-indigo-900/80">{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-sm bg-white">
          <CardHeader><CardTitle className="text-lg text-indigo-950">Diqqət Etməli Olduğunuz Mövzular</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {stageInfo.focusAreas.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 bg-amber-400" />
                <span className="text-sm text-indigo-900/80">{s}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
        <CardHeader><CardTitle className="text-lg text-indigo-950">Növbəti Mərhələyə Keçmək Üçün Tövsiyə</CardTitle></CardHeader>
        <CardContent>
          <p className="text-indigo-900/80 leading-relaxed">{result.recommendations || stageInfo.nextStepAdvice}</p>
        </CardContent>
      </Card>

      <DevPlan stage={stageInfo} />
      <ReviewForm testResultId={result.id} stage={result.stage} stageName={result.stageName ?? ""} />
    </div>
  );
}
