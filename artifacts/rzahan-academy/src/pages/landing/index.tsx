import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/lib/constants";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Star, ChevronRight, Zap, MessageCircle, BookOpen, Heart, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import bookCoverPath from "@assets/IMG-20260604-WA0005_1782924608772.jpg";
import authorPhotoPath from "@assets/file_00000000753c71fbbf777223ec251504_1782924608734.png";

const DEMO_REVIEWS = [
  { id: -1, authorName: "Aytən Məmmədova", content: "Test nəticəm məni çox düşündürdü. Həyatıma tamam fərqli bir nöqteyi-nəzərdən baxmağa başladım. Rzahan Academy-nin yanaşması sadəcə unikaldır.", stageName: "Axtaran", rating: 5, avatarUrl: null },
  { id: -2, authorName: "Orxan Hüseynov", content: "Bu testi keçənə qədər özümü nə qədər az tanıdığımı anlamadım. İndi hər gün gündəlik tapşırıqları yerinə yetirirəm və dəyişim hiss edirəm.", stageName: "Görən", rating: 5, avatarUrl: null },
  { id: -3, authorName: "Nigar Əliyeva", content: "Sertifikatı əldə etdikdə çox qürur hiss etdim. Bu platforma şüurun inkişafını elmi əsaslarla izah edir. Dostlarıma tövsiyə etdim.", stageName: "İnteqrator", rating: 5, avatarUrl: null },
  { id: -4, authorName: "Tural Qasımov", content: "Əvvəllər meditasiyanı ciddiyə almırdım. Ancaq platformanın günlük tapşırıqları sayəsində 21 gün streak yaratdım.", stageName: "Sehrbaz", rating: 5, avatarUrl: null },
  { id: -5, authorName: "Sevinc Rəhimli", content: "Kitabı oxuduqdan sonra platformaya qeydiyyatdan keçdim. İkisi birlikdə çox güclü effekt verir.", stageName: "Axtaran", rating: 4, avatarUrl: null },
  { id: -6, authorName: "Fərid Babayev", content: "İlk testdən 4-cü mərhələdə olduğumu öyrəndim. Şüurumun hansı səviyyədə olduğunu bilmək hər şeyi dəyişdirdi.", stageName: "Görən", rating: 5, avatarUrl: null },
];

const DEMO_FAQS = [
  { id: -1, question: "Test nə qədər vaxt aparır?", answer: "Test 40 sualdan ibarətdir və adətən 10-15 dəqiqə vaxt aparır. Brauzer bağlansa belə cavablarınız avtomatik saxlanılır." },
  { id: -2, question: "Sertifikatı necə əldə edə bilərəm?", answer: "Testi tamamladıqdan sonra nəticə səhifəsindəki 'Sertifikat Al' düyməsinə klikləyərək sertifikatınızı rəqəmsal formatda əldə edə bilərsiniz." },
  { id: -3, question: "Nəticəm gizli qalır?", answer: "Bəli, test nəticələriniz və profil məlumatlarınız tam məxfi saxlanılır və yalnız sizin panelinizdə görünür." },
  { id: -4, question: "Testi yenidən keçə bilərəm?", answer: "Bəli, inkişafınızı izləmək üçün testi istədiyiniz qədər təkrarlaya bilərsiniz. Panelinizdə inkişaf qrafikiniz göstəriləcək." },
];

interface LandingSection { visible?: boolean; [k: string]: unknown }

function sec<T extends LandingSection>(cfg: Record<string, T | undefined>, key: string): T {
  return (cfg[key] ?? {}) as T;
}

function isVisible(s: LandingSection, dflt = true): boolean {
  return s.visible !== false && (s.visible !== undefined ? s.visible : dflt);
}

