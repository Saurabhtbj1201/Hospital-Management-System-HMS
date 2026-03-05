import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={36} />
            </div>
            <h1 className="text-2xl font-heading font-bold text-dark-900 mb-3">
              Something went wrong
            </h1>
            <p className="text-dark-500 mb-8">
              We apologize for the inconvenience. An unexpected error occurred. Please try refreshing the page.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-gray-200 text-dark-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                <Home size={16} />
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
