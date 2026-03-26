import { Component } from 'react';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-rose-50 via-white to-surface-100 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
          <div className="text-center animate-fadeIn max-w-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 shadow-xl shadow-rose-500/30 mb-6">
              <HiOutlineExclamationTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Something went wrong</h1>
            <p className="text-surface-500 mb-6">
              An unexpected error occurred. Please try refreshing the page or returning to the dashboard.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 text-sm font-semibold hover:bg-surface-50 dark:hover:bg-surface-800 transition">
                Refresh Page
              </button>
              <button onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-semibold shadow-lg shadow-primary-500/20 hover:-translate-y-0.5 transition-all">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
