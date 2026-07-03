import { useRef, useState } from "react";
import { useListCertificates, getListCertificatesQueryKey, useGetDashboardStats, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Download, Share2, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import bookCoverPath from "@assets/IMG-20260604-WA0005_1782924608772.jpg";
import { useToast } from "@/hooks/use-toast";

const STAGE_COLORS: Record<number, string> = {
  1: "#64748b", 2: "#ef4444", 3: "#f97316",
  4: "#eab308", 5: "#22c55e", 6: "#06b6d4", 7: "#6366f1",
};

interface CertData {
  id: number; stage: number; stageName: string;
  certificateCode: string; issuedAt: string;
}

async function exportCertificatePng(el: HTMLDivElement): Promise<string> {
  const { toPng } = await import("html-to-image");
  return toPng(el, {
    pixelRatio: 3,
    cacheBust: true,
    backgroundColor: "#ffffff",
    style: { borderRadius: "1.5rem" },
  });
}

function CertificateCard({ cert, userName, progressPercent }: {
  cert: CertData; userName: string; progressPercent: number;
}) {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [shareModal, setShareModal] = useState<"instagram" | "tiktok" | null>(null);
  const { toast } = useToast();
  const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
  const certUrl = `${window.location.origin}${basePath}/verify/${cert.certificateCode}`;
  const stageColor = STAGE_COLORS[cert.stage] || "#6366f1";
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
    } catch (err) {
      toast({ title: "Xəta", description: "PNG yüklənmədi. Yenidən cəhd edin.", variant: "destructive" });
      console.error(err);
    } finally { setDownloading(false); }
  }

  async function downloadPDF() {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await exportCertificatePng(certRef.current);
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, "PNG", 0, 0, w, h);
      pdf.save(`rzahan-sertifikat-${cert.certificateCode}.pdf`);
    } catch (err) {
      toast({ title: "Xəta", description: "PDF yüklənmədi. Yenidən cəhd edin.", variant: "destructive" });
      console.error(err);
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
    } catch (err) {
      console.error(err);
    } finally {
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
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
      try {
        window.open("tiktok://", "_blank");
      } catch {}
      setShareModal("tiktok");
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(certUrl);
    toast({ title: "Keçid kopyalandı" });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Certificate design */}
      <div
        ref={certRef}
        className="relative bg-white rounded-3xl overflow-hidden select-none"
        style={{ padding: "3px", background: "linear-gradient(135deg,#d4af37,#f5d769,#b8860b,#d4af37)" }}
      >
        <div className="relative bg-white rounded-[22px] overflow-hidden">
          {/* Book cover watermark */}
          <div className="absolute inset-0 opacity-[0.04] bg-no-repeat bg-center bg-contain pointer-events-none"
            style={{ backgroundImage: `url(${bookCoverPath})` }} />
          {/* Gold corner accents */}
          <div className="absolute top-3 left-3 w-8 h-8 opacity-25" style={{ color: "#d4af37" }}>
            <svg viewBox="0 0 40 40" fill="currentColor"><path d="M0 0 L40 0 L0 40 Z" /></svg>
          </div>
          <div className="absolute top-3 right-3 w-8 h-8 opacity-25" style={{ color: "#d4af37" }}>
            <svg viewBox="0 0 40 40" fill="currentColor"><path d="M40 0 L0 0 L40 40 Z" /></svg>
          </div>
          <div className="absolute bottom-3 left-3 w-8 h-8 opacity-25" style={{ color: "#d4af37" }}>
            <svg viewBox="0 0 40 40" fill="currentColor"><path d="M0 40 L40 40 L0 0 Z" /></svg>
          </div>
          <div className="absolute bottom-3 right-3 w-8 h-8 opacity-25" style={{ color: "#d4af37" }}>
            <svg viewBox="0 0 40 40" fill="currentColor"><path d="M40 40 L0 40 L40 0 Z" /></svg>
          </div>

          <div className="relative z-10 flex flex-col items-center py-8 px-6 md:px-12 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                <span className="text-sm font-bold text-indigo-950 tracking-[0.15em] uppercase">Rzahan Academy</span>
              </div>
              <div className="text-[11px] font-semibold tracking-[0.25em] uppercase mt-0.5" style={{ color: "#b8860b" }}>
                Rəsmi Bilinç Sertifikatı
              </div>
            </div>

            <div className="w-full flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg,transparent,#d4af37)" }} />
              <span style={{ color: "#d4af37" }}>✦</span>
              <div className="h-px flex-1" style={{ background: "linear-gradient(90deg,#d4af37,transparent)" }} />
            </div>

            <div className="text-center space-y-2 py-2">
              <div className="text-[11px] text-indigo-400 font-medium uppercase tracking-[0.2em]">Təqdim olunur</div>
              <div className="text-3xl md:text-4xl font-black text-indigo-950 leading-tight">{userName}</div>
              <div className="text-sm text-indigo-500/70 font-medium">uğurla nail olmuşdur</div>
              <div className="inline-block mt-1">
                <span className="text-xl md:text-2xl font-black px-6 py-2 rounded-full text-white shadow-lg"
                  style={{ backgroundColor: stageColor }}>
                  {cert.stageName} Mərhələsi
                </span>
              </div>
              <div className="text-sm text-indigo-500/60 pt-1">İnsan Bilinç Mexanizmi — Mərhələ {cert.stage} / 7</div>
              <div className="w-52 mx-auto pt-1">
                <div className="text-xs text-center text-indigo-400 mb-1.5">{progressPercent}% Ümumi İnkişaf</div>
                <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full"
                    style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg,#6366f1,#06b6d4)" }} />
                </div>
              </div>
            </div>

            <div className="w-full flex items-end justify-between pt-2">
              <div>
                <div className="text-2xl font-black italic" style={{ fontFamily: "Georgia, serif", color: "#b8860b", letterSpacing: "-0.01em" }}>
                  Rzahan
                </div>
                <div className="text-xs text-indigo-400 mt-0.5">Rzahan Academy qurucusu</div>
                <div className="text-[10px] text-indigo-300 mt-2 font-mono">Sənəd №: {cert.certificateCode}</div>
                <div className="text-[10px] text-indigo-300">{issuedDate}</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="p-1.5 bg-white rounded-lg border border-indigo-100">
                  <QRCodeSVG value={certUrl} size={56} bgColor="white" fgColor="#312e81" level="M" />
                </div>
                <span className="text-[9px] text-indigo-300 tracking-wider uppercase">Yoxla</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={downloadPNG} disabled={downloading}
          className="flex-1 min-w-[130px] rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
          <Download className="mr-2 h-4 w-4" />{downloading ? "Yüklənir..." : "PNG Yüklə"}
        </Button>
        <Button onClick={downloadPDF} disabled={downloading} variant="outline"
          className="flex-1 min-w-[130px] rounded-xl border-2 border-indigo-200 font-bold text-indigo-950">
          <Download className="mr-2 h-4 w-4" />{downloading ? "Yüklənir..." : "PDF Yüklə"}
        </Button>
      </div>

      {/* Share buttons */}
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
  const progressPercent = stats?.progressPercent ?? 0;

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-950">Sertifikatlar</h1>
        <p className="text-indigo-900/60 mt-2">Nailiyyətləriniz və rəsmi sənədləriniz</p>
      </div>

      {!certificates || certificates.length === 0 ? (
        <Card className="rounded-[2rem] border-dashed border-2 border-indigo-100 bg-slate-50/50 shadow-none">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-300 mb-6">
              <Award className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-indigo-950 mb-2">Sertifikatınız yoxdur</h3>
            <p className="text-indigo-900/60 max-w-sm mx-auto">
              Testləri tamamlayaraq yeni şüur mərhələlərinə çatdıqda sertifikatlar əldə edəcəksiniz.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-10">
          {certificates.map((cert, i) => (
            <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] border border-indigo-100 shadow-[0_8px_30px_rgba(91,95,239,0.08)] p-6 md:p-8">
              <CertificateCard
                cert={{ id: cert.id, stage: cert.stage, stageName: cert.stageName ?? "Naməlum",
                  certificateCode: cert.certificateCode ?? `RZH-${cert.id}`, issuedAt: cert.issuedAt }}
                userName={userName}
                progressPercent={progressPercent}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
