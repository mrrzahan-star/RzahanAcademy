import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 aurora-bg px-4">
      <div className="text-center glass-card p-12 rounded-[3rem] max-w-lg w-full relative z-10">
        <div className="text-[120px] font-black text-primary/20 leading-none select-none mb-4">404</div>
        <h1 className="text-3xl font-bold text-indigo-950 mb-4">Səhifə tapılmadı</h1>
        <p className="text-indigo-900/60 mb-8">
          Axtardığınız səhifə mövcud deyil və ya başqa ünvana köçürülüb.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-xl font-bold bg-primary hover:bg-primary/90 w-full sm:w-auto">
            Ana səhifəyə qayıt
          </Button>
        </Link>
      </div>
    </div>
  );
}
