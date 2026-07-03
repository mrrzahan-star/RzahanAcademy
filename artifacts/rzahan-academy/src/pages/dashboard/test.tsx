import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useSubmitTest } from "@workspace/api-client-react";
import { QUESTIONS, ANSWER_OPTIONS, TEST_SECTIONS, TEST_STORAGE_KEY } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export default function TestPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const submitTest = useSubmitTest();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(TEST_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { answers: Record<number, number>; idx: number };
        setAnswers(parsed.answers || {});
        setCurrentIdx(Math.min(parsed.idx || 0, QUESTIONS.length - 1));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TEST_STORAGE_KEY, JSON.stringify({ answers, idx: currentIdx }));
    } catch { /* ignore */ }
  }, [answers, currentIdx]);

  const question = QUESTIONS[currentIdx];
  const totalQuestions = QUESTIONS.length;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;
  const isLast = currentIdx === totalQuestions - 1;
  const currentAnswer = answers[question.id];
  const section = TEST_SECTIONS.find(s => s.id === question.sectionId);

  const handleSelect = (value: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
  };

  const handleNext = () => {
    if (currentAnswer === undefined) {
      toast({ title: "Zəhmət olmasa cavab seçin", variant: "destructive" });
      return;
    }
    if (isLast) {
      handleSubmit();
    } else {
      setDirection(1);
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      setDirection(-1);
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const answerArray = Array.from({ length: 40 }, (_, i) => answers[i + 1] || 1);
    submitTest.mutate({ data: { answers: answerArray } }, {
      onSuccess: (result) => {
        localStorage.removeItem(TEST_STORAGE_KEY);
        toast({ title: "Test uğurla tamamlandı!" });
        setLocation(`/results/${result.id}`);
      },
      onError: () => {
        toast({ title: "Xəta baş verdi. Yenidən cəhd edin.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-6 md:py-10 px-1">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-indigo-950/60">
            Sual <span className="text-primary font-black">{currentIdx + 1}</span> / {totalQuestions}
          </span>
          <span className="text-sm font-bold text-primary">{Math.round(progress)}% tamamlandı</span>
        </div>
        <Progress
          value={progress}
          className="h-2.5 rounded-full bg-indigo-100 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent [&>div]:transition-all [&>div]:duration-500"
        />
        <div className="flex gap-1 mt-2.5">
          {TEST_SECTIONS.map(s => {
            const sqs = QUESTIONS.filter(q => q.sectionId === s.id);
            const done = sqs.every(q => answers[q.id] !== undefined);
            const active = s.id === question.sectionId;
            return (
              <div
                key={s.id}
                title={s.name}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  done ? "bg-primary" : active ? "bg-primary/40 animate-pulse" : "bg-indigo-100"
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-widest text-primary/70 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
          {section?.name} · Bölmə {question.sectionId}/8
        </span>
        <span className="text-xs text-indigo-900/40 font-medium">
          Qalan: {totalQuestions - currentIdx - 1} sual
        </span>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentIdx}
          custom={direction}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <div className="bg-white rounded-[2rem] shadow-[0_8px_40px_rgba(91,95,239,0.09)] border border-indigo-50/80 overflow-hidden">
            <div className="px-8 pt-8 pb-7">
              <p className="text-xl md:text-2xl font-bold text-indigo-950 leading-relaxed">
                <span className="text-2xl font-black text-primary/25 mr-2">{currentIdx + 1}.</span>
                {question.text}
              </p>
            </div>

            <div className="px-6 pb-7 grid grid-cols-1 gap-3">
              {ANSWER_OPTIONS.map((opt) => {
                const selected = currentAnswer === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`
                      relative w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer
                      ${selected
                        ? "border-primary bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg shadow-primary/10"
                        : "border-indigo-100 bg-slate-50/80 hover:border-primary/30 hover:bg-indigo-50/60 hover:shadow-md"
                      }
                    `}
                  >
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shrink-0 transition-all duration-200
                      ${selected
                        ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
                        : "bg-white text-indigo-300 shadow-sm border border-indigo-100"
                      }
                    `}>
                      {opt.value}
                    </div>
                    <span className={`font-semibold text-base transition-colors ${selected ? "text-primary" : "text-indigo-950/70"}`}>
                      {opt.label}
                    </span>
                    {selected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between items-center mt-5 gap-3">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentIdx === 0 || submitTest.isPending}
          className="rounded-2xl font-bold border-indigo-200 text-indigo-950 h-12 px-6 hover:bg-indigo-50 disabled:opacity-40"
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Geri
        </Button>

        <span className="text-xs text-indigo-900/35 font-medium hidden sm:block">
          Cavablar avtomatik saxlanılır
        </span>

        <Button
          onClick={handleNext}
          disabled={submitTest.isPending}
          className={`rounded-2xl font-bold h-12 px-8 transition-all duration-300 shadow-lg ${
            isLast
              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30"
              : "bg-primary hover:bg-primary/90 shadow-primary/30"
          }`}
        >
          {submitTest.isPending ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Göndərilir...
            </span>
          ) : isLast ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Testi Bitir
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Növbəti <ChevronRight className="h-4 w-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
