import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { logError } from '../utils/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorInfo: error.stack 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to Sentry
    logError(error, this.props.context || 'error-boundary', {
      errorInfo: errorInfo.componentStack,
      errorBoundaryProps: {
        context: this.props.context,
        hasFallback: !!this.props.fallback
      },
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-beach-50 to-beach-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
            <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We've encountered an unexpected error. Our team has been notified and is working to fix this issue.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="w-full bg-beach-600 hover:bg-beach-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition duration-200"
              >
                Go to Homepage
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg text-xs font-mono text-gray-700 overflow-auto max-h-40">
                  <p className="font-semibold text-red-600 mb-2">{this.state.error.name}: {this.state.error.message}</p>
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

