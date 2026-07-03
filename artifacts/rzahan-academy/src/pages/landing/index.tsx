import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/lib/constants";
import { useGetPlatformStats, getGetPlatformStatsQueryKey, useListComments, getListCommentsQueryKey } from "@workspace/api-client-react";
import bookCoverPath from "@assets/IMG-20260604-WA0005_1782924608772.jpg";
import authorPhotoPath from "@assets/file_00000000753c71fbbf777223ec251504_1782924608734.png";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, ChevronRight, Zap, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WA_LINK = "https://wa.me/994559195001";
const TG_LINK = "https://t.me/rzahanacademy";
const TT_LINK = "https://tiktok.com/@rzahan.academy";

export default function LandingPage() {
  const { data: stats } = useGetPlatformStats({ query: { queryKey: getGetPlatformStatsQueryKey() } });
  const { data: comments } = useListComments({ query: { queryKey: getListCommentsQueryKey() } });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 to-white pointer-events-none" />
        <div className="absolute right-0 top-0 w-1/2 h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-primary font-medium text-sm mb-6 border border-indigo-200">
                <Zap className="h-4 w-4" /> Yeni Nəsil İnkişaf Platforması
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-indigo-950 leading-[1.1] mb-6 tracking-tight">
                İnsan Bilinç <br/>
                <span className="gradient-text">Mexanizmi</span>
              </h1>
              <p className="text-xl text-indigo-900/70 mb-10 max-w-2xl mx-auto lg:mx-0">
                Özünü Gör. Dəyiş. Oyanışa Keç. 7 mərhələli şüur transformasiyası ilə həqiqi potensialınızı kəşf edin.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/test">
                  <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200" data-testid="button-hero-test">
                    Testə Başla
                  </Button>
                </Link>
                <a href={WA_LINK} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-base font-bold border-2 border-indigo-200 text-indigo-950 hover:bg-indigo-50 hover:-translate-y-0.5 transition-all duration-200" data-testid="button-hero-book">
                    Kitabı Əldə Et
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* 3D book cover */}
            <motion.div
              className="flex-1 relative"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="relative w-[280px] sm:w-[360px] mx-auto" style={{ perspective: "1000px" }}>
                <motion.div
                  className="relative"
                  whileHover={{ rotateY: -12, rotateX: 3, scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute -inset-4 bg-gradient-to-tr from-primary via-accent to-purple-500 opacity-25 blur-2xl rounded-[3rem] animate-pulse" />
                  <div className="absolute -inset-8 bg-primary/10 blur-3xl rounded-[4rem]" />
                  <img
                    src={bookCoverPath}
                    alt="İnsan Bilinç Mexanizmi Kitabı"
                    className="relative z-10 w-full h-auto rounded-r-3xl shadow-[0_30px_60px_rgba(91,95,239,0.35),0_0_0_1px_rgba(91,95,239,0.08)]"
                  />
                  <div
                    className="absolute top-0 left-0 h-full w-[18px] rounded-l-lg z-20 shadow-[-4px_0_8px_rgba(0,0,0,0.15)]"
                    style={{
                      background: "linear-gradient(to right, #1e1b4b, #312e81)",
                      transform: "rotateY(-90deg) translateZ(-9px) translateX(-9px)",
                      transformOrigin: "left center",
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-indigo-100 relative z-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "İştirakçı sayı", value: stats?.participants || "1,200+" },
              { label: "Tamamlanan testlər", value: stats?.completedTests || "4,500+" },
              { label: "Verilmiş sertifikatlar", value: stats?.issuedCertificates || "850+" },
              { label: "Aktiv istifadəçilər", value: stats?.activeUsers || "300+" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                data-testid={`stat-${i}`}
              >
                <div className="text-4xl lg:text-5xl font-bold text-indigo-950 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-indigo-900/60 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Book & Author — enhanced with 3D book + WhatsApp CTA */}
      <section id="about" className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto glass-card rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
              {/* Author photo */}
              <div className="w-48 md:w-56 shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl translate-y-4" />
                  <img src={authorPhotoPath} alt="Rzahan" className="relative z-10 w-full h-auto rounded-2xl shadow-xl" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 mb-5">Müəllif Haqqında & Kitab</h2>
                <p className="text-lg text-indigo-900/80 mb-6 leading-relaxed">
                  "İnsan Bilinç Mexanizmi" sadəcə bir kitab deyil, insanın özünü dərk etməsi üçün yazılmış bələdçidir. Bu əsər şüurun 7 mərhələsini elmi və fəlsəfi yanaşmalarla izah edir, oxucunu 'Yatmış' vəziyyətindən 'Yaradıcı' səviyyəsinə doğru addım-addım aparır.
                </p>
                <div className="mb-3 space-y-0.5">
                  <p className="text-xl font-black text-indigo-950">Rzahan</p>
                  <p className="text-sm font-medium text-indigo-600">İnsan Bilinç Mexanizmi müəllifi</p>
                  <p className="text-sm font-medium text-indigo-500">Rzahan Academy qurucusu</p>
                </div>

                {/* WhatsApp CTA */}
                <a href={WA_LINK} target="_blank" rel="noreferrer">
                  <Button
                    size="lg"
                    className="h-14 px-10 rounded-2xl text-base font-bold bg-[#25D366] hover:bg-[#22c05c] text-white shadow-lg shadow-[#25D366]/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3"
                  >
                    <MessageCircle className="h-5 w-5 fill-current" />
                    MÜRACİƏT ET
                  </Button>
                </a>
              </div>

              {/* 3D book in author section */}
              <div className="hidden xl:block shrink-0" style={{ perspective: "800px" }}>
                <motion.div
                  whileHover={{ rotateY: -15, rotateX: 5, scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-40"
                >
                  <div className="absolute -inset-3 bg-gradient-to-tr from-primary to-accent opacity-20 blur-xl rounded-2xl" />
                  <img
                    src={bookCoverPath}
                    alt="Kitab"
                    className="relative z-10 w-full h-auto rounded-r-xl shadow-[0_20px_40px_rgba(91,95,239,0.3)]"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7 Stages */}
      <section id="stages" className="py-32 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-6">7 Şüur Mərhələsi</h2>
            <p className="text-xl text-indigo-900/70">Testi keçərək hazırda hansı mərhələdə olduğunuzu kəşf edin və inkişaf planınızı əldə edin.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {STAGES.map((stage, i) => (
              <motion.div
                key={stage.id}
                className="group p-8 rounded-3xl bg-slate-50 border border-indigo-50 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                data-testid={`stage-card-${stage.id}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <stage.icon className="h-7 w-7" />
                </div>
                <div className="text-4xl font-black text-indigo-950/5 absolute top-6 right-6 select-none pointer-events-none group-hover:text-primary/5 transition-colors">0{stage.id}</div>
                <h3 className="text-xl font-bold text-indigo-950 mb-3">{stage.name}</h3>
                <p className="text-indigo-900/70 leading-relaxed">{stage.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-indigo-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-20 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Necə İşləyir?</h2>
            <p className="text-xl text-indigo-200">Səyahətiniz cəmi bir neçə addımdan ibarətdir.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { t: "Qeydiyyat", d: "Profilinizi yaradın" },
              { t: "Test", d: "40 suala cavab verin" },
              { t: "Analiz", d: "Nəticənizi dərk edin" },
              { t: "İnkişaf Planı", d: "Tövsiyələri tətbiq edin" },
              { t: "Sertifikat", d: "Nəticənizi təsdiqləyin" }
            ].map((step, i) => (
              <motion.div
                key={i}
                className="text-center relative"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                {i < 4 && <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent" />}
                <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-900/50 border border-indigo-700 flex items-center justify-center text-xl font-bold mb-6 relative z-10 text-primary-300 shadow-[0_0_20px_rgba(91,95,239,0.3)]">
                  {i + 1}
                </div>
                <h4 className="text-lg font-bold mb-2">{step.t}</h4>
                <p className="text-indigo-300 text-sm">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reyler" className="py-32 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-6">İstifadəçi Rəyləri</h2>
            <p className="text-xl text-indigo-900/70">Testi keçən və həyatını dəyişən insanların hekayələri.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(comments || []).slice(0, 3).map((comment, i) => (
              <motion.div
                key={comment.id}
                className="glass-card p-8 rounded-[2rem]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: comment.rating || 5 }).map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-indigo-950 mb-6 leading-relaxed">"{comment.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {comment.avatarUrl ? <img src={comment.avatarUrl} alt="" className="w-full h-full object-cover" /> : comment.authorName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-indigo-950">{comment.authorName}</div>
                    {comment.stageName && <div className="text-xs font-medium text-primary">{comment.stageName} mərhələsi</div>}
                  </div>
                </div>
              </motion.div>
            ))}
            {(!comments || comments.length === 0) && (
              <div className="col-span-3 text-center text-indigo-900/50 py-12">Hələlik rəy yoxdur.</div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 bg-white border-t border-indigo-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-6">Tez-tez Verilən Suallar</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Test nə qədər vaxt aparır?", a: "Test 40 sualdan ibarətdir və adətən 10-15 dəqiqə vaxt aparır. Brauzer bağlansa belə cavablarınız avtomatik saxlanılır." },
              { q: "Sertifikatı necə əldə edə bilərəm?", a: "Testi tamamladıqdan sonra nəticə səhifəsindəki 'Sertifikat Al' düyməsinə klikləyərək sertifikatınızı rəqəmsal formatda əldə edə bilərsiniz." },
              { q: "Nəticəm gizli qalır?", a: "Bəli, test nəticələriniz və profil məlumatlarınız tam məxfi saxlanılır və yalnız sizin panelinizdə görünür." },
              { q: "Testi yenidən keçə bilərəm?", a: "Bəli, inkişafınızı izləmək üçün testi istədiyiniz qədər təkrarlaya bilərsiniz. Panelinizdə inkişaf qrafikiniz göstəriləcək." }
            ].map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-indigo-100 px-2">
                <AccordionTrigger className="text-left text-lg font-bold text-indigo-950 hover:text-primary py-6">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-indigo-900/70 text-base leading-relaxed pb-6">{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
            <div className="absolute inset-0 aurora-bg opacity-30" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-indigo-950 mb-6 tracking-tight">Oyanışa Hazırsınız?</h2>
              <p className="text-xl text-indigo-900/80 mb-10 max-w-2xl mx-auto">
                Özünüzü kəşf etmək üçün ilk addımı atın. Dəyişim indi başlayır.
              </p>
              <Link href="/test">
                <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_8px_30px_rgb(91,95,239,0.4)] hover:shadow-[0_8px_40px_rgb(91,95,239,0.6)] hover:-translate-y-1 transition-all duration-300">
                  Testə Başla
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — only TikTok + Telegram icons, no phone/email text */}
      <footer className="bg-indigo-950 text-indigo-200 py-16 border-t border-indigo-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-amber-400">
                  <Zap className="h-6 w-6 fill-current" />
                </div>
                <span className="text-2xl font-bold text-white">Rzahan Academy</span>
              </Link>
              <p className="text-indigo-300 max-w-sm mb-8">
                İnsan Bilinç Mexanizmi — Şüurun 7 mərhələli transformasiya proqramı və fərdi inkişaf platforması.
              </p>
              {/* Social icons only */}
              <div className="flex gap-4">
                <a
                  href={TT_LINK}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="TikTok"
                  className="w-11 h-11 rounded-xl bg-indigo-900 hover:bg-indigo-800 flex items-center justify-center transition-colors group"
                >
                  <svg className="w-5 h-5 fill-indigo-300 group-hover:fill-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/>
                  </svg>
                </a>
                <a
                  href={TG_LINK}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Telegram"
                  className="w-11 h-11 rounded-xl bg-indigo-900 hover:bg-indigo-800 flex items-center justify-center transition-colors group"
                >
                  <svg className="w-5 h-5 fill-indigo-300 group-hover:fill-white transition-colors" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Keçidlər</h4>
              <ul className="space-y-4">
                <li><a href="#about" className="hover:text-white transition-colors">Haqqında</a></li>
                <li><a href="#stages" className="hover:text-white transition-colors">Mərhələlər</a></li>
                <li><a href="#reyler" className="hover:text-white transition-colors">Rəylər</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><Link href="/test" className="hover:text-white transition-colors">Testə Başla</Link></li>
                <li><Link href="/sign-in" className="hover:text-white transition-colors">Daxil ol</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-indigo-900 pt-8 text-center text-sm text-indigo-400">
            &copy; {new Date().getFullYear()} Rzahan Academy. Bütün hüquqlar qorunur.
          </div>
        </div>
      </footer>
    </PublicLayout>
  );
}
