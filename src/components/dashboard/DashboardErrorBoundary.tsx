/**
 * DashboardErrorBoundary - Catches rendering errors on Home page
 * 
 * Ensures Home page always displays something even if components crash
 * Prevents blank screen bugs from uncaught errors
 */

import React, { type ReactNode } from 'react';
import styles from './DashboardErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[DashboardErrorBoundary] Component error:', error);
    console.error('[DashboardErrorBoundary] Error info:', info);
    
    // You can also log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h2 className={styles.errorTitle}>Something went wrong</h2>
            <p className={styles.errorMessage}>
              We encountered an error while loading the dashboard.
              Please try refreshing the page.
            </p>
            <button 
              className={styles.refreshButton}
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            {import.meta.env.DEV && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error details (dev only)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
