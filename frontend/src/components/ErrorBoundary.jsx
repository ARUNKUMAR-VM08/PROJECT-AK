import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUNDARY — catches JS errors in the component tree
// Shows a graceful fallback UI rather than a blank white screen
// ─────────────────────────────────────────────────────────────────────────────

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production, send to error reporting service here (e.g. Sentry)
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        aria-live="assertive"
        className="min-h-screen flex items-center justify-center bg-pastel-cream px-6"
      >
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="w-20 h-20 bg-red-50 border-2 border-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="text-red-400" size={36} />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-pastel-navy">Something went wrong</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              We hit an unexpected error. This has been logged and our team will look into it.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-3 text-left text-[10px] bg-red-50 border border-red-100 rounded-xl p-3 text-red-500 overflow-auto max-h-32">
                {this.state.error.toString()}
              </pre>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={this.handleReset}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 text-sm transition-colors"
            >
              <RefreshCw size={15} />
              Return to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-white border border-brand-100 text-pastel-navy font-semibold py-3 rounded-full text-sm hover:bg-pastel-pink/30 transition-colors"
            >
              Try Reloading
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
