import { lazy, Suspense, useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const LandingPage = lazy(() => import("@/pages/landing"));
const SignInPage = lazy(() => import("@/pages/auth/sign-in"));
const SignUpPage = lazy(() => import("@/pages/auth/sign-up"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/forgot-password"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/reset-password"));
const DashboardPage = lazy(() => import("@/pages/dashboard/index"));
const TestPage = lazy(() => import("@/pages/dashboard/test"));
const ResultsPage = lazy(() => import("@/pages/dashboard/results"));
const ProfilePage = lazy(() => import("@/pages/dashboard/profile"));
const CertificatesPage = lazy(() => import("@/pages/dashboard/certificates"));
const AdminPage = lazy(() => import("@/pages/admin/index"));
const JournalPage = lazy(() => import("@/pages/dashboard/journal/index"));
const TasksPage = lazy(() => import("@/pages/dashboard/tasks/index"));
const LeaderboardPage = lazy(() => import("@/pages/leaderboard/index"));
const VerifyPage = lazy(() => import("@/pages/verify"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

const basePath = (import.meta.env.BASE_URL || "").replace(/\/$/, "");

function PageSpinner() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center aurora-bg">
      <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function AuthCacheInvalidator() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
      qc.clear();
    }
    prevUserIdRef.current = userId;
  }, [user, qc]);

  return null;
}

function SuspendedPage() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center aurora-bg p-6">
      <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center shadow-xl border border-red-200/40">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-indigo-950 mb-3">Hesabınız bloklanmışdır</h1>
        <p className="text-indigo-950/60 mb-8 leading-relaxed">
          Hesabınız administrator tərəfindən müvəqqəti olaraq dayandırılmışdır. Ətraflı məlumat üçün bizimlə əlaqə saxlayın.
        </p>
        <a
          href={`${basePath}/sign-in`}
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Giriş səhifəsinə qayıt
        </a>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading, suspended } = useAuth();
  if (loading) return <PageSpinner />;
  if (suspended) return <SuspendedPage />;
  if (!user) return <Redirect to={`${basePath}/sign-in`} />;
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
        <Component />
      </Suspense>
    </DashboardLayout>
  );
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (user) return <Redirect to={`${basePath}/dashboard`} />;
  return (
    <Suspense fallback={<PageSpinner />}>
      <LandingPage />
    </Suspense>
  );
}

function AppRoutes() {
  return (
    <>
      <AuthCacheInvalidator />
      <Switch>
        <Route path="/" component={HomeRedirect} />

        <Route path="/sign-in">
          <Suspense fallback={<PageSpinner />}><SignInPage /></Suspense>
        </Route>
        <Route path="/sign-up">
          <Suspense fallback={<PageSpinner />}><SignUpPage /></Suspense>
        </Route>
        <Route path="/forgot-password">
          <Suspense fallback={<PageSpinner />}><ForgotPasswordPage /></Suspense>
        </Route>
        <Route path="/auth/reset-password">
          <Suspense fallback={<PageSpinner />}><ResetPasswordPage /></Suspense>
        </Route>
        <Route path="/verify/:code">
          <Suspense fallback={<PageSpinner />}><VerifyPage /></Suspense>
        </Route>

        <Route path="/dashboard"><ProtectedRoute component={DashboardPage} /></Route>
        <Route path="/test"><ProtectedRoute component={TestPage} /></Route>
        <Route path="/results/:id"><ProtectedRoute component={ResultsPage} /></Route>
        <Route path="/profile"><ProtectedRoute component={ProfilePage} /></Route>
        <Route path="/certificates"><ProtectedRoute component={CertificatesPage} /></Route>
        <Route path="/journal"><ProtectedRoute component={JournalPage} /></Route>
        <Route path="/tasks"><ProtectedRoute component={TasksPage} /></Route>
        <Route path="/leaderboard">
          <Suspense fallback={<PageSpinner />}><LeaderboardPage /></Suspense>
        </Route>
        <Route path="/admin"><ProtectedRoute component={AdminPage} /></Route>

        <Route>
          <Suspense fallback={<PageSpinner />}><NotFound /></Suspense>
        </Route>
      </Switch>
    </>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <AppRoutes />
          </QueryClientProvider>
        </AuthProvider>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
