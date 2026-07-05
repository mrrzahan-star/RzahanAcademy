import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminFetch } from "./utils";
import { CrudSection } from "./cms/CrudSection";
import { ProgramsManager } from "./cms/ProgramsManager";
import {
  Package, BookOpen, Layers, FileText, Heart,
  Quote, CheckSquare, HelpCircle, Megaphone, Image,
  Home, FolderOpen, GraduationCap
} from "lucide-react";
import LandingConfigTab from "./LandingConfigTab";

interface Counts {
  packages: number; programs: number; modules: number; lessons: number;
  articles: number; lifeStories: number; quotes: number; faqs: number;
  announcements: number; media: number; taskDefinitions: number;
}

const STATUS_OPTS = ["draft", "published", "archived"];
const BOOL_OPTS = ["true", "false"];

function StatCard({ icon: Icon, label, count, color }: { icon: any; label: string; count: number; color: string }) {
  return (
    <div className="rounded-2xl border border-indigo-50 bg-white px-4 py-3 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-lg font-bold text-indigo-950 leading-none">{count}</p>
        <p className="text-xs text-indigo-400 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function CmsTab() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/cms/counts").then(setCounts).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* Overview */}
      {counts && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard icon={Package} label="Paketlər" count={counts.packages} color="bg-violet-100 text-violet-600" />
          <StatCard icon={GraduationCap} label="Proqramlar" count={counts.programs} color="bg-indigo-100 text-indigo-600" />
          <StatCard icon={Layers} label="Modullar" count={counts.modules} color="bg-blue-100 text-blue-600" />
          <StatCard icon={BookOpen} label="Dərslər" count={counts.lessons} color="bg-cyan-100 text-cyan-600" />
          <StatCard icon={FileText} label="Məqalələr" count={counts.articles} color="bg-emerald-100 text-emerald-600" />
          <StatCard icon={Heart} label="Hekayələr" count={counts.lifeStories} color="bg-pink-100 text-pink-600" />
          <StatCard icon={Quote} label="Fikirlər" count={counts.quotes} color="bg-amber-100 text-amber-600" />
          <StatCard icon={HelpCircle} label="FAQ" count={counts.faqs} color="bg-orange-100 text-orange-600" />
          <StatCard icon={Megaphone} label="Elanlar" count={counts.announcements} color="bg-red-100 text-red-600" />
          <StatCard icon={Image} label="Media" count={counts.media} color="bg-slate-100 text-slate-600" />
          <StatCard icon={CheckSquare} label="Tapşırıqlar" count={counts.taskDefinitions} color="bg-teal-100 text-teal-600" />
        </div>
      )}

      {/* Sub-tabs */}
      <Tabs defaultValue="packages">
        <div className="mb-5 bg-indigo-50/50 border border-indigo-100 rounded-xl p-1.5 overflow-x-auto">
          <TabsList className="flex flex-wrap gap-0.5 h-auto bg-transparent w-full min-w-max">
            {[
              { value: "packages", label: "📦 Paketlər" },
              { value: "programs", label: "🎓 Proqramlar" },
              { value: "prog-cats", label: "🗂 Proq. Kat." },
              { value: "modules", label: "🧩 Modullar" },
              { value: "lessons", label: "📖 Dərslər" },
              { value: "articles", label: "📰 Məqalələr" },
              { value: "art-cats", label: "🗂 Məq. Kat." },
              { value: "stories", label: "💌 Hekayələr" },
              { value: "story-cats", label: "🗂 Hek. Kat." },
              { value: "quotes", label: "💭 Günün Fikri" },
              { value: "task-defs", label: "✅ Tapşırıqlar" },
              { value: "faqs", label: "❓ FAQ" },
              { value: "announcements", label: "📢 Elanlar" },
              { value: "sliders", label: "🖼 Slider" },
              { value: "media", label: "📁 Media" },
              { value: "landing-page", label: "🏠 Landing Page" },
            ].map(t => (
              <TabsTrigger key={t.value} value={t.value}
                className="rounded-lg text-xs font-semibold whitespace-nowrap px-3 py-1.5 shrink-0">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* PACKAGES */}
        <TabsContent value="packages">
          <CrudSection
            title="Paketlər"
            endpoint="/packages"
            columns={[
              { key: "emoji", label: "Emoji" },
              { key: "name", label: "Ad" },
              { key: "slug", label: "Slug" },
              { key: "description", label: "Açıqlama" },
              { key: "isActive", label: "Aktiv" },
              { key: "sortOrder", label: "Sıra" },
            ]}
            fields={[
              { key: "emoji", label: "Emoji", placeholder: "🌱" },
              { key: "name", label: "Ad", required: true, placeholder: "Başlanğıc" },
              { key: "slug", label: "Slug", placeholder: "baslanqic (boş buraxsanız avtomatik)" },
              { key: "description", label: "Açıqlama", type: "textarea" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra nömrəsi", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0, emoji: "📦" }}
          />
        </TabsContent>

        {/* PROGRAMS */}
        <TabsContent value="programs">
          <ProgramsManager />
        </TabsContent>

        {/* PROGRAM CATEGORIES */}
        <TabsContent value="prog-cats">
          <CrudSection
            title="Proqram Kateqoriyaları"
            endpoint="/program-categories"
            columns={[
              { key: "name", label: "Ad" },
              { key: "slug", label: "Slug" },
              { key: "isActive", label: "Aktiv" },
              { key: "sortOrder", label: "Sıra" },
            ]}
            fields={[
              { key: "name", label: "Ad", required: true },
              { key: "slug", label: "Slug (boş = avtomatik)" },
              { key: "description", label: "Açıqlama", type: "textarea" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0 }}
          />
        </TabsContent>

        {/* MODULES */}
        <TabsContent value="modules">
          <CrudSection
            title="Modullar"
            endpoint="/modules"
            columns={[
              { key: "title", label: "Başlıq" },
              { key: "programId", label: "Proqram ID" },
              { key: "isActive", label: "Aktiv" },
              { key: "sortOrder", label: "Sıra" },
            ]}
            fields={[
              { key: "programId", label: "Proqram ID", type: "number", required: true },
              { key: "title", label: "Başlıq", required: true },
              { key: "description", label: "Açıqlama", type: "textarea" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0 }}
          />
        </TabsContent>

        {/* LESSONS */}
        <TabsContent value="lessons">
          <CrudSection
            title="Dərslər"
            endpoint="/lessons"
            columns={[
              { key: "title", label: "Başlıq" },
              { key: "moduleId", label: "Modul ID" },
              { key: "status", label: "Status" },
              { key: "durationMinutes", label: "Müddət (dəq.)" },
            ]}
            fields={[
              { key: "moduleId", label: "Modul ID", type: "number", required: true },
              { key: "title", label: "Başlıq", required: true },
              { key: "description", label: "Qısa Açıqlama", type: "textarea" },
              { key: "contentHtml", label: "Məzmun (HTML/Mətn)", type: "textarea" },
              { key: "youtubeUrl", label: "YouTube URL", type: "url" },
              { key: "audioUrl", label: "Audio URL", type: "url" },
              { key: "pdfUrl", label: "PDF URL", type: "url" },
              { key: "durationMinutes", label: "Video Müddəti (dəqiqə)", type: "number" },
              { key: "readingTimeMinutes", label: "Oxuma Müddəti (dəqiqə)", type: "number" },
              { key: "status", label: "Status", type: "status", options: STATUS_OPTS },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ status: "draft", sortOrder: 0 }}
          />
        </TabsContent>

        {/* ARTICLES */}
        <TabsContent value="articles">
          <CrudSection
            title="Məqalələr"
            endpoint="/articles"
            columns={[
              { key: "title", label: "Başlıq" },
              { key: "author", label: "Müəllif" },
              { key: "status", label: "Status" },
              { key: "isFeatured", label: "Seçilmiş" },
              { key: "isPinned", label: "Sabitlənmiş" },
              { key: "viewCount", label: "Baxış" },
            ]}
            fields={[
              { key: "title", label: "Başlıq", required: true },
              { key: "subtitle", label: "Alt Başlıq" },
              { key: "slug", label: "Slug (boş = avtomatik)" },
              { key: "author", label: "Müəllif", placeholder: "Rzahan" },
              { key: "readingTimeMinutes", label: "Oxuma Müddəti (dəq)", type: "number" },
              { key: "categoryId", label: "Kateqoriya ID", type: "number" },
              { key: "excerpt", label: "Xülasə", type: "textarea" },
              { key: "contentHtml", label: "Məzmun (HTML)", type: "textarea" },
              { key: "coverImageUrl", label: "Kapak Şəkil URL", type: "url" },
              { key: "tags", label: "Etikettlər (vergüllə)", placeholder: "psixologiya, inkişaf" },
              { key: "packageId", label: "Paket ID", type: "number" },
              { key: "status", label: "Status", type: "status", options: ["draft", "published", "archived"] },
              { key: "isFeatured", label: "Seçilmiş (Featured)?", type: "boolean" },
              { key: "isPinned", label: "Sabitlənmiş (Pinned)?", type: "boolean" },
              { key: "scheduledAt", label: "Planlaşdırılmış Yayım (ISO tarix)", placeholder: "2025-01-15T10:00:00Z" },
              { key: "seoTitle", label: "SEO Başlıq" },
              { key: "seoDescription", label: "SEO Açıqlama", type: "textarea" },
            ]}
            defaultValues={{ status: "draft", isFeatured: false, isPinned: false, author: "Rzahan" }}
          />
        </TabsContent>

        {/* ARTICLE CATEGORIES */}
        <TabsContent value="art-cats">
          <CrudSection
            title="Məqalə Kateqoriyaları"
            endpoint="/article-categories"
            columns={[
              { key: "name", label: "Ad" },
              { key: "slug", label: "Slug" },
              { key: "isActive", label: "Aktiv" },
            ]}
            fields={[
              { key: "name", label: "Ad", required: true },
              { key: "slug", label: "Slug (boş = avtomatik)" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0 }}
          />
        </TabsContent>

        {/* LIFE STORIES */}
        <TabsContent value="stories">
          <CrudSection
            title="Həyat Hekayələri"
            endpoint="/life-stories"
            columns={[
              { key: "title", label: "Başlıq" },
              { key: "author", label: "Müəllif" },
              { key: "status", label: "Status" },
              { key: "isFeatured", label: "Seçilmiş" },
              { key: "isPinned", label: "Sabitlənmiş" },
              { key: "viewCount", label: "Baxış" },
            ]}
            fields={[
              { key: "title", label: "Başlıq", required: true },
              { key: "slug", label: "Slug (boş = avtomatik)" },
              { key: "author", label: "Müəllif", placeholder: "Rzahan" },
              { key: "readingTimeMinutes", label: "Oxuma Müddəti (dəq)", type: "number" },
              { key: "categoryId", label: "Kateqoriya ID", type: "number" },
              { key: "excerpt", label: "Xülasə", type: "textarea" },
              { key: "contentHtml", label: "Məzmun (HTML)", type: "textarea" },
              { key: "imageUrl", label: "Şəkil URL", type: "url" },
              { key: "tags", label: "Etikettlər (vergüllə)", placeholder: "ailə, qərar" },
              { key: "packageId", label: "Paket ID", type: "number" },
              { key: "status", label: "Status", type: "status", options: ["draft", "published", "archived"] },
              { key: "isFeatured", label: "Seçilmiş (Featured)?", type: "boolean" },
              { key: "isPinned", label: "Sabitlənmiş (Pinned)?", type: "boolean" },
              { key: "scheduledAt", label: "Planlaşdırılmış Yayım (ISO tarix)", placeholder: "2025-01-15T10:00:00Z" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ status: "draft", sortOrder: 0, isFeatured: false, isPinned: false, author: "Rzahan" }}
          />
        </TabsContent>

        {/* STORY CATEGORIES */}
        <TabsContent value="story-cats">
          <CrudSection
            title="Hekayə Kateqoriyaları"
            endpoint="/story-categories"
            columns={[
              { key: "name", label: "Ad" },
              { key: "slug", label: "Slug" },
              { key: "isActive", label: "Aktiv" },
            ]}
            fields={[
              { key: "name", label: "Ad", required: true },
              { key: "slug", label: "Slug (boş = avtomatik)" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0 }}
          />
        </TabsContent>

        {/* QUOTES */}
        <TabsContent value="quotes">
          <CrudSection
            title="Günün Fikri — Sitatlar"
            endpoint="/quotes"
            columns={[
              { key: "text", label: "Sitat" },
              { key: "author", label: "Müəllif" },
              { key: "isActive", label: "Aktiv" },
              { key: "sortOrder", label: "Sıra" },
            ]}
            fields={[
              { key: "text", label: "Sitat mətni", type: "textarea", required: true },
              { key: "author", label: "Müəllif", placeholder: "Məs: Əli Rza" },
              { key: "source", label: "Mənbə (kitab, URL)" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0 }}
          />
        </TabsContent>

        {/* TASK DEFINITIONS */}
        <TabsContent value="task-defs">
          <CrudSection
            title="Günün Tapşırığı Tərifləri"
            endpoint="/task-definitions"
            columns={[
              { key: "title", label: "Başlıq" },
              { key: "description", label: "Açıqlama" },
              { key: "isActive", label: "Aktiv" },
              { key: "sortOrder", label: "Sıra" },
            ]}
            fields={[
              { key: "title", label: "Tapşırıq Başlığı", required: true },
              { key: "description", label: "Açıqlama", type: "textarea" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0 }}
          />
        </TabsContent>

        {/* FAQS */}
        <TabsContent value="faqs">
          <CrudSection
            title="Tez-tez Verilən Suallar"
            endpoint="/faqs"
            columns={[
              { key: "question", label: "Sual" },
              { key: "category", label: "Kateqoriya" },
              { key: "isActive", label: "Aktiv" },
            ]}
            fields={[
              { key: "question", label: "Sual", required: true, type: "textarea" },
              { key: "answer", label: "Cavab", required: true, type: "textarea" },
              { key: "category", label: "Kateqoriya", placeholder: "Məs: Ümumi, Ödəniş" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0 }}
          />
        </TabsContent>

        {/* ANNOUNCEMENTS */}
        <TabsContent value="announcements">
          <CrudSection
            title="Elanlar"
            endpoint="/announcements"
            columns={[
              { key: "title", label: "Başlıq" },
              { key: "status", label: "Status" },
              { key: "priority", label: "Prioritet" },
              { key: "startDate", label: "Başlanğıc" },
              { key: "endDate", label: "Bitmə" },
            ]}
            fields={[
              { key: "title", label: "Başlıq", required: true },
              { key: "content", label: "Məzmun", type: "textarea" },
              { key: "bannerImageUrl", label: "Banner Şəkil URL", type: "url" },
              { key: "priority", label: "Prioritet (0=normal, 10=yüksək)", type: "number" },
              { key: "packageId", label: "Paket ID (boş = hamı)", type: "number" },
              { key: "startDate", label: "Başlanğıc tarixi (ISO)", placeholder: "2025-01-01T00:00:00Z" },
              { key: "endDate", label: "Bitmə tarixi (ISO)", placeholder: "2025-12-31T23:59:00Z" },
              { key: "status", label: "Status", type: "status", options: ["draft", "published", "archived"] },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
            ]}
            defaultValues={{ isActive: true, priority: 0, status: "draft" }}
          />
        </TabsContent>

        {/* SLIDERS */}
        <TabsContent value="sliders">
          <CrudSection
            title="Slider / Banner"
            endpoint="/sliders"
            columns={[
              { key: "title", label: "Başlıq" },
              { key: "isActive", label: "Aktiv" },
              { key: "sortOrder", label: "Sıra" },
            ]}
            fields={[
              { key: "title", label: "Başlıq" },
              { key: "subtitle", label: "Alt Başlıq" },
              { key: "imageUrl", label: "Şəkil URL", type: "url" },
              { key: "linkUrl", label: "Keçid URL", type: "url" },
              { key: "isActive", label: "Aktiv?", type: "boolean" },
              { key: "sortOrder", label: "Sıra", type: "number" },
            ]}
            defaultValues={{ isActive: true, sortOrder: 0 }}
          />
        </TabsContent>

        {/* MEDIA */}
        <TabsContent value="media">
          <CrudSection
            title="Media Kitabxanası"
            endpoint="/media"
            columns={[
              { key: "originalName", label: "Fayl adı" },
              { key: "fileType", label: "Növ" },
              { key: "url", label: "URL" },
              { key: "altText", label: "Alt Mətn" },
            ]}
            fields={[
              { key: "originalName", label: "Fayl adı / Başlıq", required: true },
              { key: "url", label: "URL (xarici link)", type: "url", required: true },
              { key: "fileType", label: "Fayl növü", type: "select", options: ["image", "icon", "document", "pdf"] },
              { key: "altText", label: "Alt Mətn (şəkil üçün)" },
            ]}
            defaultValues={{ fileType: "image" }}
          />
        </TabsContent>

        {/* LANDING PAGE */}
        <TabsContent value="landing-page">
          <LandingConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
