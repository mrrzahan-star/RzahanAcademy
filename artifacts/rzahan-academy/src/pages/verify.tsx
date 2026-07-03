import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { Zap, CheckCircle, XCircle, Loader2, Award, Calendar, User, Shield } from "lucide-react";
import { motion } from "framer-motion";

interface CertInfo {
  valid: boolean;
  certificateCode: string;
  stage: number;
  stageName: string;
  issuedAt: string;
  ownerName: string;
}

const STAGE_COLORS: Record<number, string> = {
  1: "#64748b", 2: "#ef4444", 3: "#f97316",
  4: "#eab308", 5: "#22c55e", 6: "#06b6d4", 7: "#6366f1",
};

export default function VerifyPage() {
  const params = useParams<{ code: string }>();
  const code = params.code;
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

  const [cert, setCert] = useState<CertInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) { setNotFound(true); setLoading(false); return; }
    fetch(`/api/certificates/verify/${encodeURIComponent(code)}`)
      .then(async (res) => {
        if (res.status === 404) { setNotFound(true); return; }
        const data = await res.json();
        setCert(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  const stageColor = cert ? (STAGE_COLORS[cert.stage] || "#6366f1") : "#6366f1";
  const issuedDate = cert
    ? new Date(cert.issuedAt).toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-[100dvh] aurora-bg flex flex-col">
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-indigo-100/30 bg-white/60 backdrop-blur-md">
        <Link href={`${basePath}/`} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-amber-400">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <span className="font-bold text-indigo-950">Rzahan Academy</span>
        </Link>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600">
          <Shield className="h-4 w-4" />
          Sertifikat Yoxlama
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        {loading ? (
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-indigo-900/60 font-medium">Yoxlanılır...</p>
          </div>
        ) : notFound ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-[2rem] border border-red-100 shadow-xl p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-indigo-950 mb-2">Sertifikat Tapılmadı</h1>
            <p className="text-indigo-900/60 mb-6">
              <span className="font-mono text-sm bg-red-50 px-2 py-1 rounded text-red-600">{code}</span> kodu ilə sertifikat mövcud deyil. Kodu yenidən yoxlayın.
            </p>
            <Link href={`${basePath}/`}>
              <span className="inline-block px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors">
                Ana Səhifəyə Qayıt
              </span>
            </Link>
          </motion.div>
        ) : cert ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full space-y-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border-2 border-green-100 shadow-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-sm font-bold mb-4">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Sertifikat Doğrudur
              </div>
              <h1 className="text-2xl font-black text-indigo-950 mb-1">Rəsmi Bilinç Sertifikatı</h1>
              <p className="text-indigo-900/50 text-sm">Rzahan Academy tərəfindən verilmişdir</p>
            </div>

            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] border border-indigo-100 shadow-lg overflow-hidden">
              <div className="h-2 w-full" style={{ background: `linear-gradient(90deg,${stageColor},#6366f1)` }} />
              <div className="p-8 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-0.5">Sahibi</div>
                    <div className="text-lg font-black text-indigo-950">{cert.ownerName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stageColor}15` }}>
                    <Award className="h-5 w-5" style={{ color: stageColor }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-0.5">Bilinç Mərhələsi</div>
                    <div className="text-lg font-black text-indigo-950">{cert.stageName}</div>
                    <div className="text-sm text-indigo-400 font-medium">Mərhələ {cert.stage} / 7</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-0.5">Verilmə Tarixi</div>
                    <div className="text-base font-bold text-indigo-950">{issuedDate}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-indigo-50">
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">Sertifikat Kodu</div>
                  <div className="font-mono text-sm bg-indigo-50 px-3 py-2 rounded-xl text-indigo-700 select-all">{cert.certificateCode}</div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href={`${basePath}/`}>
                <span className="inline-block px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors">
                  Rzahan Academy-yə Bax
                </span>
              </Link>
            </div>
          </motion.div>
        ) : null}
      </main>
    </div>
  );
}
