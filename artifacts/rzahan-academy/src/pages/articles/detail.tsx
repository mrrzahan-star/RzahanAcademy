import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Clock, Eye, Star, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
const API = basePath;

interface ArticleDetail {
  id: number;
  title: string;
  subtitle: string | null;
  slug: string;
  contentHtml: string | null;
  excerpt: string | null;
  coverImageUrl: string | null;
  author: string | null;
  readingTimeMinutes: number | null;
  viewCount: number;
  isFeatured: boolean;
  tags: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  related: {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    author: string | null;
    readingTimeMinutes: number | null;
  }[];
}

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery<ArticleDetail>({
    queryKey: ["article", slug],
    queryFn: async () => {
      const r = await fetch(`${API}/api/articles/${slug}`);
      if (!r.ok) throw new Error("not_found");
      return r.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-indigo-100 rounded-xl w-3/4" />
          <div className="h-56 bg-indigo-50 rounded-2xl" />
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-indigo-50 rounded w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">😕</div>
        <p className="font-medium text-indigo-950">Məqalə tapılmadı</p>
        <Link href="/articles">
          <span className="text-primary text-sm mt-2 inline-block hover:underline">← Məqalələrə qayıt</span>
        </Link>
      </div>
    );
  }

  const tags = article.tags ? article.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/articles">
        <span className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-primary transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />Məqalələrə qayıt
        </span>
      </Link>

      {/* Hero image */}
      {article.coverImageUrl && (
        <div className="rounded-2xl overflow-hidden mb-6 shadow-lg">
          <img src={article.coverImageUrl} alt={article.title} className="w-full max-h-72 object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        {article.isFeatured && (
          <Badge className="bg-amber-100 text-amber-800 mb-3 gap-1">
            <Star className="h-3 w-3" />Seçilmiş Məqalə
          </Badge>
        )}
        <h1 className="text-2xl font-bold text-indigo-950 leading-snug mb-2">{article.title}</h1>
        {article.subtitle && <p className="text-indigo-500 text-base mb-3">{article.subtitle}</p>}

        <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-400">
          {article.author && (
            <span className="font-semibold text-indigo-600">{article.author}</span>
          )}
          {article.readingTimeMinutes && (
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{article.readingTimeMinutes} dəqiqə</span>
          )}
          <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{article.viewCount} baxış</span>
          <span>{new Date(article.createdAt).toLocaleDateString("az-AZ", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      {/* Divider */}
      <hr className="border-indigo-100 mb-6" />

      {/* Content */}
      {article.contentHtml ? (
        <div
          className="prose prose-indigo prose-sm max-w-none text-indigo-950/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.contentHtml }}
        />
      ) : article.excerpt ? (
        <p className="text-indigo-950/70 leading-relaxed">{article.excerpt}</p>
      ) : (
        <p className="text-indigo-400 italic">Məzmun tezliklə əlavə ediləcək...</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 items-center">
          <Tag className="h-4 w-4 text-indigo-400" />
          {tags.map(t => (
            <Badge key={t} variant="secondary" className="rounded-full text-xs">{t}</Badge>
          ))}
        </div>
      )}

      {/* Related */}
      {article.related && article.related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-indigo-950 mb-4">Əlaqəli Məqalələr</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {article.related.map(r => (
              <Link key={r.id} href={`/articles/${r.slug}`}>
                <div className="glass-card rounded-xl p-3 cursor-pointer hover:shadow-md transition-all border border-indigo-100/60">
                  {r.coverImageUrl && (
                    <img src={r.coverImageUrl} alt={r.title} className="w-full h-24 object-cover rounded-lg mb-2" />
                  )}
                  <p className="text-xs font-semibold text-indigo-950 line-clamp-2 leading-snug">{r.title}</p>
                  {r.readingTimeMinutes && (
                    <p className="text-[10px] text-indigo-400 mt-1 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />{r.readingTimeMinutes} dəq
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
