import React, { ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch React errors
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error): void {
    console.error('ErrorBoundary caught error:', error);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-gray-600 mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
