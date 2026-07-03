import { Moon, Shield, Telescope, User, Gamepad2, Wand2, Mountain } from "lucide-react";

export const STAGES = [
  {
    id: 1,
    name: "Yatmış",
    icon: Moon,
    description: "Şüur hələ oyanmayıb, avtopilotda yaşayış. Reaksiyalarla hərəkət.",
    color: "#64748b",
    coreQuestion: "Mən niyə belə davranıram?",
    strengths: ["Möhkəm rutin qurmaq bacarığı", "Sabitlik duyğusu", "Qoruyucu mexanizmlər"],
    focusAreas: ["Özünü müşahidə praktikası", "Şüurlu seçim etmək", "Daxili dialoqa qulaq asmaq"],
    nextStepAdvice: "Gündəlik 5 dəqiqə özünü müşahidə edərək avtopilot reaksiyalarınızı fərk etməyə başlayın.",
    todayTask: "Bu gün 3 avtomatik reaksiyanızı yazın",
    weekTask: "Hər gün 10 dəqiqə meditasiya edin",
    monthTask: "Bir inancınızı sorğulayın",
    yearTask: "Şüurun 2-ci mərhələsinə çatmaq üçün kitabı tamamlayın"
  },
  {
    id: 2,
    name: "Döyüşçü",
    icon: Shield,
    description: "Həyatla mübarizə, problemləri həll etmə cəhdi, daxili gərginlik.",
    color: "#ef4444",
    coreQuestion: "Məsuliyyəti necə qəbul edə bilərəm?",
    strengths: ["Güclü iradə", "Məsuliyyət duyğusu", "Çətinliklərə tab gətirmək"],
    focusAreas: ["Daxili sülhü tapmaq", "Mübarizəsiz axmağı öyrənmək", "Özünə mərhəmət"],
    nextStepAdvice: "Mübarizə hissini müşahidə edin — onunla döyüşmək əvəzinə, onu anlayın.",
    todayTask: "Bu gün bir çətinliyi məsuliyyətlə qəbul edin",
    weekTask: "Hər axşam 3 şeyə görə minnətdar olun",
    monthTask: "Bir qorxunuzla üzləşin",
    yearTask: "Hər seçiminizin nəticəsini izləyərək məsuliyyəti inkişaf etdirin"
  },
  {
    id: 3,
    name: "Kəşfiyyatçı",
    icon: Telescope,
    description: "Yeni yollar, mənalar və özünü dərk axtarışının başlanğıcı.",
    color: "#f59e0b",
    coreQuestion: "Həqiqət nədir?",
    strengths: ["Güclü maraq hissi", "Açıq fikirlilik", "Öyrənmə həvəsi"],
    focusAreas: ["Dərinə getmək — səthilik yox", "Müxtəlif mənbələrdən öyrənmək", "Praktik tətbiq etmək"],
    nextStepAdvice: "Hər gün bir yeni fikir öyrənib onu həyatınıza tətbiq etməyə çalışın.",
    todayTask: "Bir kitab oxuyun və ya podcast dinləyin",
    weekTask: "Yeni bir perspektivə açıq olun",
    monthTask: "Bir mentorla ünsiyyət qurun",
    yearTask: "Öz fəlsəfənizi formalaşdırın"
  },
  {
    id: 4,
    name: "Şəxsiyyət",
    icon: User,
    description: "Öz unikallığını tapmaq, məsuliyyət almaq və dəyərləri formalaşdırmaq.",
    color: "#10b981",
    coreQuestion: "Mən kimim?",
    strengths: ["Güclü şəxsiyyət", "Dəyərlərə sadiqlik", "Autentiklik"],
    focusAreas: ["Dəyərlərini həyata keçirmək", "Digərləri ilə sərhədlər", "Özünə sadiq qalmaq"],
    nextStepAdvice: "Öz dəyərlərinizi yazın və hər gün bir qərarınızın bu dəyərlərlə uyğun olub-olmadığını yoxlayın.",
    todayTask: "Ən vacib 5 dəyərinizi yazın",
    weekTask: "Bir qərarınızı dəyərlərinizə əsasən verin",
    monthTask: "Bir münasibətdə autentik olun",
    yearTask: "Öz unikal mahiyyətinizi dünyaya çatdıran bir layihə başladın"
  },
  {
    id: 5,
    name: "Oyunçu",
    icon: Gamepad2,
    description: "Həyatın qaydalarını anlamaq, sərbəstlik və ustalıqla yaratmaq.",
    color: "#6366f1",
    coreQuestion: "Bu oyun necə işləyir?",
    strengths: ["Sistem düşüncəsi", "Strategiya qurmaq", "Sürətli adaptasiya"],
    focusAreas: ["Emosiyanı strategiyaya bağlamaq", "Uzunmüddətli baxış", "Komanda ilə işləmək"],
    nextStepAdvice: "Həyatınızın bir sahəsini oyun kimi görün — qaydaları anlayın, strategiya qurun, oynayın.",
    todayTask: "Bir problemi oyun kimi çözün",
    weekTask: "Uzunmüddətli hədəf belirleyin",
    monthTask: "Bir strategiya qurub test edin",
    yearTask: "Bir sahədə ustadlıq səviyyəsinə çatın"
  },
  {
    id: 6,
    name: "Sehrbaz",
    icon: Wand2,
    description: "Öz reallığını və şüurunu şüurlu şəkildə transformasiya etmək.",
    color: "#8b5cf6",
    coreQuestion: "Daxilim xaricimi necə yaradır?",
    strengths: ["Dərindən dönüşüm qabiliyyəti", "İntuisiya", "Enerji idarəetməsi"],
    focusAreas: ["Daxili dünya ilə bağlantı", "Şüurlu yaradıcılıq", "Başqalarına rəhbərlik"],
    nextStepAdvice: "Hər sabah niyyət qurun — bu gün düşüncəniz, duyğunuz və hərəkətləriniz necə olacaq?",
    todayTask: "Bir düşüncə qəlibini dəyişdirin",
    weekTask: "Hər gün niyyət qurun",
    monthTask: "Bir transformasiya praktikası başladın",
    yearTask: "Daxili ustadlığı inkişaf etdirərək başqalarına rəhbərlik edin"
  },
  {
    id: 7,
    name: "Yaradıcı",
    icon: Mountain,
    description: "Mənbəyə bağlanmaq, tam oyanış və başqaları üçün bələdçi olmaq.",
    color: "#06b6d4",
    coreQuestion: "Mən nə yaratmaq üçün buradayam?",
    strengths: ["Mənbəyə bağlantı", "Bələdçilik", "Yaradıcı potansial"],
    focusAreas: ["Hədiyyəni paylaşmaq", "Davamlı praktika", "Miras yaratmaq"],
    nextStepAdvice: "Öz hədiyyənizi dünyaya verin — nə yaratmaq istədiyinizi müəyyən edib ilk addımı atın.",
    todayTask: "Bir insanın həyatına dəyər əlavə edin",
    weekTask: "Öz hədiyyənizi bir layihəyə çevirin",
    monthTask: "Bir cəmiyyətə xidmət edin",
    yearTask: "Dünyada iz buraxacaq bir iş yaradın"
  }
];

