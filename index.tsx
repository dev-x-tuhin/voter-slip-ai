import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';

// CRITICAL: Polyfill process for browser environments (GitHub Pages)
// This must run before any other imports that might use process.env
if (typeof window !== 'undefined') {
  if (!(window as any).process) {
    (window as any).process = {};
  }
  if (!(window as any).process.env) {
    (window as any).process.env = {};
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', marginTop: '50px' }}>
          <h1 style={{ color: '#e11d48' }}>Something went wrong.</h1>
          <p style={{ color: '#4b5563' }}>{this.state.error?.toString()}</p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>Check the console for more details.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '10px 20px', 
              marginTop: '20px',
              backgroundColor: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