export default function LandingPage() {
  const { data: landing } = useQuery({
    queryKey: ["landing"],
    queryFn: async () => {
      const r = await fetch("/api/landing");
      if (!r.ok) return null;
      return r.json() as Promise<{
        config: Record<string, LandingSection>;
        programs: Array<{ id: number; title: string; slug: string; description: string; coverImageUrl?: string; difficulty?: string; instructor?: string }>;
        articles: Array<{ id: number; title: string; slug: string; excerpt?: string; coverImageUrl?: string; author?: string; readingTimeMinutes?: number }>;
        stories: Array<{ id: number; title: string; excerpt?: string; imageUrl?: string; author?: string; readingTimeMinutes?: number }>;
        todaysThought: { text: string; author?: string } | null;
        testimonials: Array<{ id: number; authorName: string; authorTitle?: string; avatarUrl?: string; content: string; rating: number; stageName?: string }>;
        packages: Array<{ id: number; emoji?: string; name: string; slug: string; description?: string; isActive: boolean; sortOrder: number }>;
        faqs: Array<{ id: number; question: string; answer: string }>;
        announcements: Array<{ id: number; title: string; content?: string; bannerImageUrl?: string; priority?: number }>;
        stats: { members: number; tests: number; certificates: number };
      }>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const cfg = landing?.config ?? {};
  const hero = sec(cfg, "hero");
  const about = sec(cfg, "about");
  const stats = sec(cfg, "stats");
  const footer = sec(cfg, "footer");

  const waUrl = (footer.waUrl as string) || "https://wa.me/994559195001";
  const tgUrl = (footer.tgUrl as string) || "https://t.me/rzahanacademy";
  const ttUrl = (footer.ttUrl as string) || "https://tiktok.com/@rzahan.academy";

  const heroHeadline = ((hero.headline as string) || "İnsan Bilinç\nMexanizmi").split("\\n");
  const heroBadge = (hero.badge as string) || "Yeni Nəsil İnkişaf Platforması";
  const heroSubtitle = (hero.subtitle as string) || "Özünü Gör. Dəyiş. Oyanışa Keç. 7 mərhələli şüur transformasiyası ilə həqiqi potensialınızı kəşf edin.";
  const heroBtn1Text = (hero.btn1Text as string) || "Testə Başla";
  const heroBtn1Url = (hero.btn1Url as string) || "/test";
  const heroBtn2Text = (hero.btn2Text as string) || "Kitabı Əldə Et";
  const heroBtn2Url = (hero.btn2Url as string) || waUrl;

  const aboutTitle = (about.title as string) || "Müəllif Haqqında & Kitab";
  const aboutBody = (about.body as string) || '"İnsan Bilinç Mexanizmi" sadəcə bir kitab deyil, insanın özünü dərk etməsi üçün yazılmış bələdçidir.';
  const aboutAuthorName = (about.authorName as string) || "Rzahan";
  const aboutAuthorTitle1 = (about.authorTitle1 as string) || "İnsan Bilinç Mexanizmi müəllifi";
  const aboutAuthorTitle2 = (about.authorTitle2 as string) || "Rzahan Academy qurucusu";
  const aboutBtnText = (about.btnText as string) || "MÜRACİƏT ET";
  const aboutBtnUrl = (about.btnUrl as string) || waUrl;

  const statLabel0 = (stats.label0 as string) || "İştirakçı sayı";
  const statLabel1 = (stats.label1 as string) || "Tamamlanan testlər";
  const statLabel2 = (stats.label2 as string) || "Verilmiş sertifikatlar";
  const statLabel3 = (stats.label3 as string) || "Aktiv istifadəçilər";

  const realStats = landing?.stats;
  const statValues = [
    realStats?.members ? `${realStats.members.toLocaleString()}+` : "—",
    realStats?.tests ? `${realStats.tests.toLocaleString()}+` : "—",
    realStats?.certificates ? `${realStats.certificates.toLocaleString()}+` : "—",
    realStats?.members ? `${Math.round(realStats.members * 0.25).toLocaleString()}+` : "—",
  ];

  const programs = landing?.programs ?? [];
  const articles = landing?.articles ?? [];
  const stories = landing?.stories ?? [];
  const todaysThought = landing?.todaysThought ?? null;
  const cmsTestimonials = landing?.testimonials ?? [];
  const displayReviews = cmsTestimonials.length > 0 ? cmsTestimonials : DEMO_REVIEWS;
  const packages = landing?.packages ?? [];
  const cmsQAs = landing?.faqs ?? [];
  const displayFaqs = cmsQAs.length > 0 ? cmsQAs : DEMO_FAQS;
  const announcements = landing?.announcements ?? [];

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { delay, duration: 0.4 },
  });

  return (
    <PublicLayout>
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      {isVisible(hero) && (
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
                  <Zap className="h-4 w-4" /> {heroBadge}
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold text-indigo-950 leading-[1.1] mb-6 tracking-tight">
                  {heroHeadline[0]}
                  {heroHeadline[1] && <><br /><span className="gradient-text">{heroHeadline[1]}</span></>}
                </h1>
                <p className="text-xl text-indigo-900/70 mb-10 max-w-2xl mx-auto lg:mx-0">{heroSubtitle}</p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Link href={heroBtn1Url.startsWith("/") ? heroBtn1Url : "/test"}>
                    <Button size="lg" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200" data-testid="button-hero-test">
                      {heroBtn1Text}
                    </Button>
                  </Link>
                  <a href={heroBtn2Url} target={heroBtn2Url.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 rounded-2xl text-base font-bold border-2 border-indigo-200 text-indigo-950 hover:bg-indigo-50 hover:-translate-y-0.5 transition-all duration-200" data-testid="button-hero-book">
                      {heroBtn2Text}
                    </Button>
                  </a>
                </div>
              </motion.div>

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
                    <img src={bookCoverPath} alt="İnsan Bilinç Mexanizmi Kitabı" className="relative z-10 w-full h-auto rounded-r-3xl shadow-[0_30px_60px_rgba(91,95,239,0.35),0_0_0_1px_rgba(91,95,239,0.08)]" />
                    <div className="absolute top-0 left-0 h-full w-[18px] rounded-l-lg z-20 shadow-[-4px_0_8px_rgba(0,0,0,0.15)]" style={{ background: "linear-gradient(to right, #1e1b4b, #312e81)", transform: "rotateY(-90deg) translateZ(-9px) translateX(-9px)", transformOrigin: "left center" }} />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* ── ANNOUNCEMENTS ────────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "announcements")) && announcements.length > 0 && (
        <section className="py-8 bg-amber-50 border-y border-amber-100">
          <div className="container mx-auto px-4 space-y-3">
            {announcements.map((a, i) => (
              <motion.div key={a.id} {...fadeUp(i * 0.05)} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-amber-200 shadow-sm">
                <span className="text-xl shrink-0">📢</span>
                <div>
                  <p className="font-bold text-amber-900">{a.title}</p>
                  {a.content && <p className="text-sm text-amber-800/80 mt-0.5">{a.content}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── STATS ────────────────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "stats")) && (
        <section className="py-16 bg-white border-y border-indigo-100 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: statLabel0, value: statValues[0] },
                { label: statLabel1, value: statValues[1] },
                { label: statLabel2, value: statValues[2] },
                { label: statLabel3, value: statValues[3] },
              ].map((stat, i) => (
                <motion.div key={i} {...fadeUp(i * 0.08)} className="text-center" data-testid={`stat-${i}`}>
                  <div className="text-4xl lg:text-5xl font-bold text-indigo-950 mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-indigo-900/60 uppercase tracking-wider">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── ABOUT / AUTHOR ───────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "about")) && (
        <section id="about" className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto glass-card rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="flex flex-col lg:flex-row gap-12 items-center relative z-10">
                <div className="w-48 md:w-56 shrink-0">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl translate-y-4" />
                    <img src={authorPhotoPath} alt={aboutAuthorName} className="relative z-10 w-full h-auto rounded-2xl shadow-xl" />
                  </div>
                </div>
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-indigo-950 mb-5">{aboutTitle}</h2>
                  <p className="text-lg text-indigo-900/80 mb-6 leading-relaxed">{aboutBody}</p>
                  <div className="mb-3 space-y-0.5">
                    <p className="text-xl font-black text-indigo-950">{aboutAuthorName}</p>
                    <p className="text-sm font-medium text-indigo-600">{aboutAuthorTitle1}</p>
                    <p className="text-sm font-medium text-indigo-500">{aboutAuthorTitle2}</p>
                  </div>
                  <a href={aboutBtnUrl} target="_blank" rel="noreferrer">
                    <Button size="lg" className="h-14 px-10 rounded-2xl text-base font-bold bg-[#25D366] hover:bg-[#22c05c] text-white shadow-lg shadow-[#25D366]/30 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3">
                      <MessageCircle className="h-5 w-5 fill-current" />{aboutBtnText}
                    </Button>
                  </a>
                </div>
                <div className="hidden xl:block shrink-0" style={{ perspective: "800px" }}>
                  <motion.div whileHover={{ rotateY: -15, rotateX: 5, scale: 1.06 }} transition={{ type: "spring", stiffness: 200, damping: 18 }} style={{ transformStyle: "preserve-3d" }} className="relative w-40">
                    <div className="absolute -inset-3 bg-gradient-to-tr from-primary to-accent opacity-20 blur-xl rounded-2xl" />
                    <img src={bookCoverPath} alt="Kitab" className="relative z-10 w-full h-auto rounded-r-xl shadow-[0_20px_40px_rgba(91,95,239,0.3)]" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── 7 STAGES ─────────────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "stages")) && (
        <section id="stages" className="py-32 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-6">7 Şüur Mərhələsi</h2>
              <p className="text-xl text-indigo-900/70">Testi keçərək hazırda hansı mərhələdə olduğunuzu kəşf edin və inkişaf planınızı əldə edin.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {STAGES.map((stage, i) => (
                <motion.div key={stage.id} {...fadeUp(i * 0.06)}
                  className="group p-8 rounded-3xl bg-slate-50 border border-indigo-50 hover:bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
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
      )}

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "howItWorks")) && (
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
                { t: "Sertifikat", d: "Nəticənizi təsdiqləyin" },
              ].map((step, i) => (
                <motion.div key={i} {...fadeUp(i * 0.1)} className="text-center relative">
                  {i < 4 && <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-indigo-500/50 to-transparent" />}
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-900/50 border border-indigo-700 flex items-center justify-center text-xl font-bold mb-6 relative z-10 text-primary-300 shadow-[0_0_20px_rgba(91,95,239,0.3)]">{i + 1}</div>
                  <h4 className="text-lg font-bold mb-2">{step.t}</h4>
                  <p className="text-indigo-300 text-sm">{step.d}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PROGRAMS ────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "programs")) && programs.length > 0 && (
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-4">Seçilmiş Proqramlar</h2>
              <p className="text-xl text-indigo-900/70">Şüur inkişafı üçün ekspert tərəfindən hazırlanmış proqramlar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((p, i) => (
                <motion.div key={p.id} {...fadeUp(i * 0.07)} className="group p-6 rounded-3xl bg-slate-50 border border-indigo-50 hover:bg-white hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                  {p.coverImageUrl && <img src={p.coverImageUrl} alt={p.title} className="w-full h-40 object-cover rounded-2xl mb-5" />}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-primary flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-indigo-950">{p.title}</h3>
                      {p.instructor && <p className="text-xs text-indigo-500">{p.instructor}</p>}
                    </div>
                  </div>
                  {p.description && <p className="text-sm text-indigo-900/70 line-clamp-2 mb-4">{p.description}</p>}
                  <Link href={`/programs/${p.slug}`}>
                    <Button size="sm" variant="outline" className="w-full rounded-xl border-indigo-200 hover:bg-primary hover:text-white hover:border-primary transition-colors">
                      Ətraflı Bax <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/programs">
                <Button variant="outline" className="rounded-2xl border-indigo-200 px-8">Bütün Proqramlar <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TODAY'S THOUGHT ──────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "thought")) && todaysThought && (
        <section className="py-20 bg-indigo-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 aurora-bg opacity-15 pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
            <motion.div {...fadeUp()}>
              <p className="text-lg font-semibold text-indigo-300 mb-6 uppercase tracking-widest">💭 Günün Fikri</p>
              <blockquote className="text-2xl md:text-3xl font-light text-white leading-relaxed mb-6">
                "{todaysThought.text}"
              </blockquote>
              {todaysThought.author && (
                <p className="text-indigo-300 font-medium">— {todaysThought.author}</p>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── LATEST ARTICLES ──────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "articles")) && articles.length > 0 && (
        <section className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-4">Son Məqalələr</h2>
              <p className="text-xl text-indigo-900/70">Şüur, psixologiya və şəxsi inkişaf haqqında məqalələr.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((a, i) => (
                <motion.div key={a.id} {...fadeUp(i * 0.07)} className="group bg-white rounded-3xl border border-indigo-50 overflow-hidden hover:border-primary/20 hover:shadow-xl transition-all duration-300">
                  {a.coverImageUrl && <img src={a.coverImageUrl} alt={a.title} className="w-full h-40 object-cover" />}
                  <div className="p-6">
                    <h3 className="font-bold text-indigo-950 mb-2 line-clamp-2">{a.title}</h3>
                    {a.excerpt && <p className="text-sm text-indigo-900/70 line-clamp-2 mb-4">{a.excerpt}</p>}
                    <div className="flex items-center gap-3 text-xs text-indigo-400">
                      {a.author && <span>{a.author}</span>}
                      {a.readingTimeMinutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{a.readingTimeMinutes} dəq</span>}
                    </div>
                    <Link href={`/articles/${a.slug}`}>
                      <Button size="sm" variant="ghost" className="w-full mt-4 rounded-xl text-primary hover:bg-primary/5">
                        Oxu <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/articles">
                <Button variant="outline" className="rounded-2xl border-indigo-200 px-8">Bütün Məqalələr <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── LATEST LIFE STORIES ──────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "stories")) && stories.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-4">Son Həyat Hekayələri</h2>
              <p className="text-xl text-indigo-900/70">Həyatını dəyişənlərin real hekayələri.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((s, i) => (
                <motion.div key={s.id} {...fadeUp(i * 0.07)} className="group bg-rose-50/50 rounded-3xl border border-rose-100 overflow-hidden hover:border-rose-300/50 hover:shadow-xl transition-all duration-300">
                  {s.imageUrl && <img src={s.imageUrl} alt={s.title} className="w-full h-40 object-cover" />}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="h-4 w-4 text-rose-400" />
                      <span className="text-xs font-medium text-rose-500">Həyat Hekayəsi</span>
                    </div>
                    <h3 className="font-bold text-indigo-950 mb-2 line-clamp-2">{s.title}</h3>
                    {s.excerpt && <p className="text-sm text-indigo-900/70 line-clamp-2 mb-4">{s.excerpt}</p>}
                    <div className="flex items-center gap-3 text-xs text-indigo-400">
                      {s.author && <span>{s.author}</span>}
                      {s.readingTimeMinutes && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.readingTimeMinutes} dəq</span>}
                    </div>
                    <Link href={`/stories/${s.id}`}>
                      <Button size="sm" variant="ghost" className="w-full mt-4 rounded-xl text-rose-600 hover:bg-rose-50">
                        Oxu <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/stories">
                <Button variant="outline" className="rounded-2xl border-indigo-200 px-8">Bütün Hekayələr <ChevronRight className="ml-1 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "testimonials")) && (
        <section id="reyler" className="py-32 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-6">İstifadəçi Rəyləri</h2>
              <p className="text-xl text-indigo-900/70">Testi keçən və həyatını dəyişən insanların hekayələri.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {displayReviews.map((r, i) => (
                <motion.div key={r.id} {...fadeUp(i * 0.1)} className="glass-card p-8 rounded-[2rem]">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: r.rating || 5 }).map((_, j) => (
                      <Star key={j} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-indigo-950 mb-6 leading-relaxed">"{r.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold overflow-hidden">
                      {r.avatarUrl ? <img src={r.avatarUrl} alt="" className="w-full h-full object-cover" /> : r.authorName[0]}
                    </div>
                    <div>
                      <div className="font-bold text-indigo-950">{r.authorName}</div>
                      {"authorTitle" in r && r.authorTitle && <div className="text-xs font-medium text-indigo-500">{r.authorTitle as string}</div>}
                      {r.stageName && <div className="text-xs font-medium text-primary">{r.stageName} mərhələsi</div>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── NİYƏ RZAHAN ACADEMY? ─────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-indigo-50/60 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-2xl mx-auto mb-16" {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-primary font-medium text-sm mb-5 border border-indigo-200">
              <Zap className="h-4 w-4" /> Bizim Üstünlüklər
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-5 leading-tight">Niyə Rzahan Academy?</h2>
            <p className="text-xl text-indigo-900/70">Klassik kurslara bənzəmir — bu, şüurun sistemli transformasiya metodologiyasıdır.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { emoji: "🧠", title: "Elmi Yanaşma", desc: "İnsan bilinc mexanizminə dair elmi araşdırmalara əsaslanan 7 mərhələli şüur modeli." },
              { emoji: "⚡", title: "XP & Səviyyə Sistemi", desc: "Hər dərs, test, tapşırıq XP qazandırır. İnkişafını real vaxtda izləyirsən." },
              { emoji: "🏆", title: "Nailiyyət Sistemi", desc: "Fəaliyyətlərinə görə nailiyyətlər açılır, inkişaf balın böyüyür." },
              { emoji: "📊", title: "Şüur Qrafiki", desc: "Hər testdən sonra şüur səviyyən ölçülür, inkişaf qrafikində görürsən." },
              { emoji: "🎓", title: "Rəsmi Sertifikat", desc: "Mərhələni tamamla, rəqəmsal sertifikatı al və inkişafını sənədləşdir." },
              { emoji: "🤝", title: "Azərbaycan Dilinde", desc: "Tam Azərbaycan dilinde hazırlanmış, yerli kontekstə uyğunlaşdırılmış məzmun." },
            ].map((item, i) => (
              <motion.div key={i} {...fadeUp(i * 0.07)}
                className="glass-card p-7 rounded-[2rem] hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-3xl mb-5">
                  {item.emoji}
                </div>
                <h3 className="text-xl font-bold text-indigo-950 mb-3">{item.title}</h3>
                <p className="text-indigo-900/70 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SƏNİN İNKİŞAF YOLUN ─────────────────────────────────────────────── */}
      <section className="py-28 bg-white relative overflow-hidden">
        <div className="absolute left-0 top-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="container mx-auto px-4">
          <motion.div className="text-center max-w-2xl mx-auto mb-20" {...fadeUp(0)}>
            <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-5 leading-tight">Sənin İnkişaf Yolun</h2>
            <p className="text-xl text-indigo-900/70">Başlanğıcdan davamlı inkişafa doğru aydın yol xəritəsi.</p>
          </motion.div>
          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line */}
            <div className="absolute top-8 left-[calc(8.33%+1rem)] right-[calc(8.33%+1rem)] h-0.5 bg-gradient-to-r from-indigo-200 via-primary to-indigo-200 hidden md:block" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
              {[
                { emoji: "🌱", step: "1", name: "Başlanğıc",       desc: "Testlə şüur səviyyəni müəyyən et" },
                { emoji: "📚", step: "2", name: "Öyrənmə",          desc: "Dərslər, məqalələr oxu, XP qazaN" },
                { emoji: "✅", step: "3", name: "Tətbiq",           desc: "Günlük tapşırıqları icra et" },
                { emoji: "📈", step: "4", name: "İnkişaf",          desc: "Səviyyən yüksəlir, bal artır" },
                { emoji: "🎓", step: "5", name: "Sertifikat",       desc: "Mərhələni bitir, sertifikat al" },
                { emoji: "🔄", step: "6", name: "Davamlı İnkişaf",  desc: "Yeni proqramlarla irəlilə" },
              ].map((s, i) => (
                <motion.div key={i} {...fadeUp(i * 0.1)} className="flex flex-col items-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-100 border-2 border-primary/20 flex items-center justify-center text-3xl relative z-10 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200">
                    {s.emoji}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary/60 uppercase tracking-wider mb-1">Addım {s.step}</div>
                    <div className="font-bold text-indigo-950 mb-1">{s.name}</div>
                    <p className="text-xs text-indigo-900/60 leading-relaxed">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div className="text-center mt-16" {...fadeUp(0.6)}>
            <Link href="/test">
              <Button size="lg" className="h-14 px-10 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all">
                İndi Başla <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── PACKAGES ─────────────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "packages")) && packages.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-4">Üzvlük Paketləri</h2>
              <p className="text-xl text-indigo-900/70">Səviyyənizə uyğun bir paket seçin.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {packages.map((pkg, i) => (
                <motion.div key={pkg.id} {...fadeUp(i * 0.07)} className="glass-card p-8 rounded-[2rem] text-center hover:shadow-xl transition-all duration-300">
                  <div className="text-5xl mb-4">{pkg.emoji || "📦"}</div>
                  <h3 className="text-2xl font-bold text-indigo-950 mb-3">{pkg.name}</h3>
                  {pkg.description && <p className="text-indigo-900/70 mb-6 leading-relaxed">{pkg.description}</p>}
                  <a href={waUrl} target="_blank" rel="noreferrer">
                    <Button className="w-full rounded-2xl bg-primary hover:bg-primary/90">Ətraflı Məlumat</Button>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "faqs")) && (
        <section id="faq" className="py-32 bg-white border-t border-indigo-50">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-indigo-950 mb-6">Tez-tez Verilən Suallar</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {displayFaqs.map((faq, i) => (
                <AccordionItem key={faq.id} value={`item-${i}`} className="border-indigo-100 px-2">
                  <AccordionTrigger className="text-left text-lg font-bold text-indigo-950 hover:text-primary py-6">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-indigo-900/70 text-base leading-relaxed pb-6">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      {isVisible(sec(cfg, "cta")) && (
        <section className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="max-w-4xl mx-auto glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
              <div className="absolute inset-0 aurora-bg opacity-30" />
              <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold text-indigo-950 mb-6 tracking-tight">Oyanışa Hazırsınız?</h2>
                <p className="text-xl text-indigo-900/80 mb-10 max-w-2xl mx-auto">Özünüzü kəşf etmək üçün ilk addımı atın. Dəyişim indi başlayır.</p>
                <Link href="/test">
                  <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_8px_30px_rgb(91,95,239,0.4)] hover:shadow-[0_8px_40px_rgb(91,95,239,0.6)] hover:-translate-y-1 transition-all duration-300">
                    Testə Başla <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
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
                {(footer.tagline as string) || "İnsan Bilinç Mexanizmi — Şüurun 7 mərhələli transformasiya proqramı."}
              </p>
              <div className="flex gap-4">
                <a href={ttUrl} target="_blank" rel="noreferrer" aria-label="TikTok" className="w-11 h-11 rounded-xl bg-indigo-900 hover:bg-indigo-800 flex items-center justify-center transition-colors group">
                  <svg className="w-5 h-5 fill-indigo-300 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/></svg>
                </a>
                <a href={tgUrl} target="_blank" rel="noreferrer" aria-label="Telegram" className="w-11 h-11 rounded-xl bg-indigo-900 hover:bg-indigo-800 flex items-center justify-center transition-colors group">
                  <svg className="w-5 h-5 fill-indigo-300 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </a>
                <a href={waUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-11 h-11 rounded-xl bg-indigo-900 hover:bg-indigo-800 flex items-center justify-center transition-colors group">
                  <svg className="w-5 h-5 fill-indigo-300 group-hover:fill-white transition-colors" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
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
                <li><Link href="/articles" className="hover:text-white transition-colors">Məqalələr</Link></li>
                <li><Link href="/stories" className="hover:text-white transition-colors">Hekayələr</Link></li>
                <li><Link href="/test" className="hover:text-white transition-colors">Testə Başla</Link></li>
                <li><Link href="/sign-in" className="hover:text-white transition-colors">Daxil ol</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-indigo-900 pt-8 text-center text-sm text-indigo-400">
            &copy; {new Date().getFullYear()} {(footer.copyright as string) || "Rzahan Academy. Bütün hüquqlar qorunur."}
          </div>
        </div>
      </footer>
    </PublicLayout>
  );
}
