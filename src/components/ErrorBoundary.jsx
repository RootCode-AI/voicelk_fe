import { Component } from 'react';

/**
 * ErrorBoundary — catches unhandled React render/lifecycle errors.
 * Wrap around any component tree section you want to protect.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <MyComponent />
 *   </ErrorBoundary>
 *
 * Or with a custom fallback:
 *   <ErrorBoundary fallback={<p>Oops!</p>}>
 *     <MyComponent />
 *   </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log full details to console for developers
    console.error('[ErrorBoundary] Caught render error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    // Use custom fallback if provided
    if (this.props.fallback) return this.props.fallback;

    // Default fallback UI
    return (
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <div style={{
          maxWidth: 480, width: '100%', textAlign: 'center',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 16, padding: '40px 32px',
          boxShadow: '0 4px 24px rgba(239,68,68,0.08)',
        }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#fee2e2', margin: '0 auto 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>
            ⚠️
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#991b1b', margin: '0 0 10px 0' }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            An unexpected error occurred in the application. This has been noted.
            You can try reloading this section.
          </p>

          {/* Error detail (dev-friendly, collapsed) */}
          {this.state.error && (
            <details style={{ textAlign: 'left', marginBottom: 20 }}>
              <summary style={{ fontSize: 12, color: '#9ca3af', cursor: 'pointer', marginBottom: 8 }}>
                Technical details
              </summary>
              <pre style={{
                fontSize: 11, color: '#ef4444', background: '#fff',
                padding: 12, borderRadius: 8, border: '1px solid #fecaca',
                overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>
                {this.state.error.toString()}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              background: '#ef4444', color: '#fff', border: 'none',
              borderRadius: 9999, padding: '10px 28px',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
