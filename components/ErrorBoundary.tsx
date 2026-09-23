import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Đã có lỗi xảy ra. Vui lòng thử lại sau.";
      
      try {
        // Check if it's a Firestore JSON error
        const parsed = JSON.parse(this.state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Lỗi hệ thống (${parsed.operationType}): ${parsed.error}. Vui lòng liên hệ quản trị viên.`;
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen bg-[#f4f7fa] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2.5rem] shadow-2xl border border-amber-200/60 max-w-md w-full">
            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-playfair font-bold text-[#0f1f38] mb-4">Ối! Có lỗi rồi nàng ơi</h2>
            <p className="text-slate-600 mb-8 text-sm font-medium">{errorMessage}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#0f1f38] text-amber-300 border border-amber-400/40 font-bold py-4 rounded-2xl shadow-lg hover:bg-[#1a2f4d] transition-all active:scale-95"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
