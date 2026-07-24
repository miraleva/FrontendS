import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-8 text-center font-sans dark:border-rose-900/50 dark:bg-rose-950/20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 shadow-sm">
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Bir şeyler ters gitti
          </h3>

          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">
            Beklenmeyen bir hata oluştu. Sayfayı yenileyerek veya geri dönerek tekrar deneyebilirsiniz.
          </p>

          {this.state.error?.message && (
            <div className="mt-4 max-w-lg rounded-xl bg-slate-900/90 p-3 text-left font-mono text-xs text-rose-300 dark:bg-slate-950/80">
              {this.state.error.message}
            </div>
          )}

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-rose-700"
          >
            <RefreshCw size={16} />
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
