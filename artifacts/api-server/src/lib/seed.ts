import bcrypt from "bcryptjs";
import {
  db, usersTable, profilesTable,
  cmsArticleCategoriesTable, cmsStoryCategoriesTable,
  cmsPackagesTable, cmsProgramsTable, cmsModulesTable, cmsLessonsTable,
  cmsArticlesTable, cmsLifeStoriesTable, cmsFaqsTable, cmsTestimonialsTable,
} from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { logger } from "./logger";

const ADMIN_ID = "00000000-0000-0000-0000-000000000001";
const ADMIN_USERNAME = "Rzahan";
const ADMIN_FULL_NAME = "Orxan Rzayev";
const ADMIN_PASSWORD = "Orxan919@";

export async function seedAdmin(): Promise<void> {
  try {
    const [existing] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.username, ADMIN_USERNAME)).limit(1);
    if (existing) { logger.info("Admin user already exists, skipping seed"); return; }
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await db.insert(usersTable).values({ id: ADMIN_ID, username: ADMIN_USERNAME, fullName: ADMIN_FULL_NAME, email: null, passwordHash, role: "admin" }).onConflictDoNothing();
    await db.insert(profilesTable).values({ userId: ADMIN_ID, firstName: "Orxan", lastName: "Rzayev", email: null }).onConflictDoNothing();
    logger.info("Admin user seeded successfully");
  } catch (err) { logger.error({ err }, "Failed to seed admin user"); }
}

