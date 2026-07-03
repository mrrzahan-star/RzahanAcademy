import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useGetDashboardStats, getGetDashboardStatsQueryKey, useGetLatestTestResult, getGetLatestTestResultQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, Activity, Award, Calendar, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({ query: { queryKey: getGetDashboardStatsQueryKey() } });
  const { data: latestResult, isLoading: resultLoading } = useGetLatestTestResult({ query: { queryKey: getGetLatestTestResultQueryKey() } });

  if (statsLoading || resultLoading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-indigo-950 tracking-tight">İdarə Paneli</h1>
          <p className="text-indigo-900/60 mt-1">İnkişaf səyahətinizə xoş gəlmisiniz.</p>
        </div>
        <Link href="/test">
          <Button size="lg" className="rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Yeni Test Başla
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-none shadow-[0_4px_20px_0_rgba(91,95,239,0.05)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary">
                <Target className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-indigo-900/40 uppercase">Səviyyə</span>
            </div>
            <div className="text-3xl font-black text-indigo-950">{stats?.latestStage || 0}/7</div>
            <div className="text-sm font-medium text-indigo-600 mt-1">{stats?.latestStageName || "Başlamayıb"}</div>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-none shadow-[0_4px_20px_0_rgba(91,95,239,0.05)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-indigo-900/40 uppercase">Testlər</span>
            </div>
            <div className="text-3xl font-black text-indigo-950">{stats?.totalTests || 0}</div>
            <div className="text-sm font-medium text-indigo-900/60 mt-1">Tamamlanmış test</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-[0_4px_20px_0_rgba(91,95,239,0.05)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary">
                <Award className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-indigo-900/40 uppercase">Sertifikat</span>
            </div>
            <div className="text-3xl font-black text-indigo-950">{stats?.hasCertificate ? "Var" : "Yoxdur"}</div>
            <div className="text-sm font-medium text-indigo-900/60 mt-1">Status</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-none shadow-[0_4px_20px_0_rgba(91,95,239,0.05)]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="text-sm font-bold text-indigo-900/40 uppercase">Ardıcıl</span>
            </div>
            <div className="text-3xl font-black text-indigo-950">{stats?.streakDays || 0}</div>
            <div className="text-sm font-medium text-indigo-900/60 mt-1">Gün aktivlik</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-none shadow-[0_4px_20px_0_rgba(91,95,239,0.05)] h-full overflow-hidden relative">
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-indigo-950">İnkişaf Qrafiki</CardTitle>
              <CardDescription>Test nəticələrinizə əsasən hesablanan irəliləyiş</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex justify-between text-sm font-semibold">
                <span className="text-indigo-950">Ümumi İnkişaf</span>
                <span className="text-primary">{stats?.progressPercent || 0}%</span>
              </div>
              <Progress value={stats?.progressPercent || 0} className="h-3 rounded-full bg-indigo-50 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-accent" />
              
              <div className="mt-8">
                {latestResult ? (
                  <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-indigo-950 mb-1">Son Nəticə: {latestResult.stageName}</h4>
                      <p className="text-sm text-indigo-900/60">Tarix: {new Date(latestResult.createdAt).toLocaleDateString("az-AZ")}</p>
                    </div>
                    <Link href={`/results/${latestResult.id}`}>
                      <Button variant="outline" className="rounded-xl bg-white border-indigo-200 text-indigo-950 hover:bg-indigo-50">
                        Detallı Bax <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-indigo-900/50 mb-4">Hələ heç bir test nəticəniz yoxdur.</p>
                    <Link href="/test">
                      <Button className="rounded-xl font-bold bg-primary hover:bg-primary/90">Testə Başla</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-none shadow-[0_4px_20px_0_rgba(91,95,239,0.05)] bg-gradient-to-br from-indigo-950 to-indigo-900 text-white h-full relative overflow-hidden">
            <div className="absolute inset-0 aurora-bg opacity-30 pointer-events-none" />
            <CardContent className="p-8 relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 mb-6 backdrop-blur-md">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Sertifikat Alın</h3>
                <p className="text-indigo-200 leading-relaxed mb-8">
                  Mərhələni tamamlayın və inkişafınızı təsdiqləyən rəsmi rəqəmsal sertifikat əldə edin.
                </p>
              </div>
              <Link href="/certificates">
                <Button className="w-full h-12 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold">
                  Sertifikatlara Bax
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
