import { useGetMyProfile, getGetMyProfileQueryKey, useUpsertProfile, useListTestResults, getListTestResultsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { Save, TrendingUp, Award, BookOpen } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { STAGES } from "@/lib/constants";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

const profileSchema = z.object({
  firstName: z.string().min(2, "Ad ən azı 2 simvol olmalıdır"),
  lastName: z.string().min(2, "Soyad ən azı 2 simvol olmalıdır"),
  bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useGetMyProfile({
    query: { queryKey: getGetMyProfileQueryKey() }
  });

  const { data: testResults } = useListTestResults({
    query: { queryKey: getListTestResultsQueryKey(), retry: false }
  });

  const upsertProfile = useUpsertProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "", bio: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        bio: profile.bio || "",
      });
    }
  }, [profile, form]);

  const onSubmit = (data: ProfileFormValues) => {
    upsertProfile.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Profil yeniləndi" });
        queryClient.invalidateQueries({ queryKey: getGetMyProfileQueryKey() });
      },
      onError: () => {
        toast({ title: "Xəta baş verdi", variant: "destructive" });
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  const latestStage = profile?.consciousnessLevel ?? 1;
  const latestStageInfo = STAGES.find(s => s.id === latestStage) || STAGES[0];
  const devPercent = Math.round((latestStage / 7) * 100);

  const chartData = (testResults || []).slice().reverse().map((r, i) => ({
    name: `Test ${i + 1}`,
    mərhələ: r.stage,
    bal: r.totalScore,
  }));

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-indigo-950">Profil</h1>

      {/* Current stage summary */}
      {profile?.consciousnessLevel && (
        <Card className="rounded-2xl border-none shadow-sm bg-gradient-to-br from-indigo-950 to-primary text-white overflow-hidden relative">
          <div className="absolute inset-0 aurora-bg opacity-20 pointer-events-none" />
          <CardContent className="p-6 relative z-10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0" style={{ boxShadow: `0 0 24px ${latestStageInfo.color}40` }}>
              <latestStageInfo.icon className="h-8 w-8" style={{ color: latestStageInfo.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">Son Nəticəniz</div>
              <div className="text-2xl font-black text-white mb-2">{latestStageInfo.name} Mərhələsi</div>
              <div className="flex items-center gap-3">
                <Progress value={devPercent} className="h-2 flex-1 bg-white/20 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-primary" />
                <span className="text-sm font-bold text-indigo-200">{devPercent}%</span>
              </div>
            </div>
            <Link href="/test">
              <Button className="rounded-2xl font-bold bg-white text-indigo-950 hover:bg-indigo-50 h-10 px-5 shadow-lg shrink-0 hidden sm:flex">
                Yenilə
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Progress chart */}
      {chartData.length > 1 && (
        <Card className="rounded-2xl border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-950 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> İnkişaf Qrafiki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6366f1" }} />
                <YAxis domain={[1, 7]} ticks={[1,2,3,4,5,6,7]} tick={{ fontSize: 11, fill: "#6366f1" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 4px 20px rgba(91,95,239,0.15)" }}
                  formatter={(v: number) => [`Mərhələ ${v}`, "Şüur Mərhələsi"]}
                />
                <Line
                  type="monotone"
                  dataKey="mərhələ"
                  stroke="#5B5FEF"
                  strokeWidth={3}
                  dot={{ fill: "#5B5FEF", r: 5 }}
                  activeDot={{ r: 7, fill: "#8B5CF6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Test history */}
      {testResults && testResults.length > 0 && (
        <Card className="rounded-2xl border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-950 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" /> Test Tarixçəsi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {testResults.slice(0, 5).map((r) => {
              const s = STAGES.find(st => st.id === r.stage) || STAGES[0];
              return (
                <Link key={r.id} href={`/results/${r.id}`}>
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50/80 hover:bg-indigo-50/60 border border-indigo-50 hover:border-primary/20 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${s.color}20` }}>
                      <s.icon className="h-5 w-5" style={{ color: s.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-indigo-950 text-sm">{s.name} Mərhələsi</div>
                      <div className="text-xs text-indigo-900/50">
                        {new Date(r.createdAt).toLocaleDateString("az-AZ")} · Bal: {r.totalScore}/200
                      </div>
                    </div>
                    <div className="text-xs font-black text-primary">{Math.round((r.totalScore / 200) * 100)}%</div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/journal">
          <div className="p-4 rounded-2xl bg-white border border-indigo-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold text-indigo-950 text-sm">Şüur Jurnalı</span>
          </div>
        </Link>
        <Link href="/tasks">
          <div className="p-4 rounded-2xl bg-white border border-indigo-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer flex items-center gap-3">
            <Award className="h-5 w-5 text-primary" />
            <span className="font-semibold text-indigo-950 text-sm">Tapşırıqlar</span>
          </div>
        </Link>
      </div>

      {/* Profile form */}
      <Card className="rounded-[2rem] border-none shadow-[0_8px_30px_rgb(91,95,239,0.05)]">
        <CardHeader className="p-8 border-b border-indigo-50">
          <CardTitle className="text-2xl text-indigo-950">Şəxsi Məlumatlar</CardTitle>
          <CardDescription className="text-indigo-900/60">Platformadakı kimliyinizi idarə edin</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-950 font-semibold">Ad</FormLabel>
                      <FormControl>
                        <Input placeholder="Adınız" {...field} className="rounded-xl border-indigo-100 bg-slate-50 focus-visible:ring-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-indigo-950 font-semibold">Soyad</FormLabel>
                      <FormControl>
                        <Input placeholder="Soyadınız" {...field} className="rounded-xl border-indigo-100 bg-slate-50 focus-visible:ring-primary h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-indigo-950 font-semibold">Haqqınızda</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Özünüz haqqında qısa məlumat..."
                        {...field}
                        className="rounded-xl border-indigo-100 bg-slate-50 focus-visible:ring-primary min-h-[120px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={upsertProfile.isPending} className="w-full sm:w-auto rounded-xl font-bold bg-primary hover:bg-primary/90 h-12 px-8 shadow-lg shadow-primary/20">
                {upsertProfile.isPending ? "Saxlanılır..." : <><Save className="mr-2 h-4 w-4" /> Yadda Saxla</>}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
