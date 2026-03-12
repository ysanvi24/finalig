import { Component } from 'react';

// Lazy-load Sentry to avoid circular deps — works even if Sentry is not configured
let SentryCaptureException = null;
import('../lib/sentry')
    .then(mod => { SentryCaptureException = mod.default?.captureException; })
    .catch(() => { /* Sentry not available — no-op */ });

/**
 * React Error Boundary — Crash-proof wrapper
 *
 * Catches rendering errors in any descendant component tree and shows
 * a user-friendly fallback UI instead of a white/blank screen.
 * Uses INLINE STYLES (no external CSS deps) so it ALWAYS renders
 * even if Tailwind/DaisyUI/CSS fails to load.
 *
 * Now reports all caught render errors to Sentry for production tracking.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('[ErrorBoundary] Uncaught render error:', error, errorInfo);

        // Report to Sentry with component stack context
        try {
            if (SentryCaptureException) {
                SentryCaptureException(error, {
                    contexts: { react: { componentStack: errorInfo?.componentStack } },
                    tags: { errorBoundary: this.props.name || 'root' },
                });
            }
        } catch { /* Sentry capture failed — never crash the boundary itself */ }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            // Inline styles — guaranteed to render regardless of CSS state
            return (
                <div style={{
                    minHeight: '100vh', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', backgroundColor: '#110a28', padding: 24,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}>
                    <div style={{
                        maxWidth: 420, width: '100%', backgroundColor: '#1a1040',
                        borderRadius: 16, border: '1px solid rgba(245,197,24,0.28)', padding: 32,
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                        <h2 style={{ color: '#f5c518', fontSize: 22, fontWeight: 700, margin: '0 0 12px 0' }}>
                            Something went wrong
                        </h2>
                        <p style={{ color: '#e0d4f5', fontSize: 14, lineHeight: 1.6, margin: '0 0 20px 0' }}>
                            An unexpected error occurred. Please try refreshing the page.
                            If the problem persists, contact the admin team.
                        </p>

                        {/* Show error in dev only */}
                        {import.meta.env.DEV && this.state.error && (
                            <details style={{
                                textAlign: 'left', backgroundColor: '#241558', borderRadius: 8,
                                padding: 12, fontSize: 11, maxHeight: 150, overflow: 'auto', marginBottom: 16,
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 12, marginBottom: 6, color: '#f5c518' }}>
                                    Error Details
                                </summary>
                                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#e0d4f5', margin: 0 }}>
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack && ('\n\nComponent Stack:' + this.state.errorInfo.componentStack)}
                                </pre>
                            </details>
                        )}

                        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                            <button onClick={this.handleReset} style={{
                                backgroundColor: '#f5c518', color: '#110a28', border: 'none',
                                borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            }}>
                                Try Again
                            </button>
                            <button onClick={() => window.location.reload()} style={{
                                backgroundColor: 'transparent', color: '#e0d4f5',
                                border: '1px solid rgba(245,197,24,0.28)', borderRadius: 10,
                                padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                            }}>
                                Reload Page
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
