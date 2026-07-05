import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Clock, Eye, Star, Pin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
const API = basePath;

interface Story {
  id: number;
  title: string;
  slug: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  author: string | null;
  readingTimeMinutes: number | null;
  viewCount: number;
  categoryId: number | null;
  isFeatured: boolean;
  isPinned: boolean;
  tags: string | null;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

function StoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.id}`}>
      <div className="glass-card rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group border border-indigo-100/60 h-full flex flex-col">
        <div className="relative">
          {story.imageUrl ? (
            <img src={story.imageUrl} alt={story.title} className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-32 bg-gradient-to-br from-rose-100 to-orange-100 flex items-center justify-center text-4xl">💌</div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            {story.isFeatured && (
              <span className="bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Star className="h-2.5 w-2.5" />Seçilmiş
              </span>
            )}
            {story.isPinned && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Pin className="h-2.5 w-2.5" />Sabitlənmiş
              </span>
            )}
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-indigo-950 text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">{story.title}</h3>
          {story.excerpt && <p className="text-xs text-indigo-950/60 line-clamp-3 flex-1 mb-3">{story.excerpt}</p>}
          <div className="flex items-center gap-3 text-[11px] text-indigo-400 mt-auto">
            {story.readingTimeMinutes && (
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{story.readingTimeMinutes} dəq</span>
            )}
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{story.viewCount}</span>
            {story.author && <span className="ml-auto font-medium text-rose-500">{story.author}</span>}
          </div>
          {story.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {story.tags.split(",").slice(0, 3).map(t => (
                <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 bg-rose-50 text-rose-600">{t.trim()}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function StoriesPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sort, setSort] = useState("newest");
  const [featured, setFeatured] = useState(false);

  const params = new URLSearchParams();
  if (selectedCategory) params.set("category", selectedCategory);
  if (featured) params.set("featured", "true");
  params.set("sort", sort);

  const { data, isLoading } = useQuery<{ data: Story[] }>({
    queryKey: ["stories", selectedCategory, sort, featured],
    queryFn: async () => {
      const r = await fetch(`${API}/api/stories?${params}`);
      return r.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["story-categories"],
    queryFn: async () => {
      const r = await fetch(`${API}/api/stories/categories`);
      return r.json();
    },
  });

  const stories = data?.data ?? [];
  const filtered = search
    ? stories.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.excerpt?.toLowerCase().includes(search.toLowerCase()))
    : stories;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-indigo-950">💌 Həyat Hekayələri</h1>
        <p className="text-indigo-950/60 text-sm mt-1">Həyatdan ilham verən hekayələr</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white/60 rounded-2xl p-4 border border-indigo-100">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
          <Input
            placeholder="Axtarış..."
            className="pl-9 rounded-xl border-indigo-100"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-44 rounded-xl border-indigo-100">
            <SelectValue placeholder="Kateqoriya" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Hamısı</SelectItem>
            {(categories ?? []).map(c => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40 rounded-xl border-indigo-100">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Ən Yeni</SelectItem>
            <SelectItem value="popular">Ən Çox Oxunan</SelectItem>
            <SelectItem value="featured">Seçilmişlər</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={featured ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
          onClick={() => setFeatured(f => !f)}
        >
          <Star className="h-3.5 w-3.5 mr-1" />Seçilmiş
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card rounded-2xl h-72 animate-pulse bg-rose-50/50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-indigo-950/40">
          <div className="text-5xl mb-3">💌</div>
          <p className="font-medium">Heç bir hekayə tapılmadı</p>
          <p className="text-sm mt-1">Tezliklə yeni hekayələr əlavə ediləcək</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => <StoryCard key={s.id} story={s} />)}
        </div>
      )}
    </div>
  );
}
