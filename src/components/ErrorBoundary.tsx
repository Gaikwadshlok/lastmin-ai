import React from 'react';

interface ErrorBoundaryState { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Unexpected UI error:', error, info);
  }

  handleReload = () => window.location.reload();

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 text-center">
          <div className="space-y-4 max-w-md">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground break-words">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={this.handleReload} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Reload</button>
              <button onClick={() => this.setState({ hasError: false, error: undefined })} className="px-4 py-2 rounded-md border text-sm">Dismiss</button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
