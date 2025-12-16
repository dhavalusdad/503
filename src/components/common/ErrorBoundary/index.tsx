import { Component, type ReactNode } from 'react';

import { captureException } from '@sentry/react';

import Error from '@/components/common/ErrorBoundary/Error';

// Define the types for the state
interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

// Define the types for the props (children is the only prop, and it's of type ReactNode)
interface ErrorBoundaryProps {
  children: ReactNode;
  path?: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Return a new state to render the fallback UI
    return { hasError: true, errorInfo: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // You can log the error to an external service
    // console.error('Error occurred: ', error);
    // console.error('Error info: ', info);
    captureException(error, {
      extra: { componentStack: info.componentStack },
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    // Reset error state when the path changes (user navigates to a different route)
    if (prevProps.path !== this.props.path && this.state.hasError) {
      this.setState({ hasError: false, errorInfo: null });
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI if an error is caught
      return <Error path={this.props.path} />;
    }

    // Render the children if no error
    return this.props.children;
  }
}

export default ErrorBoundary;

export * from '@/components/common/ErrorBoundary/ErrorElement';
export * from '@/components/common/ErrorBoundary/Error';
