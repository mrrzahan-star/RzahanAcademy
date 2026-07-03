import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : "Naməlum xəta";
    return { hasError: true, message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50 px-4">
          <div className="text-center max-w-md w-full">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-indigo-950 mb-3">Xəta baş verdi</h1>
            <p className="text-indigo-900/60 mb-8 text-sm leading-relaxed">
              Gözlənilməz bir problem yarandı. Səhifəni yeniləyin və ya ana səhifəyə qayıdın.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => window.location.reload()} className="rounded-xl font-bold bg-primary hover:bg-primary/90">
                Səhifəni Yenilə
              </Button>
              <Button variant="outline" onClick={() => { this.setState({ hasError: false, message: "" }); window.location.href = "/"; }}
                className="rounded-xl font-bold border-indigo-200">
                Ana Səhifə
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