export const TEST_SECTIONS = [
  { id: 1, name: "Özünüdərk" },
  { id: 2, name: "Məsuliyyət" },
  { id: 3, name: "Kəşfiyyat" },
  { id: 4, name: "Şəxsiyyət" },
  { id: 5, name: "Strategiya" },
  { id: 6, name: "Transformasiya" },
  { id: 7, name: "Yaradıcılıq" },
  { id: 8, name: "Mənbə" }
];

export const QUESTIONS: Array<{
  id: number;
  sectionId: number;
  sectionName: string;
  text: string;
  reversed: boolean;
}> = [
  { id: 1,  sectionId: 1, sectionName: "Özünüdərk",     reversed: true,  text: "Həyatım avtomatik rejimdə keçir; seçimlərim çox vaxt şüursuz olur." },
  { id: 2,  sectionId: 1, sectionName: "Özünüdərk",     reversed: true,  text: "Problemlərimin səbəbini əsasən xarici amillərdə görürəm." },
  { id: 3,  sectionId: 1, sectionName: "Özünüdərk",     reversed: true,  text: "Nə istədiyimi çox vaxt dəqiq bilmirəm." },
  { id: 4,  sectionId: 1, sectionName: "Özünüdərk",     reversed: true,  text: "Qərarlarımı başqalarının rəyi müəyyən edir." },
  { id: 5,  sectionId: 1, sectionName: "Özünüdərk",     reversed: true,  text: "Həyatımı nəzarət altında saxladığımı hiss etmirəm." },

  { id: 6,  sectionId: 2, sectionName: "Məsuliyyət",    reversed: false, text: "Hər şeyə görə məsuliyyəti özüm götürürəm." },
  { id: 7,  sectionId: 2, sectionName: "Məsuliyyət",    reversed: false, text: "Çətinliklərdən qaçmaq əvəzinə onlarla üzləşməyə çalışıram." },
  { id: 8,  sectionId: 2, sectionName: "Məsuliyyət",    reversed: false, text: "Özünüidarə üzərində ardıcıl işləyirəm." },
  { id: 9,  sectionId: 2, sectionName: "Məsuliyyət",    reversed: false, text: "Daxili gərginliyi mübarizəsiz şəkildə idarə edə bilirəm." },
  { id: 10, sectionId: 2, sectionName: "Məsuliyyət",    reversed: false, text: "Mübarizə əzmim həyatımı dəyişdirə bilir." },

  { id: 11, sectionId: 3, sectionName: "Kəşfiyyat",     reversed: false, text: "Həyatın mənasını və məqsədini aktiv axtarıram." },
  { id: 12, sectionId: 3, sectionName: "Kəşfiyyat",     reversed: false, text: "Mövcud inanclarımı sorğulamağa açığam." },
  { id: 13, sectionId: 3, sectionName: "Kəşfiyyat",     reversed: false, text: "Yeni bilikləri öyrənməkdə böyük həvəs duyuram." },
  { id: 14, sectionId: 3, sectionName: "Kəşfiyyat",     reversed: false, text: "Müxtəlif düşüncə sistemlərini araşdırmaqdan zövq alıram." },
  { id: 15, sectionId: 3, sectionName: "Kəşfiyyat",     reversed: false, text: "Həqiqəti tapmaq mənim üçün vacibdir." },

  { id: 16, sectionId: 4, sectionName: "Şəxsiyyət",     reversed: false, text: "Özümə aid aydın dəyərlərim var və bunlara sadiqəm." },
  { id: 17, sectionId: 4, sectionName: "Şəxsiyyət",     reversed: false, text: "Öz dəyərlərimlə uyğun qərarlar qəbul edirəm." },
  { id: 18, sectionId: 4, sectionName: "Şəxsiyyət",     reversed: false, text: "Sərhədlərimi müəyyən edib onları qoruyuram." },
  { id: 19, sectionId: 4, sectionName: "Şəxsiyyət",     reversed: false, text: "Başqalarının gözləntilərinə görə özümü dəyişdirmirəm." },
  { id: 20, sectionId: 4, sectionName: "Şəxsiyyət",     reversed: false, text: "Öz yolumu seçmək mənim üçün vacibdir." },

  { id: 21, sectionId: 5, sectionName: "Strategiya",    reversed: false, text: "Hadisələrin arxasındakı nümunələri görürəm." },
  { id: 22, sectionId: 5, sectionName: "Strategiya",    reversed: false, text: "Həyatı bir oyun kimi qəbul etdikdə daha rahat hiss edirəm." },
  { id: 23, sectionId: 5, sectionName: "Strategiya",    reversed: false, text: "Hadisələrin səbəb-nəticə əlaqəsini analiz edirəm." },
  { id: 24, sectionId: 5, sectionName: "Strategiya",    reversed: false, text: "Uzunmüddətli strategiyalar qura bilirəm." },
  { id: 25, sectionId: 5, sectionName: "Strategiya",    reversed: false, text: "Sadəcə məlumat yığmaq deyil, anlamaq üçün öyrənirəm." },

  { id: 26, sectionId: 6, sectionName: "Transformasiya", reversed: false, text: "Diqqətimin həyat keyfiyyətimə birbaşa təsir etdiyini hiss edirəm." },
  { id: 27, sectionId: 6, sectionName: "Transformasiya", reversed: false, text: "Düşüncə qəlibimi dəyişdirərək xarici reallığımı transformasiya edə bilirəm." },
  { id: 28, sectionId: 6, sectionName: "Transformasiya", reversed: false, text: "Daxili transformasiya üzərində şüurlu işləyirəm." },
  { id: 29, sectionId: 6, sectionName: "Transformasiya", reversed: false, text: "Həyat hadisələrinin daha dərin mənalar daşıdığını dərk edirəm." },
  { id: 30, sectionId: 6, sectionName: "Transformasiya", reversed: false, text: "Daxilimin xaricimiə necə təsir etdiyini aydın görürəm." },

  { id: 31, sectionId: 7, sectionName: "Yaradıcılıq",   reversed: false, text: "Daxilimdən gələn yaradıcı enerjini hiss edirəm." },
  { id: 32, sectionId: 7, sectionName: "Yaradıcılıq",   reversed: false, text: "Yaratmaq mənim üçün vacibdir." },
  { id: 33, sectionId: 7, sectionName: "Yaradıcılıq",   reversed: false, text: "Başqaları üçün dəyər yaratmaq istəyirəm." },
  { id: 34, sectionId: 7, sectionName: "Yaradıcılıq",   reversed: false, text: "Öz unikal hədiyyəmi dünyaya vermək istəyirəm." },
  { id: 35, sectionId: 7, sectionName: "Yaradıcılıq",   reversed: false, text: "Məndən sonra qalacaq dəyər yaratmaq istəyirəm." },

  { id: 36, sectionId: 8, sectionName: "Mənbə",         reversed: false, text: "Müxtəlif rollara və kimliklərimə tarazlıqla yanaşa bilirəm." },
  { id: 37, sectionId: 8, sectionName: "Mənbə",         reversed: false, text: "Kimliklərimdə daxili sülh tapıram." },
  { id: 38, sectionId: 8, sectionName: "Mənbə",         reversed: false, text: "Sükut və daxili sakitlik mənə güc verir." },
  { id: 39, sectionId: 8, sectionName: "Mənbə",         reversed: false, text: "Özümü həm ayrı bir fərd, həm də kainatla bağlı hiss edirəm." },
  { id: 40, sectionId: 8, sectionName: "Mənbə",         reversed: false, text: "Sadəcə mövcud olmaq bəzən mənə kifayət edir." },
];

export const ANSWER_OPTIONS = [
  { value: 1, label: "Heç vaxt" },
  { value: 2, label: "Nadir hallarda" },
  { value: 3, label: "Bəzən" },
  { value: 4, label: "Tez-tez" },
  { value: 5, label: "Həmişə" },
];

export const TEST_STORAGE_KEY = "ibm_test_answers_v2";
