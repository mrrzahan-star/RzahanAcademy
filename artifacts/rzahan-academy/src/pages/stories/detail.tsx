import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Clock, Eye, Star, ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
const API = basePath;

interface StoryDetail {
  id: number;
  title: string;
  slug: string | null;
  contentHtml: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  author: string | null;
  readingTimeMinutes: number | null;
  viewCount: number;
  isFeatured: boolean;
  tags: string | null;
  createdAt: string;
  related: {
    id: number;
    title: string;
    slug: string | null;
    excerpt: string | null;
    imageUrl: string | null;
    author: string | null;
    readingTimeMinutes: number | null;
  }[];
}

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: story, isLoading, error } = useQuery<StoryDetail>({
    queryKey: ["story", id],
    queryFn: async () => {
      const r = await fetch(`${API}/api/stories/${id}`);
      if (!r.ok) throw new Error("not_found");
      return r.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-rose-100 rounded-xl w-3/4" />
          <div className="h-56 bg-rose-50 rounded-2xl" />
          <div className="space-y-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-rose-50 rounded w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-3">😕</div>
        <p className="font-medium text-indigo-950">Hekayə tapılmadı</p>
        <Link href="/stories">
          <span className="text-primary text-sm mt-2 inline-block hover:underline">← Hekayələrə qayıt</span>
        </Link>
      </div>
    );
  }

  const tags = story.tags ? story.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/stories">
        <span className="inline-flex items-center gap-1.5 text-sm text-indigo-500 hover:text-primary transition-colors mb-6 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />Hekayələrə qayıt
        </span>
      </Link>

      {/* Hero image */}
      {story.imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-6 shadow-lg">
          <img src={story.imageUrl} alt={story.title} className="w-full max-h-72 object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        {story.isFeatured && (
          <Badge className="bg-amber-100 text-amber-800 mb-3 gap-1">
            <Star className="h-3 w-3" />Seçilmiş Hekayə
          </Badge>
        )}
        <h1 className="text-2xl font-bold text-indigo-950 leading-snug mb-2">{story.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-400">
          {story.author && <span className="font-semibold text-rose-500">{story.author}</span>}
          {story.readingTimeMinutes && (
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{story.readingTimeMinutes} dəqiqə</span>
          )}
          <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" />{story.viewCount} baxış</span>
          <span>{new Date(story.createdAt).toLocaleDateString("az-AZ", { year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      <hr className="border-indigo-100 mb-6" />

      {/* Content */}
      {story.contentHtml ? (
        <div
          className="prose prose-indigo prose-sm max-w-none text-indigo-950/80 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: story.contentHtml }}
        />
      ) : story.excerpt ? (
        <p className="text-indigo-950/70 leading-relaxed">{story.excerpt}</p>
      ) : (
        <p className="text-indigo-400 italic">Məzmun tezliklə əlavə ediləcək...</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 items-center">
          <Tag className="h-4 w-4 text-indigo-400" />
          {tags.map(t => (
            <Badge key={t} variant="secondary" className="rounded-full text-xs bg-rose-50 text-rose-600">{t}</Badge>
          ))}
        </div>
      )}

      {/* Related */}
      {story.related && story.related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-lg font-bold text-indigo-950 mb-4">Əlaqəli Hekayələr</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {story.related.map(r => (
              <Link key={r.id} href={`/stories/${r.id}`}>
                <div className="glass-card rounded-xl p-3 cursor-pointer hover:shadow-md transition-all border border-indigo-100/60">
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt={r.title} className="w-full h-24 object-cover rounded-lg mb-2" />
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
