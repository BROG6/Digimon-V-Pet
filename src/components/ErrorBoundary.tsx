import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Digipet unhandled component error:', error, errorInfo);
  }

  private handleRecover = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-display">
          <div className="max-w-sm w-full bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-chakra font-bold text-lg text-white">DIGIVICE REBOOT</h2>
              <p className="text-slate-400 text-xs mt-1">
                A glitch occurred in the Digital World. Your Digimon data is safe in memory!
              </p>
            </div>
            {this.state.error && (
              <div className="p-2.5 bg-black/50 border border-slate-800 rounded-xl text-[10px] text-rose-300 font-mono text-left max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleRecover}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-pixel text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART DIGIVICE</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