function toSlug(s: string) {
  return s.toLowerCase()
    .replace(/ş/g, "sh").replace(/ç/g, "ch").replace(/ğ/g, "gh")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
    .replace(/ə/g, "e").replace(/İ/g, "i")
    .replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const DEFAULT_ARTICLE_CATEGORIES = [
  "Psixologiya", "Şəxsi İnkişaf", "Fəlsəfə", "Həyat", "Şüur",
  "Münasibətlər", "Valideynlik", "Liderlik", "Ünsiyyət", "Motivasiya",
];
const DEFAULT_STORY_CATEGORIES = [
  "Qərarlar", "Ailə", "İş Həyatı", "Dostluq", "Asılılıq",
  "Valideynlik", "Şəxsi İnkişaf", "Psixologiya", "Həyat Dərsləri",
];

export async function seedCategories(): Promise<void> {
  try {
    const [{ c: artCount }] = await db.select({ c: count() }).from(cmsArticleCategoriesTable);
    if (Number(artCount) === 0) {
      await db.insert(cmsArticleCategoriesTable).values(DEFAULT_ARTICLE_CATEGORIES.map((name, i) => ({ name, slug: toSlug(name), sortOrder: i, isActive: true }))).onConflictDoNothing();
      logger.info("Default article categories seeded");
    }
    const [{ c: storyCount }] = await db.select({ c: count() }).from(cmsStoryCategoriesTable);
    if (Number(storyCount) === 0) {
      await db.insert(cmsStoryCategoriesTable).values(DEFAULT_STORY_CATEGORIES.map((name, i) => ({ name, slug: toSlug(name), sortOrder: i, isActive: true }))).onConflictDoNothing();
      logger.info("Default story categories seeded");
    }
  } catch (err) { logger.error({ err }, "Failed to seed categories"); }
}

// ── PACKAGES ──────────────────────────────────────────────────────────────────

export async function seedPackages(): Promise<void> {
  try {
    const [{ c }] = await db.select({ c: count() }).from(cmsPackagesTable);
    if (Number(c) > 0) return;

    await db.insert(cmsPackagesTable).values([
      {
        name: "Başlanğıc", slug: "baslanqic", emoji: "🌱",
        description: "Platforma ilə tanışlıq üçün pulsuz paket.",
        longDescription: "Başlanğıc paketi Rzahan Academy-yə ilk addımınızdır. Şüur testini keçin, nəticənizi öyrənin, sertifikat əldə edin. Heç bir ödəniş tələb olunmur.",
        color: "#6366f1",
        features: JSON.stringify(["Şüur Testi", "Sertifikat", "7 Mərhələ Analizi", "Günlük Gündəlik", "Leaderboard"]),
        monthlyPrice: "Pulsuz", yearlyPrice: "Pulsuz",
        isRecommended: false, requiredLevel: 0,
        btnText: "Qoşul", btnUrl: "/sign-up", isActive: true, sortOrder: 0,
      },
      {
        name: "İnkişaf", slug: "inkisaf", emoji: "🚀",
        description: "Şəxsi inkişaf üçün genişləndirilmiş giriş.",
        longDescription: "İnkişaf paketi ilə bütün proqramlara, məqalələrə və həyat hekayələrinə tam giriş əldə edin. Günlük tapşırıqlar, ekspert məzmunu və şəxsi inkişaf yolunuz açılır.",
        color: "#8b5cf6",
        features: JSON.stringify(["Başlanğıc paketi + Hamısı", "Bütün Proqramlara Giriş", "Bütün Məqalələr", "Bütün Hekayələr", "Prioritet Dəstək", "Həftəlik Canlı Sessiya"]),
        monthlyPrice: "29₼", yearlyPrice: "290₼",
        isRecommended: true, requiredLevel: 1,
        btnText: "Qoşul", btnUrl: null, isActive: true, sortOrder: 1,
      },
      {
        name: "Ustad", slug: "ustad", emoji: "👑",
        description: "Tam transformasiya üçün ən üst səviyyə.",
        longDescription: "Ustad paketi şüur transformasiyasının zirvəsidir. Fərdi mentorluq, eksklüziv məzmun, birbaşa müəllif ilə sessiyalar və bütün premium imkanlara tam giriş.",
        color: "#f59e0b",
        features: JSON.stringify(["İnkişaf paketi + Hamısı", "Fərdi Mentorluq", "Eksklüziv Məzmun", "Müəlliflə Birbaşa Sessiya", "Premium Sertifikatlar", "Ömürlük Giriş Seçimi"]),
        monthlyPrice: "49₼", yearlyPrice: "490₼",
        isRecommended: false, requiredLevel: 2,
        btnText: "Qoşul", btnUrl: null, isActive: true, sortOrder: 2,
      },
    ]).onConflictDoNothing();
    logger.info("Default packages seeded");
  } catch (err) { logger.error({ err }, "Failed to seed packages"); }
}

// ── DEMO CONTENT ──────────────────────────────────────────────────────────────

export async function seedDemoContent(): Promise<void> {
  try {
    // Programs
    const [{ c: progCount }] = await db.select({ c: count() }).from(cmsProgramsTable);
    if (Number(progCount) === 0) {
      const prog1 = await db.insert(cmsProgramsTable).values({
        title: "Şüurlu Həyat Üçün 21 Günlük Proqram",
        slug: "shuurlu-heyat-21-gun",
        description: "21 günlük strukturlu proqram ilə şüurunuzu oyandırın, gündəlik vərdişlər qurun və dəyişimi hiss edin.",
        status: "published", featured: true, difficulty: "beginner",
        instructor: "Rzahan", sortOrder: 0,
      }).returning().then(r => r[0]);

      await db.insert(cmsProgramsTable).values({
        title: "Münasibətlərə Bilinçli Yanaşma",
        slug: "munasibet-biling-yanasma",
        description: "Ailə, iş və dostluq münasibətlərinizdə şüurun rolu. Əlaqələrinizi dərinləşdirin.",
        status: "published", featured: true, difficulty: "intermediate",
        instructor: "Rzahan", sortOrder: 1,
      }).onConflictDoNothing();

      // Module + 2 lessons for prog1
      if (prog1) {
        const [mod1] = await db.insert(cmsModulesTable).values({
          programId: prog1.id, title: "Giriş: Şüur Nədir?",
          description: "Şüurun elmi və fəlsəfi tərifi, 7 mərhələyə giriş.", sortOrder: 0, isActive: true,
        }).returning();
        if (mod1) {
          await db.insert(cmsLessonsTable).values([
            { moduleId: mod1.id, title: "Şüur və Bilinçsizlik Arasındakı Fərq", contentHtml: "Bu dərsdə şüurun nə olduğunu və insanların çox vaxt bilinçsiz niyə yaşadığını öyrənəcəksiniz.", sortOrder: 0, status: "published" },
            { moduleId: mod1.id, title: "7 Mərhələ: Yatmış-dan Yaradıcı-ya Yol", contentHtml: "Şüurun 7 mərhələsini tanıyın. Hər mərhələnin xüsusiyyətlərini anlayın.", sortOrder: 1, status: "published" },
          ]).onConflictDoNothing();
        }
      }
      logger.info("Demo programs seeded");
    }

    // Articles
    const [{ c: artCount }] = await db.select({ c: count() }).from(cmsArticlesTable);
    if (Number(artCount) === 0) {
      await db.insert(cmsArticlesTable).values([
        { title: "Şüurun 7 Mərhələsi: Özünü Tanımağın Əsasları", slug: "shuurun-7-merhelesi", excerpt: "İnsan şüurunun 7 mərhələsi — Yatmışdan Yaradıcıya uzanan transformasiya yolu haqqında.", contentHtml: "<p>Şüurun 7 mərhələsi insanın özünü tanıma yolunun xəritəsidir. Hər mərhələ özünəməxsus dünyagörüşü, hissiyyat və davranış modeli ilə xarakterizə olunur.</p>", status: "published", author: "Rzahan", readingTimeMinutes: 7 },
        { title: "Gündəlik Meditasiyanın Beyin Üzərindəki Elmi Təsiri", slug: "gundəlik-meditasiya-beyin", excerpt: "Neyroelm meditasiyanın beyni necə dəyişdirdiyini sübut edir. Araşdırmalar nə deyir?", contentHtml: "<p>Son 20 ildə neyroelmin meditasiya sahəsindəki kəşfləri əsaslı şəkildə dəyişdi. MRI tədqiqatları gündəlik 20 dəqiqəlik meditasiyanın prefrontal korteksi gücləndirib amiqdalanı sakinləşdirdiyini göstərir.</p>", status: "published", author: "Rzahan", readingTimeMinutes: 5 },
        { title: "Niyə İnsanlar Dəyişə Bilmir? Psixoloji Maneələr", slug: "niye-insanlar-deyishe-bilmir", excerpt: "Dəyişim istəyirik, amma bacarmırıq. Bunun arxasındakı psixoloji mexanizmlər nədir?", contentHtml: "<p>İnsanlar dəyişmək istəyəndə ən böyük maneə beynin dəyişim-naməlum əlaqəsidir. Beyin naməlumu təhlükə kimi qiymətləndirir və homeostazı qorumağa çalışır.</p>", status: "published", author: "Rzahan", readingTimeMinutes: 6 },
        { title: "Qərar Vermə Psixologiyası: Bilinçsiz Seçimlərin Sirri", slug: "qerar-verme-psixologiyasi", excerpt: "Günlük qərarlarımızın böyük hissəsi bilinçsiz şəkildə verilir. Bu necə işləyir?", contentHtml: "<p>Tədqiqatçı Benjamin Libet-in məşhur eksperimentləri göstərdi ki, bilinçli qərar vermədən bir neçə saniyə əvvəl beyin artıq fəaliyyətə başlayır.</p>", status: "published", author: "Rzahan", readingTimeMinutes: 8 },
        { title: "Emosional Zəka: Hisslərinizi Anlamaq və İdarə Etmək", slug: "emosional-zeka", excerpt: "EQ IQ-dan daha vacibdirmi? Emosional zəkanın 5 komponenti.", contentHtml: "<p>Daniel Goleman-ın emosional zəka modeli 5 komponentdən ibarətdir: özünüdərk, özünüidarəetmə, motivasiya, empatiya və sosial bacarıqlar.</p>", status: "published", author: "Rzahan", readingTimeMinutes: 6 },
        { title: "Həyatın Mənası: Egzistensial Psixologiya Baxımından", slug: "heyatin-menasi", excerpt: "Viktor Frankl-ın logoterapiyası və həyata mənq vermənin psixoloji əsasları.", contentHtml: "<p>Viktor Frankl Auşvits düşərgəsindən sağ çıxdıqdan sonra yazdı: İnsanı məhv edən şərtlər yox, həmin şərtlərə verilən reaksiyadır. Mənq tapmaq hər şeyi dəyişdirir.</p>", status: "published", author: "Rzahan", readingTimeMinutes: 9 },
      ]).onConflictDoNothing();
      logger.info("Demo articles seeded");
    }

    // Life Stories
    const [{ c: storyCount }] = await db.select({ c: count() }).from(cmsLifeStoriesTable);
    if (Number(storyCount) === 0) {
      await db.insert(cmsLifeStoriesTable).values([
        { title: "21 Gündə Özümü Tanıdım", slug: "21-gunde-ozumu-tanidim", excerpt: "Test nəticəm 2-ci mərhələni göstərdi. O günü unuda bilmirəm.", contentHtml: "<p>Testi keçdikdə nəticəm \"Döyüşçü\" mərhələsini göstərdi. İlk baxışda normal göründü. Amma izahı oxuduqda içimdəki savaşı gördüm.</p>", status: "published", author: "Aytən M.", isFeatured: true, sortOrder: 0 },
        { title: "Testi Keçdikdən Sonra Hər Şey Dəyişdi", slug: "testi-kecdikden-sonra", excerpt: "4-cü mərhələdə olduğumu öyrənmək həyatımın dönüş nöqtəsi oldu.", contentHtml: "<p>Orxan Hüseynov olaraq ömrümdə bunu heç kimsəylə paylaşmamışdım. Test nəticəm \"Görən\" mərhələsini göstərdi.</p>", status: "published", author: "Orxan H.", isFeatured: false, sortOrder: 1 },
        { title: "Münasibətimdə Bir Dönüş Nöqtəsi", slug: "munasibetimdə-donus-nöqtesi", excerpt: "Partnerimlə 3 ildir eyni arqumentləri edirdik.", contentHtml: "<p>Nigar Əliyeva kimi bir çox insan münasibətlərini xarici amillərlə izah edir. Amma öyrəndim: hər münasibət problemi ünsiyyət problemidir.</p>", status: "published", author: "Nigar Ə.", isFeatured: false, sortOrder: 2 },
        { title: "İşimi Atıb Özümü Tapdım", slug: "ishimi-atib-ozumu-tapdim", excerpt: "10 illik karyeram var idi, amma içim boş idi.", contentHtml: "<p>Tural Qasımov olaraq bank sektorunda 10 il çalışdım. Amma hər səhər işə gedərkən bir ağırlıq hiss edirdim. Test nəticəm hər şeyi aydınlaşdırdı.</p>", status: "published", author: "Tural Q.", isFeatured: true, sortOrder: 3 },
        { title: "Anam Kimi Bir İnsan Olmaqdan Qorxurdum", slug: "anam-kimi-olmaqdan-qorxurdum", excerpt: "Valideynliyimdə öz annemin izlərini görürdüm.", contentHtml: "<p>Sevinc Rəhimli olaraq hər zaman \"Anam kimi olmayacağam\" deyirdim. Amma ilk uşağım olanda o hərəkətlərin hamısını edirdim.</p>", status: "published", author: "Sevinc R.", isFeatured: false, sortOrder: 4 },
        { title: "Ustad Sertifikatı Almaq 14 Ay Sürdü", slug: "ustad-sertifikati-14-ay", excerpt: "Hər gün az-az irəliləmək. 14 ayın sonunda tamamilə başqa bir insanam.", contentHtml: "<p>Fərid Babayev olaraq \"7-ci mərhələ\" mənə uzaq görünürdü. Amma hər gün bir addım atdım. 14 ayın sonunda sertifikatı əldə etdim.</p>", status: "published", author: "Fərid B.", isFeatured: true, sortOrder: 5 },
      ]).onConflictDoNothing();
      logger.info("Demo life stories seeded");
    }

    // FAQs
    const [{ c: faqCount }] = await db.select({ c: count() }).from(cmsFaqsTable);
    if (Number(faqCount) === 0) {
      await db.insert(cmsFaqsTable).values([
        { question: "Test nə qədər vaxt aparır?", answer: "Test 40 sualdan ibarətdir və adətən 10-15 dəqiqə vaxt aparır. Brauzer bağlansa belə cavablarınız avtomatik saxlanılır.", isActive: true, sortOrder: 0 },
        { question: "Sertifikatı necə əldə edə bilərəm?", answer: "Testi tamamladıqdan sonra nəticə səhifəsindəki 'Sertifikat Al' düyməsinə klikləyərək sertifikatınızı rəqəmsal formatda əldə edə bilərsiniz.", isActive: true, sortOrder: 1 },
        { question: "Nəticəm gizli qalır?", answer: "Bəli, test nəticələriniz tam məxfidir. Yalnız siz görə bilərsiniz. Admin panelindəki ümumi statistika yalnız anonim rəqəmlərdən ibarətdir.", isActive: true, sortOrder: 2 },
        { question: "Testi yenidən keçə bilərəmmi?", answer: "Bəli, inkişafınızı izləmək üçün testi istədiyiniz vaxt yenidən keçə bilərsiniz. Hər nəticəniz tarixi ilə saxlanılır.", isActive: true, sortOrder: 3 },
        { question: "İnkişaf paketi nə üstünlüklər verir?", answer: "İnkişaf paketi ilə bütün proqramlara, məqalələrə, həyat hekayələrinə tam giriş əldə edirsiniz. Həmçinin prioritet dəstək və həftəlik canlı sessiyalara qoşula bilərsiniz.", isActive: true, sortOrder: 4 },
        { question: "Ustad paketi kimlər üçündür?", answer: "Ustad paketi transformasiyanı daha dərindən yaşamaq istəyənlər üçündür. Fərdi mentorluq, müəlliflə birbaşa sessiya və eksklüziv məzmun daxildir.", isActive: true, sortOrder: 5 },
        { question: "Üzvlük avtomatik uzadılır?", answer: "Xeyr. Üzvlük müddəti bitdikdə hesabınız avtomatik olaraq Başlanğıc paketinə keçir. Proqress, sertifikatlar və bütün tarixi məlumatlar qorunur.", isActive: true, sortOrder: 6 },
        { question: "Paket üçün necə müraciət edə bilərəm?", answer: "Landing page-dəki paket kartında 'Qoşul' düyməsinə klikləyin, məlumatlarınızı doldurun. Admin sizinlə ən qısa zamanda əlaqə saxlayacaq.", isActive: true, sortOrder: 7 },
        { question: "Ödəniş hansı üsullarla qəbul edilir?", answer: "Hazırda ödənişlər bank köçürməsi və nakit yolla qəbul edilir. Ödəniş təsdiqləndikdən sonra üzvlüyünüz aktiv edilir.", isActive: true, sortOrder: 8 },
        { question: "Proqramlara giriş nə vaxt başlayır?", answer: "Üzvlüyünüz aktiv edildikdən dərhal sonra bütün premium məzmuna giriş açılır. Bildiriş alacaqsınız.", isActive: true, sortOrder: 9 },
        { question: "Paketimi dəyişə bilərəmmi?", answer: "Bəli. İstənilən vaxt admin ilə əlaqə saxlayaraq paketinizi yüksəldə bilərsiniz. Mövcud üzvlük müddəti yeni pakete köçürülür.", isActive: true, sortOrder: 10 },
        { question: "Platformada kimə müraciət edə bilərəm?", answer: "WhatsApp (+994 55 919 5001), Telegram (@rzahanacademy) və ya profilinizin 'Dəstək' bölməsi vasitəsilə bizimlə əlaqə saxlaya bilərsiniz.", isActive: true, sortOrder: 11 },
      ]).onConflictDoNothing();
      logger.info("Demo FAQs seeded");
    }

    // Testimonials
    const [{ c: testCount }] = await db.select({ c: count() }).from(cmsTestimonialsTable);
    if (Number(testCount) === 0) {
      await db.insert(cmsTestimonialsTable).values([
        { authorName: "Aytən Məmmədova", authorTitle: "Müəllim", content: "Test nəticəm məni çox düşündürdü. Həyatıma tamam fərqli bir nöqteyi-nəzərdən baxmağa başladım. Rzahan Academy-nin yanaşması sadəcə unikaldır.", rating: 5, stageName: "Axtaran", isActive: true, isFeatured: true, sortOrder: 0 },
        { authorName: "Orxan Hüseynov", authorTitle: "Sahibkar", content: "Bu testi keçənə qədər özümü nə qədər az tanıdığımı anlamadım. İndi hər gün gündəlik tapşırıqları yerinə yetirirəm və dəyişim hiss edirəm.", rating: 5, stageName: "Görən", isActive: true, isFeatured: true, sortOrder: 1 },
        { authorName: "Nigar Əliyeva", authorTitle: "Maliyyəçi", content: "Sertifikatı əldə etdikdə çox qürur hiss etdim. Bu platforma şüurun inkişafını elmi əsaslarla izah edir. Dostlarıma tövsiyə etdim.", rating: 5, stageName: "İnteqrator", isActive: true, isFeatured: false, sortOrder: 2 },
        { authorName: "Tural Qasımov", authorTitle: "İT Mütəxəssisi", content: "Əvvəllər meditasiyanı ciddiyə almırdım. Ancaq platformanın günlük tapşırıqları sayəsində 21 gün streak yaratdım. Nəticə özü danışır.", rating: 5, stageName: "Sehrbaz", isActive: true, isFeatured: false, sortOrder: 3 },
        { authorName: "Sevinc Rəhimli", authorTitle: "Valideyn", content: "Kitabı oxuduqdan sonra platformaya qeydiyyatdan keçdim. İkisi birlikdə çox güclü effekt verir. Hər kəsə tövsiyə edirəm.", rating: 4, stageName: "Axtaran", isActive: true, isFeatured: false, sortOrder: 4 },
        { authorName: "Fərid Babayev", authorTitle: "Mühasib", content: "İlk testdən 4-cü mərhələdə olduğumu öyrəndim. Şüurumun hansı səviyyədə olduğunu bilmək hər şeyi dəyişdirdi. Mükəmməl platforma.", rating: 5, stageName: "Görən", isActive: true, isFeatured: true, sortOrder: 5 },
      ]).onConflictDoNothing();
      logger.info("Demo testimonials seeded");
    }
  } catch (err) { logger.error({ err }, "Failed to seed demo content"); }
}
