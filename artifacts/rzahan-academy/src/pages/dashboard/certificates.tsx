import { useRef, useState } from "react";
import { useListCertificates, getListCertificatesQueryKey, useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Download, Share2, Copy, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface CertData {
  id: number; stage: number; stageName: string;
  certificateCode: string; issuedAt: string;
}

const STAGE_GLOWS: Record<number, { primary: string; secondary: string }> = {
  1: { primary: "#64748b", secondary: "#94a3b8" },
  2: { primary: "#ef4444", secondary: "#f97316" },
  3: { primary: "#f97316", secondary: "#eab308" },
  4: { primary: "#eab308", secondary: "#22c55e" },
  5: { primary: "#22c55e", secondary: "#06b6d4" },
  6: { primary: "#06b6d4", secondary: "#6366f1" },
  7: { primary: "#a855f7", secondary: "#06b6d4" },
};

async function exportCertificatePng(el: HTMLDivElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  return toPng(el, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: "#050508",
    style: { borderRadius: "1.5rem" },
  });
}

function CertificateCard({ cert, userName }: { cert: CertData; userName: string }) {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [shareModal, setShareModal] = useState<"instagram" | "tiktok" | null>(null);
  const { toast } = useToast();
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
  const certUrl = `${window.location.origin}${basePath}/verify/${cert.certificateCode}`;
  const glow = STAGE_GLOWS[cert.stage] || STAGE_GLOWS[7];
  const issuedDate = new Date(cert.issuedAt).toLocaleDateString("az-AZ", { day: "numeric", month: "long", year: "numeric" });
  const shareText = `Mən Rzahan Academy-də "${cert.stageName}" bilinç mərhələsinə çatdım! #RzahanAcademy #BilinçSəyahəti`;

  async function downloadPNG() {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await exportCertificatePng(certRef.current);
      const link = document.createElement("a");
      link.download = `rzahan-sertifikat-${cert.certificateCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      toast({ title: "Xəta", description: "PNG yüklənmədi. Yenidən cəhd edin.", variant: "destructive" });
    } finally { setDownloading(false); }
  }

  async function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + certUrl)}`;
    window.open(url, "_blank");
  }

  async function handleInstagram() {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await exportCertificatePng(certRef.current);
      const link = document.createElement("a");
      link.download = `rzahan-sertifikat-${cert.certificateCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch { } finally {
      setDownloading(false);
      setShareModal("instagram");
    }
  }

  async function handleTikTok() {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await exportCertificatePng(certRef.current);
      const link = document.createElement("a");
      link.download = `rzahan-sertifikat-${cert.certificateCode}.png`;
      link.href = dataUrl;
      link.click();
    } catch { } finally {
      setDownloading(false);
      try { window.open("tiktok://", "_blank"); } catch { }
      setShareModal("tiktok");
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(certUrl);
    toast({ title: "Keçid kopyalandı" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Metaverse Certificate ── */}
      <div
        ref={certRef}
        className="relative overflow-hidden select-none"
        style={{
          background: "linear-gradient(135deg, #050508 0%, #0a0a18 40%, #0d0a1a 100%)",
          borderRadius: "1.5rem",
          padding: "2px",
          boxShadow: `0 0 60px ${glow.primary}30, 0 0 120px ${glow.secondary}15, inset 0 0 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Outer glow border */}
        <div
          style={{
            position: "absolute", inset: 0, borderRadius: "1.5rem",
            background: `linear-gradient(135deg, ${glow.primary}60, transparent 40%, ${glow.secondary}40 100%)`,
          }}
        />

        <div
          className="relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #050508 0%, #080811 50%, #0a081a 100%)",
            borderRadius: "calc(1.5rem - 2px)",
            padding: "2.5rem 2rem",
          }}
        >
          {/* Background grid */}
          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.04 }}>
            <svg width="100%" height="100%">
              <defs>
                <pattern id={`grid-${cert.id}`} width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${cert.id})`} />
            </svg>
          </div>

          {/* Radial glow at top center */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "-60px", left: "50%", transform: "translateX(-50%)",
              width: "400px", height: "300px",
              background: `radial-gradient(ellipse, ${glow.primary}20 0%, transparent 70%)`,
            }}
          />

          {/* Corner accent — top left */}
          <div className="absolute top-0 left-0 w-24 h-24 pointer-events-none" style={{ opacity: 0.6 }}>
            <svg viewBox="0 0 96 96" fill="none">
              <path d="M0 0 L48 0 L0 48 Z" fill={`${glow.primary}20`} />
              <path d="M0 0 L24 0 L0 24 Z" fill={glow.primary} opacity="0.4" />
              <line x1="0" y1="48" x2="48" y2="0" stroke={glow.primary} strokeWidth="0.5" opacity="0.5" />
              <line x1="0" y1="72" x2="72" y2="0" stroke={glow.secondary} strokeWidth="0.3" opacity="0.3" />
            </svg>
          </div>

          {/* Corner accent — top right */}
          <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none" style={{ opacity: 0.6 }}>
            <svg viewBox="0 0 96 96" fill="none">
              <path d="M96 0 L48 0 L96 48 Z" fill={`${glow.secondary}20`} />
              <path d="M96 0 L72 0 L96 24 Z" fill={glow.secondary} opacity="0.4" />
              <line x1="96" y1="48" x2="48" y2="0" stroke={glow.secondary} strokeWidth="0.5" opacity="0.5" />
              <line x1="96" y1="72" x2="24" y2="0" stroke={glow.primary} strokeWidth="0.3" opacity="0.3" />
            </svg>
          </div>

          {/* Corner accent — bottom left */}
          <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none" style={{ opacity: 0.4 }}>
            <svg viewBox="0 0 80 80" fill="none">
              <path d="M0 80 L0 40 L40 80 Z" fill={`${glow.secondary}20`} />
              <line x1="0" y1="40" x2="40" y2="80" stroke={glow.secondary} strokeWidth="0.5" opacity="0.5" />
            </svg>
          </div>

          {/* Corner accent — bottom right */}
          <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none" style={{ opacity: 0.4 }}>
            <svg viewBox="0 0 80 80" fill="none">
              <path d="M80 80 L80 40 L40 80 Z" fill={`${glow.primary}20`} />
              <line x1="80" y1="40" x2="40" y2="80" stroke={glow.primary} strokeWidth="0.5" opacity="0.5" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Header */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${glow.primary}, ${glow.secondary})`, boxShadow: `0 0 12px ${glow.primary}60` }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <span className="text-white font-bold tracking-[0.2em] uppercase text-sm">Rzahan Academy</span>
              </div>
              <p
                className="text-xs font-semibold tracking-[0.3em] uppercase"
                style={{ color: glow.primary }}
              >
                Rəsmi Bilinç Sertifikatı
              </p>
            </div>

            {/* Glowing divider */}
            <div className="w-full flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${glow.primary})` }} />
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: glow.primary, boxShadow: `0 0 8px ${glow.primary}, 0 0 16px ${glow.primary}80` }}
              />
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${glow.secondary}, transparent)` }} />
            </div>

            {/* Main content */}
            <div className="text-center space-y-3 py-2">
              <p className="text-xs font-medium uppercase tracking-[0.25em]" style={{ color: `${glow.primary}99` }}>
                Təqdim olunur
              </p>
              <h2
                className="text-3xl md:text-4xl font-black text-white leading-tight"
                style={{ textShadow: `0 0 30px ${glow.primary}40` }}
              >
                {userName}
              </h2>
              <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                uğurla nail olmuşdur
              </p>

              {/* Stage badge */}
              <div className="inline-block mt-2">
                <div
                  className="px-6 py-2.5 rounded-full text-white font-black text-lg relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${glow.primary}30, ${glow.secondary}30)`,
                    border: `1px solid ${glow.primary}60`,
                    boxShadow: `0 0 20px ${glow.primary}30, inset 0 0 20px ${glow.primary}10`,
                  }}
                >
                  <span style={{ textShadow: `0 0 20px ${glow.primary}` }}>{cert.stageName} Mərhələsi</span>
                </div>
              </div>

              <p
                className="text-xs font-medium mt-1"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                İnsan Bilinç Mexanizmi — Mərhələ {cert.stage} / 7
              </p>

              {/* Progress bar */}
              <div className="w-48 mx-auto pt-1">
                <div className="text-xs text-center mb-1.5 font-medium" style={{ color: `${glow.primary}80` }}>
                  {Math.round((cert.stage / 7) * 100)}% Ümumi İnkişaf
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.round((cert.stage / 7) * 100)}%`,
                      background: `linear-gradient(90deg, ${glow.primary}, ${glow.secondary})`,
                      boxShadow: `0 0 8px ${glow.primary}`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.1))` }} />
              <div className="w-1 h-1 rounded-full bg-white opacity-20" />
              <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, rgba(255,255,255,0.1), transparent)` }} />
            </div>

            {/* Footer */}
            <div className="w-full flex items-end justify-between">
              <div>
                <div
                  className="text-xl font-black italic mb-0.5"
                  style={{
                    fontFamily: "Georgia, serif",
                    background: `linear-gradient(135deg, ${glow.primary}, ${glow.secondary})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Rzahan
                </div>
                <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Rzahan Academy qurucusu</div>
                <div className="mt-3 font-mono" style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px" }}>
                  Sənəd №: {cert.certificateCode}
                </div>
                <div className="font-mono" style={{ color: "rgba(255,255,255,0.25)", fontSize: "9px" }}>
                  {issuedDate}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className="p-2 rounded-lg"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${glow.primary}30`,
                    boxShadow: `0 0 12px ${glow.primary}20`,
                  }}
                >
                  <QRCodeSVG value={certUrl} size={52} bgColor="transparent" fgColor={glow.primary} level="M" />
                </div>
                <span className="text-[8px] font-semibold tracking-widest uppercase" style={{ color: `${glow.primary}60` }}>
                  Yoxla
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download — PNG only */}
      <Button
        onClick={downloadPNG}
        disabled={downloading}
        className="w-full rounded-xl font-bold h-11"
        style={{
          background: "linear-gradient(135deg, #06b6d4, #7c3aed)",
          boxShadow: "0 4px 20px rgba(6,182,212,0.3)",
        }}
      >
        <Download className="mr-2 h-4 w-4" />
        {downloading ? "Yüklənir..." : "PNG Yüklə"}
      </Button>

      {/* Share */}
      <div>
        <div className="text-sm font-semibold text-indigo-950 mb-3 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-primary" /> Paylaş
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={shareWhatsApp} disabled={downloading}
            className="rounded-xl px-5 py-2 font-semibold text-sm text-white border-0 bg-[#25D366] hover:bg-[#22c05c]">
            WhatsApp
          </Button>
          <Button onClick={handleInstagram} disabled={downloading}
            className="rounded-xl px-5 py-2 font-semibold text-sm text-white border-0"
            style={{ background: "linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)" }}>
            Instagram
          </Button>
          <Button onClick={handleTikTok} disabled={downloading}
            className="rounded-xl px-5 py-2 font-semibold text-sm text-white border-0 bg-black hover:bg-zinc-800">
            TikTok
          </Button>
          <Button onClick={copyLink} variant="outline"
            className="rounded-xl border-2 border-indigo-200 font-semibold text-sm text-indigo-800">
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Linki Kopyala
          </Button>
        </div>
      </div>

      {/* Instagram / TikTok instructions modal */}
      <AnimatePresence>
        {shareModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShareModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-7 max-w-sm w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShareModal(null)}
                className="absolute top-4 right-4 text-indigo-300 hover:text-indigo-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
              {shareModal === "instagram" ? (
                <>
                  <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center text-white text-xl font-black"
                    style={{ background: "linear-gradient(135deg,#f09433,#dc2743,#bc1888)" }}>IG</div>
                  <h3 className="text-lg font-bold text-indigo-950 mb-2">Instagram-da Paylaş</h3>
                  <p className="text-sm text-indigo-600/80 mb-4">Sertifikat şəkliniz endirildi. Aşağıdakı addımları izləyin:</p>
                  <ol className="space-y-2 text-sm text-indigo-800">
                    <li className="flex gap-2"><span className="font-bold text-primary">1.</span> Instagram tətbiqini açın</li>
                    <li className="flex gap-2"><span className="font-bold text-primary">2.</span> Yeni Story və ya Post yaradın</li>
                    <li className="flex gap-2"><span className="font-bold text-primary">3.</span> Endirdiyniz sertifikat şəklini əlavə edin</li>
                    <li className="flex gap-2"><span className="font-bold text-primary">4.</span> <span><strong>#RzahanAcademy #BilinçSəyahəti</strong> etiketlərini əlavə edin</span></li>
                  </ol>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center bg-black text-white text-xl font-black">TT</div>
                  <h3 className="text-lg font-bold text-indigo-950 mb-2">TikTok-da Paylaş</h3>
                  <p className="text-sm text-indigo-600/80 mb-4">Sertifikat şəkliniz endirildi. Aşağıdakı addımları izləyin:</p>
                  <ol className="space-y-2 text-sm text-indigo-800">
                    <li className="flex gap-2"><span className="font-bold text-primary">1.</span> TikTok tətbiqini açın</li>
                    <li className="flex gap-2"><span className="font-bold text-primary">2.</span> Yeni video/foto yaradın</li>
                    <li className="flex gap-2"><span className="font-bold text-primary">3.</span> Endirdiyniz sertifikat şəklini yükləyin</li>
                    <li className="flex gap-2"><span className="font-bold text-primary">4.</span> <span><strong>#RzahanAcademy</strong> etiketini əlavə edin</span></li>
                  </ol>
                </>
              )}
              <Button onClick={() => setShareModal(null)}
                className="w-full mt-5 rounded-xl bg-primary text-white font-semibold">
                Başa düşdüm
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CertificatesPage() {
  const { data: certificates, isLoading } = useListCertificates({
    query: { queryKey: getListCertificatesQueryKey() }
  });
  const { data: stats } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() }
  });
  const { user } = useAuth();

  const userName = (() => {
    if (!user) return "İstifadəçi";
    return user.fullName || user.username || "İstifadəçi";
  })();

  if (isLoading) {
    return (
      <div className="py-8 space-y-6">
        <div>
          <div className="h-8 w-48 bg-indigo-100 animate-pulse rounded-xl mb-2" />
          <div className="h-4 w-72 bg-indigo-50 animate-pulse rounded-xl" />
        </div>
        <div className="h-96 bg-indigo-50 animate-pulse rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-950">Sertifikatlar</h1>
        <p className="text-indigo-900/60 mt-2">Nailiyyətləriniz və rəsmi sənədləriniz</p>
      </div>

      {!certificates || certificates.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="rounded-[2rem] border-dashed border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white shadow-none">
            <CardContent className="p-12 md:p-20 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-2xl blur-xl opacity-60" />
                <div className="relative w-24 h-24 rounded-2xl bg-indigo-100 flex items-center justify-center">
                  <Award className="h-12 w-12 text-indigo-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-indigo-950 mb-3">Hələ Sertifikat Yoxdur</h3>
              <p className="text-indigo-900/60 max-w-sm mx-auto mb-3 leading-relaxed">
                Şüur testini tamamlayın, mərhələnizi kəşf edin və rəsmi sertifikatınızı əldə edin.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto mb-8 text-sm">
                {[
                  { icon: "🧠", label: "40 Sual", desc: "10–15 dəq." },
                  { icon: "📊", label: "Nəticə", desc: "Anlıq analiz" },
                  { icon: "🏆", label: "Sertifikat", desc: "Rəsmi sənəd" },
                ].map((step) => (
                  <div key={step.label} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white border border-indigo-100">
                    <span className="text-2xl mb-0.5">{step.icon}</span>
                    <span className="font-bold text-indigo-950 text-xs">{step.label}</span>
                    <span className="text-indigo-500 text-xs">{step.desc}</span>
                  </div>
                ))}
              </div>
              <Link href="/test">
                <Button className="rounded-xl bg-primary text-white font-bold px-8 h-11 shadow-md shadow-primary/20 hover:-translate-y-0.5 transition-all">
                  Testi Keç <ChevronRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-10">
          {certificates.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] border border-indigo-100 shadow-[0_8px_30px_rgba(91,95,239,0.08)] p-6 md:p-8">
              <CertificateCard
                cert={{
                  id: cert.id, stage: cert.stage, stageName: cert.stageName ?? "Naməlum",
                  certificateCode: cert.certificateCode ?? `RZH-${cert.id}`, issuedAt: cert.issuedAt
                }}
                userName={userName}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
